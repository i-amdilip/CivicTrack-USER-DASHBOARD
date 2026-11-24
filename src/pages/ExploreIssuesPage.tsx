import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Search,
  ThumbsUp,
  Users,
  X,
} from 'lucide-react';
import { CivicMap } from '../components/CivicMap';
import { IssueImage } from '../components/IssueImage';
import { SeverityLabel, StatusLabel } from '../components/StatusLabel';
import { useCivic } from '../context/CivicContext';
import {
  CivicIssue,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
} from '../types/civic';

const CATEGORIES: ('All' | IssueCategory)[] = [
  'All',
  'Road & Sidewalk',
  'Street Lighting',
  'Waste & Sanitation',
  'Water & Drainage',
  'Parks & Trees',
  'Traffic & Signage',
];

const SEVERITIES: ('All' | IssueSeverity)[] = [
  'All',
  'Low',
  'Medium',
  'High',
  'Critical',
];

const STATUSES: ('All' | IssueStatus)[] = [
  'All',
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
];

export const ExploreIssuesPage: React.FC = () => {
  const { issues, profile, globalSearch, toggleSupport } = useCivic();
  const [searchParams, setSearchParams] = useSearchParams();

  const [locationQuery, setLocationQuery] = useState(globalSearch);
  const [categoryFilter, setCategoryFilter] = useState<'All' | IssueCategory>('All');
  const [severityFilter, setSeverityFilter] = useState<'All' | IssueSeverity>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | IssueStatus>('All');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(
    searchParams.get('id')
  );

  useEffect(() => {
    if (globalSearch) {
      setLocationQuery(globalSearch);
    }
  }, [globalSearch]);

  useEffect(() => {
    const paramId = searchParams.get('id');
    if (paramId) {
      setSelectedIssueId(paramId);
    }
  }, [searchParams]);

  const filteredIssues = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    return issues.filter((issue) => {
      if (categoryFilter !== 'All' && issue.category !== categoryFilter) {
        return false;
      }
      if (severityFilter !== 'All' && issue.severity !== severityFilter) {
        return false;
      }
      if (statusFilter !== 'All' && issue.status !== statusFilter) {
        return false;
      }
      if (q) {
        const hay = `${issue.location} ${issue.neighborhood} ${issue.title} ${issue.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [issues, locationQuery, categoryFilter, severityFilter, statusFilter]);

  const selectedIssue = useMemo(
    () => filteredIssues.find((i) => i.id === selectedIssueId) || null,
    [filteredIssues, selectedIssueId]
  );

  const hasActiveFilters =
    locationQuery.trim() !== '' ||
    categoryFilter !== 'All' ||
    severityFilter !== 'All' ||
    statusFilter !== 'All';

  const handleClearFilters = () => {
    setLocationQuery('');
    setCategoryFilter('All');
    setSeverityFilter('All');
    setStatusFilter('All');
  };

  const handleSelectIssue = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    setSearchParams({ id: issue.id });
  };

  const handleCloseDetail = () => {
    setSelectedIssueId(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <section className="bg-white border border-[#E7E5E0] rounded-2xl p-4 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search
              className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Search by street, neighborhood, or title..."
              aria-label="Search issues by location"
              className="w-full h-10 pl-10 pr-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8]"
            />
          </div>

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

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as 'All' | IssueSeverity)}
            aria-label="Filter by severity"
            className="h-10 px-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev === 'All' ? 'All Severities' : `${sev} Severity`}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | IssueStatus)}
            aria-label="Filter by status"
            className="h-10 px-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st === 'All' ? 'All Statuses' : st}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B7280]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="tabular-nums">
              Showing {filteredIssues.length} of {issues.length} Delhi issues
            </span>
            <button
              type="button"
              onClick={() =>
                setLocationQuery(
                  locationQuery === profile.neighborhood ? '' : profile.neighborhood
                )
              }
              className={`px-3 py-1 rounded-full border transition-colors ${
                locationQuery.toLowerCase() === profile.neighborhood.toLowerCase()
                  ? 'bg-[#EFF6FF] border-[#0038A8] text-[#0038A8] font-medium'
                  : 'bg-[#FAF9F6] border-[#E7E5E0] text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              My area ({profile.neighborhood})
            </button>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-[#0038A8] font-semibold hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* Split Layout: Interactive Map + Issue List / Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <CivicMap
            issues={filteredIssues}
            selectedIssueId={selectedIssueId}
            onSelectIssue={handleSelectIssue}
            className="w-full h-[380px] lg:h-[580px] border-0"
          />
          <div className="px-5 py-3 border-t border-[#F0EFEA] bg-[#FAF9F6] flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#6B7280]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64748B]" />
              Submitted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              Under Review
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0038A8]" />
              In Progress
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              Resolved
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              Critical Priority
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-2xl flex flex-col h-[620px] shadow-[0_2px_14px_rgba(15,23,42,0.04)] overflow-hidden">
          {selectedIssue ? (
            <>
              <div className="px-5 py-3.5 border-b border-[#F0EFEA] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <span className="font-semibold text-[#111827] tabular-nums">
                    {selectedIssue.id}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedIssue.submittedDate}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseDetail}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0038A8] hover:underline"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>All issues</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#E7E5E0]">
                  <IssueImage
                    src={selectedIssue.photoUrl}
                    alt={selectedIssue.title}
                    className="w-full h-full object-cover"
                    fallbackText="No photograph attached"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SeverityLabel severity={selectedIssue.severity} />
                  <StatusLabel status={selectedIssue.status} />
                </div>

                <div>
                  <h2 className="text-[16px] font-bold text-[#111827] leading-snug">
                    {selectedIssue.title}
                  </h2>
                  <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
                    {selectedIssue.description}
                  </p>
                </div>

                <dl className="pt-3 border-t border-[#F0EFEA] space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[#6B7280]">Location</dt>
                    <dd className="text-[#111827] font-medium text-right">
                      {selectedIssue.location} ({selectedIssue.neighborhood})
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[#6B7280]">Category</dt>
                    <dd className="text-[#111827]">{selectedIssue.category}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[#6B7280]">Department</dt>
                    <dd className="text-[#111827]">{selectedIssue.department}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-[#6B7280]">Affected Citizens</dt>
                    <dd className="text-[#111827] tabular-nums inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={1.75} />
                      {selectedIssue.affectedCitizens}
                    </dd>
                  </div>
                </dl>

                <div className="pt-3 border-t border-[#F0EFEA] flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleSupport(selectedIssue.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors tabular-nums ${
                      selectedIssue.supportedByMe
                        ? 'bg-[#EFF6FF] border-[#0038A8] text-[#0038A8]'
                        : 'bg-[#FAF9F6] border-[#E7E5E0] text-[#111827] hover:bg-[#F5F4F0]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>
                      {selectedIssue.supportedByMe ? 'Supported' : 'Support'} (
                      {selectedIssue.supporters})
                    </span>
                  </button>

                  {selectedIssue.isMine && (
                    <Link
                      to={`/complaints?id=${selectedIssue.id}`}
                      className="ml-auto text-xs font-semibold text-[#0038A8] hover:underline"
                    >
                      Track status & timeline →
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-5 py-3.5 border-b border-[#F0EFEA] flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-[#111827]">Issue List</h2>
                <Link
                  to="/report"
                  className="text-xs font-semibold text-[#0038A8] hover:underline"
                >
                  + Report an Issue
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#F0EFEA]">
                {filteredIssues.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-[#111827] font-semibold">
                      No matching issues found
                    </p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Try adjusting your location search or clearing the active filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-3 px-3.5 py-1.5 text-xs font-medium text-[#0038A8] border border-[#E7E5E0] rounded-xl hover:bg-[#FAF9F6]"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredIssues.map((issue) => (
                    <article
                      key={issue.id}
                      onClick={() => handleSelectIssue(issue)}
                      className="p-4 cursor-pointer hover:bg-[#FAF9F6] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-[#E7E5E0] shrink-0">
                          <IssueImage
                            src={issue.photoUrl}
                            alt={issue.title}
                            className="w-full h-full object-cover"
                            fallbackText="Photo"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-medium text-[#6B7280] tabular-nums">
                              {issue.id}
                            </span>
                            <StatusLabel status={issue.status} />
                          </div>
                          <h3 className="mt-1 text-sm font-semibold text-[#111827] leading-snug">
                            {issue.title}
                          </h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#6B7280]">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                              {issue.location}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{issue.category}</span>
                            <span aria-hidden="true">·</span>
                            <SeverityLabel severity={issue.severity} />
                          </div>
                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSupport(issue.id);
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors tabular-nums ${
                                issue.supportedByMe
                                  ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#0038A8]'
                                  : 'bg-[#FAF9F6] border-[#E7E5E0] text-[#6B7280] hover:text-[#111827]'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" strokeWidth={1.75} />
                              <span>
                                {issue.supportedByMe ? 'Supported' : 'Support'} (
                                {issue.supporters})
                              </span>
                            </button>

                            {issue.isMine ? (
                              <Link
                                to={`/complaints?id=${issue.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs text-[#0038A8] font-semibold hover:underline"
                              >
                                Track progress →
                              </Link>
                            ) : (
                              <span className="text-xs text-[#0038A8] font-medium">
                                View on map →
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
