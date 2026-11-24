export type IssueCategory =
  | 'Road & Sidewalk'
  | 'Street Lighting'
  | 'Waste & Sanitation'
  | 'Water & Drainage'
  | 'Parks & Trees'
  | 'Traffic & Signage';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved';

export interface TimelineEntry {
  id: string;
  stage: string;
  date: string;
  note: string;
  actor: string;
  completed: boolean;
}

export interface CivicIssue {
  id: string;
  title: string;
  category: IssueCategory;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  location: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  submittedDate: string;
  department: string;
  assignedOfficer?: string;
  supporters: number;
  verifications: number;
  affectedCitizens: number;
  isMine: boolean;
  supportedByMe: boolean;
  verifiedByMe: boolean;
  duplicateOf?: string;
  problemGroupId?: string;
  photoUrl?: string;
  resolutionPhotoUrl?: string;
  authorityRemarks?: string;
  timeline: TimelineEntry[];
}

export type NotificationType =
  | 'Complaint Update'
  | 'Officer Assignment'
  | 'Resolution Update'
  | 'Nearby Alert';

export interface CivicNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  issueId?: string;
}

export interface ActivityEntry {
  id: string;
  issueId: string;
  issueTitle: string;
  action: string;
  timestamp: string;
  department?: string;
}

export interface CitizenProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  neighborhood: string;
  avatarUrl: string;
  preferences: {
    emailUpdates: boolean;
    smsAlerts: boolean;
    nearbyAlerts: boolean;
    alertRadiusKm: number;
  };
}
