import React from 'react';
import { IssueSeverity, IssueStatus } from '../types/civic';

interface StatusLabelProps {
  status: IssueStatus;
}

const STATUS_STYLES: Record<IssueStatus, string> = {
  Submitted: 'text-[#0284C7] bg-[#F0F9FF] border border-[#7DD3FC]',
  'Under Review': 'text-[#D97706] bg-[#FFFBEB] border border-[#FCD34D]',
  'In Progress': 'text-[#0038A8] bg-[#EFF6FF] border border-[#93C5FD]',
  Resolved: 'text-white bg-[#16A34A] border border-[#16A34A]',
};

export const StatusLabel: React.FC<StatusLabelProps> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
};

interface SeverityLabelProps {
  severity: IssueSeverity;
}

const SEVERITY_STYLES: Record<IssueSeverity, string> = {
  Low: 'text-[#16A34A]',
  Medium: 'text-[#D97706]',
  High: 'text-[#EA580C]',
  Critical: 'text-[#DC2626]',
};

export const SeverityLabel: React.FC<SeverityLabelProps> = ({ severity }) => {
  return (
    <span className={`text-xs font-medium whitespace-nowrap ${SEVERITY_STYLES[severity]}`}>
      {severity} priority
    </span>
  );
};
