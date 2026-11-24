import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  Layers,
  MapPin,
  Plus,
  Search,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { IssueImage } from '../components/IssueImage';
import { SeverityLabel, StatusLabel } from '../components/StatusLabel';
import { useCivic } from '../context/CivicContext';
import { DELHI_LOCALITIES } from '../data/mockData';
import { IssueCategory } from '../types/civic';
import { groupIssuesByLocation } from '../utils/issueGrouping';

type SortOption = 'recent' | 'supporters' | 'affected';

const CATEGORIES: ('All' | IssueCategory)[] = [
  'All',
  'Road & Sidewalk',
  'Street Lighting',
  'Waste & Sanitation',
  'Water & Drainage',
  'Parks & Trees',
  'Traffic & Signage',
];

export const CommunityPage: React.FC = () => {
  const { issues, profile, updateProfile, toggleSupport } = useCivic();

  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | IssueCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('supporters');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const handleChooseLocality = (locality: string) => {
    setSelectedLocality(locality);
    if (locality !== 'All Delhi' && DELHI_LOCALITIES.includes(locality)) {
      updateProfile({ ...profile, neighborhood: locality });
    }
  };

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const localityIssues = useMemo(() => {
    if (!selectedLocality || selectedLocality === 'All Delhi') return issues;
    return issues.filter((i) => i.neighborhood === selectedLocality);
  }, [issues, selectedLocality]);

  const filteredIssues = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localityIssues.filter((issue) => {
      if (categoryFilter !== 'All' && issue.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return `${issue.title} ${issue.location} ${issue.neighborhood} ${issue.category} ${issue.id}`
        .toLowerCase()
        .includes(q);
    });
  }, [localityIssues, query, categoryFilter]);

  const allGroupsInLocality = useMemo(
    () => groupIssuesByLocation(filteredIssues),
    [filteredIssues]
  );

  const multiReportGroups = useMemo(() => {
    return allGroupsInLocality
      .filter((g) => g.reportCount > 1)
      .sort((a, b) => {
        if (sortBy === 'supporters') return b.totalSupporters - a.totalSupporters;
        if (sortBy === 'affected') return b.totalAffected - a.totalAffected;
        return b.primaryIssue.submittedDate.localeCompare(
          a.primaryIssue.submittedDate
        );
      });
  }, [allGroupsInLocality, sortBy]);

  const groupMembershipMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const grp of allGroupsInLocality) {
      if (grp.reportCount > 1) {
        for (const r of grp.reports) {
          map.set(r.id, grp.reportCount);
        }
      }
    }
    return map;
  }, [allGroupsInLocality]);

  const totalSupporters = localityIssues.reduce((acc, i) => acc + i.supporters, 0);
  const resolvedCount = localityIssues.filter(
    (i) => i.status === 'Resolved'
  ).length;
  const activeIssuesCount = localityIssues.filter(
    (i) => i.status !== 'Resolved'
  ).length;
  const totalGroupedClusters = useMemo(
    () => groupIssuesByLocation(localityIssues).filter((g) => g.reportCount > 1).length,
    [localityIssues]
  );

  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      if (sortBy === 'supporters') return b.supporters - a.supporters;
      if (sortBy === 'affected') return b.affectedCitizens - a.affectedCitizens;
      return b.submittedDate.localeCompare(a.submittedDate);
    });
  }, [filteredIssues, sortBy]);

  if (!selectedLocality) {
    return (
      <div className="max-w-2xl mx-auto mt-4 bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 space-y-5 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div>
          <h2 className="text-[19px] font-bold text-[#111827]">
            Select your area in Delhi
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Choose where you live in Delhi to view local issues and automatically grouped complaints in your area.
          </p>
        </div>

        <div>
          <label
            htmlFor="delhi-locality-select"
            className="block text-sm font-medium text-[#111827] mb-1.5"
          >
            Delhi Locality
          </label>
          <select
            id="delhi-locality-select"
            value=""
            onChange={(e) => {
              if (e.target.value) handleChooseLocality(e.target.value);
            }}
            className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
          >
            <option value="" disabled>
              Select a locality in Delhi...
            </option>
            {DELHI_LOCALITIES.map((loc) => (
              <option key={loc} value={loc}>
                {loc}, Delhi
              </option>
            ))}
            <option value="All Delhi">All Delhi Localities</option>
          </select>
        </div>

        <div className="pt-4 border-t border-[#F0EFEA]">
          <p className="text-xs font-medium text-[#6B7280] mb-3">
            Or pick directly:
          </p>
          <div className="flex flex-wrap gap-2">
            {DELHI_LOCALITIES.map((loc) => {
              const count = issues.filter((i) => i.neighborhood === loc).length;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleChooseLocality(loc)}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-[#E2E0D8] bg-[#FAF9F6] text-[#111827] hover:border-[#0038A8] hover:text-[#0038A8] hover:bg-[#EFF6FF] transition-colors tabular-nums"
                >
                  {loc} ({count})
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleChooseLocality('All Delhi')}
              className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-[#E2E0D8] bg-[#F5F4F0] text-[#4B5563] hover:text-[#111827] transition-colors tabular-nums"
            >
              All Delhi ({issues.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Selected Delhi Area Banner */}
      <section className="bg-[#0038A8] text-white rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[0_4px_18px_rgba(0,56,168,0.14)]">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-white" strokeWidth={1.8} />
          </div>
          <div>
            <span className="text-white/80 text-xs block">Selected Delhi Area</span>
            <span className="font-bold text-white text-[15px]">
              {selectedLocality === 'All Delhi'
                ? 'All Delhi Localities'
                : `${selectedLocality}, Delhi`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <label
            htmlFor="change-delhi-locality"
            className="text-xs font-medium text-white/85"
          >
            Change area:
          </label>
          <select
            id="change-delhi-locality"
            value={selectedLocality}
            onChange={(e) => handleChooseLocality(e.target.value)}
            className="h-9 px-3 text-xs bg-white border border-white/20 rounded-xl text-[#111827] font-semibold focus:outline-none"
          >
            {DELHI_LOCALITIES.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
            <option value="All Delhi">All Delhi</option>
          </select>
        </div>
      </section>

      {/* Community Summary Strip with Clean Colored Bottom Accents */}
      <section className="bg-white border border-[#E7E5E0] rounded-2xl grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#F0EFEA] shadow-[0_2px_14px_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="px-6 py-5 flex flex-col justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">
              Active Issues in {selectedLocality}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#111827] tabular-nums">
              {activeIssuesCount}
            </p>
          </div>
          <div className="h-[3px] w-16 rounded-full bg-[#0038A8]" />
        </div>
        <div className="px-6 py-5 flex flex-col justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">
              Location-Grouped Problems
            </p>
            <p className="mt-1 text-2xl font-bold text-[#0038A8] tabular-nums">
              {totalGroupedClusters}
            </p>
          </div>
          <div className="h-[3px] w-16 rounded-full bg-[#00A3E0]" />
        </div>
        <div className="px-6 py-5 flex flex-col justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">
              Total Citizen Supports
            </p>
            <p className="mt-1 text-2xl font-bold text-[#111827] tabular-nums">
              {totalSupporters}
            </p>
          </div>
          <div className="h-[3px] w-16 rounded-full bg-[#F59E0B]" />
        </div>
        <div className="px-6 py-5 flex flex-col justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">
              Resolved in {selectedLocality}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#16A34A] tabular-nums">
              {resolvedCount}
            </p>
          </div>
          <div className="h-[3px] w-16 rounded-full bg-[#16A34A]" />
        </div>
      </section>

      {/* Filter & Sort Controls */}
      <section className="bg-white border border-[#E7E5E0] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by street, category, or ID..."
            aria-label="Filter community issues"
            className="w-full h-10 pl-10 pr-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'All' | IssueCategory)}
            aria-label="Filter by category"
            className="h-10 px-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label htmlFor="community-sort" className="text-xs font-medium text-[#6B7280]">
              Sort:
            </label>
            <select
              id="community-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 px-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
            >
              <option value="supporters">Most Supported</option>
              <option value="affected">Most Affected Citizens</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>
      </section>

      {/* Automated Location-Based Problem Grouping Section */}
      <section className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="px-6 py-4 border-b border-[#F0EFEA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#0038A8] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <h2 className="text-[16px] font-bold text-[#111827]">
                Grouped Problems in {selectedLocality} ({multiReportGroups.length})
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#6B7280]">
              When multiple residents report the same issue type within 1 km, CivicTrack automatically groups their complaints into one shared problem.
            </p>
          </div>
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0038A8] hover:underline whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Add a report</span>
          </Link>
        </div>

        {multiReportGroups.length === 0 ? (
          <div className="p-8 text-center space-y-1.5">
            <p className="text-sm font-semibold text-[#111827]">
              No multi-user grouped problems in this view
            </p>
            <p className="text-xs text-[#6B7280]">
              If another resident submits a complaint for the same category within 1 km of an existing report, it will appear grouped here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EFEA]">
            {multiReportGroups.map((group) => {
              const primary = group.primaryIssue;
              const isExpanded = Boolean(expandedGroups[group.groupId]);
              const reportSameUrl = `/report?category=${encodeURIComponent(
                primary.category
              )}&neighborhood=${encodeURIComponent(
                primary.neighborhood
              )}&location=${encodeURIComponent(
                primary.location
              )}&lat=${primary.latitude}&lng=${primary.longitude}`;

              return (
                <article key={group.groupId} className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden border border-[#E7E5E0] shrink-0">
                      <IssueImage
                        src={primary.photoUrl}
                        alt={primary.title}
                        className="w-full h-full object-cover"
                        fallbackText="No photo"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#0038A8] font-semibold tabular-nums">
                            <Layers className="w-3 h-3" strokeWidth={1.8} />
                            {group.reportCount} complaints grouped
                          </span>
                          <span className="text-[#6B7280] tabular-nums">
                            Auto-matched within {Math.max(50, group.spreadMeters)}m
                          </span>
                          <span aria-hidden="true" className="text-[#6B7280]">
                            ·
                          </span>
                          <span className="text-[#6B7280]">{primary.category}</span>
                        </div>
                        <StatusLabel status={primary.status} />
                      </div>

                      <h3 className="mt-2 text-[15px] font-bold text-[#111827]">
                        {primary.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#6B7280] line-clamp-2">
                        {primary.description}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                          {primary.location} ({primary.neighborhood})
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
                          {group.totalAffected} citizens affected across {group.reportCount} reports
                        </span>
                        <SeverityLabel severity={primary.severity} />
                      </div>

                      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleSupport(primary.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors tabular-nums ${
                            primary.supportedByMe
                              ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#0038A8]'
                              : 'bg-[#FAF9F6] border-[#E7E5E0] text-[#111827] hover:bg-[#F5F4F0]'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span>
                            {primary.supportedByMe ? 'Supported' : 'Support'} (
                            {group.totalSupporters})
                          </span>
                        </button>

                        <Link
                          to={reportSameUrl}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border border-[#E7E5E0] bg-white text-[#111827] hover:bg-[#FAF9F6] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span>I also face this issue</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleGroupExpand(group.groupId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0038A8] hover:underline"
                        >
                          <span>
                            {isExpanded
                              ? 'Hide grouped reports'
                              : `View ${group.reportCount} grouped reports`}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.75} />
                          )}
                        </button>

                        {group.myReport && (
                          <Link
                            to={`/complaints?id=${group.myReport.id}`}
                            className="ml-auto text-xs font-semibold text-[#0038A8] hover:underline whitespace-nowrap"
                          >
                            Track my report ({group.myReport.id}) →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded List of Individual Complaints inside the Grouped Problem */}
                  {isExpanded && (
                    <div className="bg-[#FAF9F6] border border-[#E7E5E0] rounded-xl divide-y divide-[#F0EFEA]">
                      {group.reports.map((report) => (
                        <div
                          key={report.id}
                          className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-[#111827] tabular-nums">
                                {report.id}
                              </span>
                              <span className="text-[#6B7280]">·</span>
                              <span className="text-[#111827] font-medium truncate">
                                {report.title}
                              </span>
                              {report.isMine && (
                                <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#0038A8] text-[11px] font-semibold">
                                  Your report
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[#6B7280]">
                              {report.location} · Reported on {report.submittedDate}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <StatusLabel status={report.status} />
                            {report.isMine && (
                              <Link
                                to={`/complaints?id=${report.id}`}
                                className="font-semibold text-[#0038A8] hover:underline whitespace-nowrap"
                              >
                                Track →
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Individual Community Reports Feed */}
      <section className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="px-6 py-4 border-b border-[#F0EFEA] flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#111827]">
            All Reports in {selectedLocality} ({sortedIssues.length})
          </h2>
          <span className="text-xs text-[#6B7280]">
            Sorted by{' '}
            {sortBy === 'supporters'
              ? 'most supported'
              : sortBy === 'affected'
              ? 'affected citizens'
              : 'most recent'}
          </span>
        </div>

        <div className="divide-y divide-[#F0EFEA]">
          {sortedIssues.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-[#111827]">
                No community issues found in {selectedLocality}
              </p>
              <p className="text-xs text-[#6B7280]">
                Try switching to All Delhi or adjusting your category filter.
              </p>
              <button
                type="button"
                onClick={() => handleChooseLocality('All Delhi')}
                className="mt-2 px-3.5 py-1.5 text-xs font-medium text-[#0038A8] border border-[#E7E5E0] rounded-xl hover:bg-[#FAF9F6]"
              >
                Show All Delhi Issues
              </button>
            </div>
          ) : (
            sortedIssues.map((issue) => {
              const clusterSize = groupMembershipMap.get(issue.id);
              return (
                <article key={issue.id} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden border border-[#E7E5E0] shrink-0">
                      <IssueImage
                        src={issue.photoUrl}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                        fallbackText="No photo"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                          <span className="font-semibold text-[#111827] tabular-nums">
                            {issue.id}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{issue.category}</span>
                          <span aria-hidden="true">·</span>
                          <SeverityLabel severity={issue.severity} />
                          {clusterSize && clusterSize > 1 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-[#0038A8] font-medium">
                                <Layers className="w-3 h-3" strokeWidth={1.75} />
                                Grouped ({clusterSize} reports)
                              </span>
                            </>
                          )}
                        </div>
                        <StatusLabel status={issue.status} />
                      </div>

                      <h2 className="mt-1.5 text-[15px] font-bold text-[#111827]">
                        {issue.title}
                      </h2>

                      <p className="mt-1 text-sm text-[#6B7280] line-clamp-2">
                        {issue.description}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                          {issue.location} ({issue.neighborhood})
                        </span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
                          {issue.affectedCitizens} citizens affected
                        </span>
                      </div>

                      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleSupport(issue.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors tabular-nums ${
                            issue.supportedByMe
                              ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#0038A8]'
                              : 'bg-[#FAF9F6] border-[#E7E5E0] text-[#111827] hover:bg-[#F5F4F0]'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span>
                            {issue.supportedByMe ? 'Supported' : 'Support'} (
                            {issue.supporters})
                          </span>
                        </button>

                        {issue.isMine && (
                          <Link
                            to={`/complaints?id=${issue.id}`}
                            className="ml-auto text-xs font-semibold text-[#0038A8] hover:underline whitespace-nowrap"
                          >
                            Track status →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
