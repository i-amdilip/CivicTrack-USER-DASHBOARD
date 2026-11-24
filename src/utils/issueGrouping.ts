import { CivicIssue } from '../types/civic';

export interface ProblemGroup {
  groupId: string;
  primaryIssue: CivicIssue;
  reports: CivicIssue[];
  reportCount: number;
  spreadMeters: number;
  totalSupporters: number;
  totalAffected: number;
  myReport?: CivicIssue;
}

const EARTH_RADIUS_METERS = 6371000;
export const AUTO_GROUP_RADIUS_METERS = 1000;

export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Checks whether two civic issues belong to the same automated problem group
 * based on matching category, same Delhi locality, and coordinate proximity.
 */
export function isSameProblemByLocation(
  a: Pick<CivicIssue, 'category' | 'neighborhood' | 'latitude' | 'longitude'>,
  b: Pick<CivicIssue, 'category' | 'neighborhood' | 'latitude' | 'longitude'>,
  maxMeters = AUTO_GROUP_RADIUS_METERS
): boolean {
  if (a.category !== b.category) return false;
  if (a.neighborhood.toLowerCase() !== b.neighborhood.toLowerCase()) return false;
  return (
    getDistanceMeters(a.latitude, a.longitude, b.latitude, b.longitude) <=
    maxMeters
  );
}

/**
 * Automatically clusters civic reports that share the same category and
 * nearby Delhi location (<= 1 km).
 */
export function groupIssuesByLocation(issues: CivicIssue[]): ProblemGroup[] {
  const visited = new Set<string>();
  const groups: ProblemGroup[] = [];

  for (const seed of issues) {
    if (visited.has(seed.id)) continue;
    visited.add(seed.id);

    const cluster: CivicIssue[] = [seed];

    // Expand cluster transitively for nearby same-category issues
    let idx = 0;
    while (idx < cluster.length) {
      const current = cluster[idx];
      for (const candidate of issues) {
        if (visited.has(candidate.id)) continue;
        if (isSameProblemByLocation(current, candidate)) {
          visited.add(candidate.id);
          cluster.push(candidate);
        }
      }
      idx += 1;
    }

    // Primary issue = highest supporters (tie-broken by earliest submission)
    const sortedReports = [...cluster].sort((a, b) => {
      if (b.supporters !== a.supporters) return b.supporters - a.supporters;
      return a.submittedDate.localeCompare(b.submittedDate);
    });

    const primaryIssue = sortedReports[0];

    let maxSpread = 0;
    for (let i = 0; i < sortedReports.length; i++) {
      for (let j = i + 1; j < sortedReports.length; j++) {
        const dist = getDistanceMeters(
          sortedReports[i].latitude,
          sortedReports[i].longitude,
          sortedReports[j].latitude,
          sortedReports[j].longitude
        );
        if (dist > maxSpread) maxSpread = dist;
      }
    }

    const totalSupporters = sortedReports.reduce(
      (sum, item) => sum + item.supporters,
      0
    );
    const totalAffected = sortedReports.reduce(
      (sum, item) => sum + item.affectedCitizens,
      0
    );
    const myReport = sortedReports.find((r) => r.isMine);

    groups.push({
      groupId: `GRP-${primaryIssue.id}`,
      primaryIssue,
      reports: sortedReports,
      reportCount: sortedReports.length,
      spreadMeters: maxSpread,
      totalSupporters,
      totalAffected,
      myReport,
    });
  }

  return groups;
}
