import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_ACTIVITY,
  INITIAL_ISSUES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFILE,
} from '../data/mockData';
import {
  ActivityEntry,
  CitizenProfile,
  CivicIssue,
  CivicNotification,
  IssueCategory,
  IssueSeverity,
} from '../types/civic';
import {
  getDistanceMeters,
  isSameProblemByLocation,
} from '../utils/issueGrouping';

interface NewIssueInput {
  title: string;
  category: IssueCategory;
  description: string;
  severity: IssueSeverity;
  location: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

interface CivicContextValue {
  isAuthenticated: boolean;
  login: (email: string, name?: string, neighborhood?: string) => void;
  logout: () => void;
  issues: CivicIssue[];
  notifications: CivicNotification[];
  activities: ActivityEntry[];
  profile: CitizenProfile;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  submitIssue: (input: NewIssueInput) => CivicIssue;
  toggleSupport: (issueId: string) => void;
  toggleVerify: (issueId: string) => void;
  reportDuplicate: (issueId: string, originalIssueId: string) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  updateProfile: (updated: CitizenProfile) => void;
}

const CivicContext = createContext<CivicContextValue | undefined>(undefined);

const STORAGE_KEY = 'civictrack_state_delhi_v1';
const AUTH_KEY = 'civictrack_auth_delhi_v1';

const DEPARTMENT_BY_CATEGORY: Record<IssueCategory, string> = {
  'Road & Sidewalk': 'Public Works Department (PWD), Delhi',
  'Street Lighting': 'MCD Electrical & Streetlight Wing',
  'Waste & Sanitation': 'New Delhi Municipal Council (NDMC)',
  'Water & Drainage': 'Delhi Jal Board (DJB)',
  'Parks & Trees': 'MCD Horticulture Department',
  'Traffic & Signage': 'Delhi Traffic Engineering Wing',
};

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [issues, setIssues] = useState<CivicIssue[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.issues)) {
          const existingIds = new Set(
            parsed.issues.map((item: CivicIssue) => item.id)
          );
          const missingSeedIssues = INITIAL_ISSUES.filter(
            (seed) => !existingIds.has(seed.id)
          );
          return [...parsed.issues, ...missingSeedIssues];
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_ISSUES;
  });

  const [notifications, setNotifications] = useState<CivicNotification[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.notifications)) return parsed.notifications;
      }
    } catch {
      // ignore
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activities, setActivities] = useState<ActivityEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.activities)) return parsed.activities;
      }
    } catch {
      // ignore
    }
    return INITIAL_ACTIVITY;
  });

  const [profile, setProfile] = useState<CitizenProfile>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.profile) return parsed.profile;
      }
    } catch {
      // ignore
    }
    return INITIAL_PROFILE;
  });

  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ issues, notifications, activities, profile })
      );
    } catch {
      // ignore storage quota errors
    }
  }, [issues, notifications, activities, profile]);

  const login = (email: string, name?: string, neighborhood?: string) => {
    setProfile((prev) => ({
      ...prev,
      email,
      name: name || prev.name,
      neighborhood: neighborhood || prev.neighborhood,
    }));
    setIsAuthenticated(true);
    try {
      localStorage.setItem(AUTH_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  };

  const submitIssue = (input: NewIssueInput): CivicIssue => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().slice(0, 5);
    const nextNum = 1050 + issues.length;
    const id = `DL-2026-${nextNum}`;
    const department = DEPARTMENT_BY_CATEGORY[input.category];
    const normalizedNeighborhood = input.neighborhood.trim() || profile.neighborhood;

    const nearbyMatches = issues.filter((existing) =>
      isSameProblemByLocation(existing, {
        category: input.category,
        neighborhood: normalizedNeighborhood,
        latitude: input.latitude,
        longitude: input.longitude,
      })
    );

    const primaryMatch = nearbyMatches[0];
    const matchedDistance = primaryMatch
      ? getDistanceMeters(
          primaryMatch.latitude,
          primaryMatch.longitude,
          input.latitude,
          input.longitude
        )
      : null;
    const autoGroupId = primaryMatch
      ? primaryMatch.problemGroupId || `GRP-${primaryMatch.id}`
      : undefined;

    const created: CivicIssue = {
      id,
      title: input.title.trim(),
      category: input.category,
      description: input.description.trim(),
      severity: input.severity,
      status: 'Submitted',
      location: input.location.trim(),
      neighborhood: normalizedNeighborhood,
      latitude: input.latitude,
      longitude: input.longitude,
      submittedDate: dateStr,
      department,
      supporters: 1,
      verifications: 1,
      affectedCitizens: 1,
      isMine: true,
      supportedByMe: true,
      verifiedByMe: true,
      problemGroupId: autoGroupId,
      photoUrl: input.photoUrl,
      timeline: [
        {
          id: `t-${Date.now()}-1`,
          stage: 'Submitted',
          date: `${dateStr} ${timeStr}`,
          note: primaryMatch
            ? `Report submitted and automatically grouped by location (~${matchedDistance}m from ${primaryMatch.id}) in ${normalizedNeighborhood}.`
            : 'Report submitted through CivicTrack Citizen Portal.',
          actor: profile.name,
          completed: true,
        },
        {
          id: `t-${Date.now()}-2`,
          stage: 'Under Review',
          date: 'Pending',
          note: `Queued for triage by ${department}.`,
          actor: 'Central Dispatch',
          completed: false,
        },
        {
          id: `t-${Date.now()}-3`,
          stage: 'In Progress',
          date: 'Pending',
          note: 'Awaiting field crew scheduling.',
          actor: department,
          completed: false,
        },
        {
          id: `t-${Date.now()}-4`,
          stage: 'Resolved',
          date: 'Pending',
          note: 'Pending completion and verification.',
          actor: department,
          completed: false,
        },
      ],
    };

    setIssues((prev) => [created, ...prev]);

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        issueId: id,
        issueTitle: created.title,
        action: primaryMatch
          ? `Submitted & auto-grouped with ${nearbyMatches.length} nearby ${input.category} report(s)`
          : `New issue submitted to ${department}`,
        timestamp: 'Just now',
        department,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'Complaint Update',
        title: primaryMatch
          ? `Complaint ${id} grouped with nearby reports`
          : `Complaint ${id} received`,
        message: primaryMatch
          ? `Your report "${created.title}" at ${created.location} was automatically grouped with ${nearbyMatches.length} nearby resident report(s) in ${normalizedNeighborhood}.`
          : `Your report "${created.title}" at ${created.location} has been logged and routed to ${department}.`,
        timestamp: 'Just now',
        read: false,
        issueId: id,
      },
      ...prev,
    ]);

    return created;
  };

  const toggleSupport = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        const nextSupported = !issue.supportedByMe;
        return {
          ...issue,
          supportedByMe: nextSupported,
          supporters: Math.max(0, issue.supporters + (nextSupported ? 1 : -1)),
          affectedCitizens: Math.max(
            0,
            issue.affectedCitizens + (nextSupported ? 1 : -1)
          ),
        };
      })
    );
  };

  const toggleVerify = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        const nextVerified = !issue.verifiedByMe;
        return {
          ...issue,
          verifiedByMe: nextVerified,
          verifications: Math.max(
            0,
            issue.verifications + (nextVerified ? 1 : -1)
          ),
        };
      })
    );
  };

  const reportDuplicate = (issueId: string, originalIssueId: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, duplicateOf: originalIssueId }
          : issue
      )
    );
    const target = issues.find((i) => i.id === issueId);
    if (target) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          issueId,
          issueTitle: target.title,
          action: `Flagged as possible duplicate of ${originalIssueId}`,
          timestamp: 'Just now',
        },
        ...prev,
      ]);
    }
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateProfile = (updated: CitizenProfile) => {
    setProfile(updated);
  };

  return (
    <CivicContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        issues,
        notifications,
        activities,
        profile,
        globalSearch,
        setGlobalSearch,
        submitIssue,
        toggleSupport,
        toggleVerify,
        reportDuplicate,
        markNotificationRead,
        markAllNotificationsRead,
        updateProfile,
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export function useCivic() {
  const ctx = useContext(CivicContext);
  if (!ctx) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return ctx;
}
