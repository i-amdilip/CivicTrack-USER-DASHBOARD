import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ThumbsUp,
  UserCheck,
} from 'lucide-react';
import { CivicMap } from '../components/CivicMap';
import { IssueImage } from '../components/IssueImage';
import { SeverityLabel, StatusLabel } from '../components/StatusLabel';
import { useCivic } from '../context/CivicContext';
import { IssueStatus } from '../types/civic';

const STATUS_FILTERS: ('All' | IssueStatus)[] = [
  'All',
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
];

const STAGES: IssueStatus[] = [
  'Submitted',
  'Under Review',
  'In Progress',
  'Resolved',
];

export const MyComplaintsPage: React.FC = () => {
  const { issues, toggleSupport } = useCivic();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get('status') as IssueStatus | null;
  const [statusFilter, setStatusFilter] = useState<'All' | IssueStatus>(
    initialStatus && STAGES.includes(initialStatus) ? initialStatus : 'All'
  );
  const [query, setQuery] = useState('');
  const [lookupId, setLookupId] = useState('');
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    const paramStatus = searchParams.get('status') as IssueStatus | null;
    if (paramStatus && STAGES.includes(paramStatus)) {
      setStatusFilter(paramStatus);
    }
  }, [searchParams]);

  const myComplaints = useMemo(
    () => issues.filter((issue) => issue.isMine),
    [issues]
  );

  const filteredComplaints = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myComplaints.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (q) {
        const hay = `${c.id} ${c.title} ${c.location} ${c.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [myComplaints, statusFilter, query]);

  const selectedId = searchParams.get('id');
  const selectedComplaint = useMemo(
    () => myComplaints.find((i) => i.id === selectedId) || null,
    [myComplaints, selectedId]
  );

  useEffect(() => {
    if (selectedId && !selectedComplaint) {
      setSearchParams({});
    }
  }, [selectedId, selectedComplaint, setSearchParams]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = lookupId.trim().toUpperCase();
    if (!trimmed) {
      setLookupError('Please enter your Complaint ID.');
      return;
    }
    const found = myComplaints.find((i) => i.id.toUpperCase() === trimmed);
    if (!found) {
      setLookupError(
        `No complaint with ID "${trimmed}" was found under your account.`
      );
      return;
    }
    setLookupError('');
    setLookupId('');
    setSearchParams({ id: found.id });
  };

  if (selectedComplaint) {
    const currentStageIndex = STAGES.indexOf(selectedComplaint.status);

    return (
      <div className="space-y-5 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0038A8] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <span>Back to My Complaints</span>
          </button>

          {!selectedComplaint.isMine && (
            <button
              type="button"
              onClick={() => toggleSupport(selectedComplaint.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full border transition-colors tabular-nums ${
                selectedComplaint.supportedByMe
                  ? 'bg-[#EFF6FF] border-[#0038A8] text-[#0038A8]'
                  : 'bg-white border-[#E7E5E0] text-[#111827] hover:bg-[#FAF9F6]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>
                {selectedComplaint.supportedByMe ? 'Supported' : 'Support this issue'} (
                {selectedComplaint.supporters})
              </span>
            </button>
          )}
        </div>

        {/* Detail Header + 4-Step Progress Bar */}
        <section className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#6B7280]">
                <span className="font-semibold text-[#111827] tabular-nums">
                  {selectedComplaint.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>Submitted {selectedComplaint.submittedDate}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedComplaint.category}</span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-[#111827]">
                {selectedComplaint.title}
              </h2>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <SeverityLabel severity={selectedComplaint.severity} />
              <StatusLabel status={selectedComplaint.status} />
            </div>
          </div>

          <p className="mt-4 text-sm text-[#374151] leading-relaxed">
            {selectedComplaint.description}
          </p>

          {/* Horizontal Stage Bar */}
          <div className="mt-6 pt-5 border-t border-[#F0EFEA]">
            <div className="grid grid-cols-4 gap-2.5">
              {STAGES.map((stage, idx) => {
                const reached = idx <= currentStageIndex;
                return (
                  <div key={stage} className="space-y-1.5">
                    <div
                      className={`h-2 rounded-full ${
                        reached
                          ? selectedComplaint.status === 'Resolved'
                            ? 'bg-[#16A34A]'
                            : 'bg-[#0038A8]'
                          : 'bg-[#E7E5E0]'
                      }`}
                    />
                    <p
                      className={`text-xs ${
                        reached ? 'font-semibold text-[#111827]' : 'text-[#6B7280]'
                      }`}
                    >
                      {stage}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <dl className="mt-5 pt-5 border-t border-[#F0EFEA] grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-[#6B7280]">Location</dt>
              <dd className="mt-1 text-[#111827] flex items-center gap-1.5">
                <MapPin
                  className="w-3.5 h-3.5 text-[#6B7280] shrink-0"
                  strokeWidth={1.75}
                />
                <span>
                  {selectedComplaint.location} ({selectedComplaint.neighborhood})
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#6B7280]">Department</dt>
              <dd className="mt-1 text-[#111827]">{selectedComplaint.department}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[#6B7280]">
                Assigned Officer
              </dt>
              <dd className="mt-1 text-[#111827] flex items-center gap-1.5">
                <UserCheck
                  className="w-3.5 h-3.5 text-[#6B7280] shrink-0"
                  strokeWidth={1.75}
                />
                <span>
                  {selectedComplaint.assignedOfficer || 'Pending assignment'}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Progress Timeline */}
          <section className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
            <h3 className="text-[16px] font-bold text-[#111827] mb-5">
              Progress Timeline
            </h3>
            <ol className="space-y-5">
              {selectedComplaint.timeline.map((step, index) => {
                const isLast = index === selectedComplaint.timeline.length - 1;
                return (
                  <li key={step.id} className="relative flex gap-3.5">
                    {!isLast && (
                      <span
                        className={`absolute left-[9px] top-6 bottom-[-20px] w-px ${
                          step.completed ? 'bg-[#0038A8]' : 'bg-[#E7E5E0]'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <div className="mt-0.5 shrink-0 bg-white">
                      {step.completed ? (
                        <CheckCircle2
                          className="w-5 h-5 text-[#16A34A]"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <Clock
                          className="w-5 h-5 text-[#6B7280]"
                          strokeWidth={1.75}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            step.completed ? 'text-[#111827]' : 'text-[#6B7280]'
                          }`}
                        >
                          {step.stage}
                        </p>
                        <span className="text-xs text-[#6B7280] tabular-nums">
                          {step.date}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#6B7280]">{step.note}</p>
                      <p className="mt-0.5 text-xs text-[#6B7280]">
                        Updated by {step.actor}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Authority Remarks, Photos & Map */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
              <h3 className="text-[16px] font-bold text-[#111827]">
                Authority Remarks
              </h3>
              <p className="mt-2.5 text-sm text-[#374151] leading-relaxed">
                {selectedComplaint.authorityRemarks ||
                  'No official remarks posted yet. Your complaint is in the department review queue.'}
              </p>
            </section>

            <section className="bg-white border border-[#E7E5E0] rounded-2xl p-6 space-y-4 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
              <h3 className="text-[16px] font-bold text-[#111827]">
                Photographs
              </h3>

              <div
                className={`grid gap-4 ${
                  selectedComplaint.resolutionPhotoUrl
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1'
                    : 'grid-cols-1'
                }`}
              >
                <div>
                  <p className="text-xs font-medium text-[#6B7280] mb-1.5">
                    Submitted Evidence
                  </p>
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#E7E5E0]">
                    <IssueImage
                      src={selectedComplaint.photoUrl}
                      alt={`Submitted evidence for ${selectedComplaint.id}`}
                      className="w-full h-full object-cover"
                      fallbackText="No photo submitted"
                    />
                  </div>
                </div>

                {selectedComplaint.resolutionPhotoUrl && (
                  <div>
                    <p className="text-xs font-medium text-[#16A34A] mb-1.5">
                      Resolution Photograph
                    </p>
                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#E7E5E0]">
                      <IssueImage
                        src={selectedComplaint.resolutionPhotoUrl}
                        alt={`Resolution photo for ${selectedComplaint.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white border border-[#E7E5E0] rounded-2xl p-6 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
              <h3 className="text-[16px] font-bold text-[#111827] mb-3">
                Pinned Location
              </h3>
              <CivicMap
                issues={[selectedComplaint]}
                selectedIssueId={selectedComplaint.id}
                center={[
                  selectedComplaint.latitude,
                  selectedComplaint.longitude,
                ]}
                zoom={15}
                className="w-full h-48 rounded-xl"
              />
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Track Any Complaint by ID */}
      <section className="bg-[#0038A8] text-white rounded-2xl px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-[0_4px_18px_rgba(0,56,168,0.14)]">
        <div>
          <h2 className="text-[16px] font-bold text-white">
            Track your complaint by reference ID
          </h2>
          <p className="text-xs text-white/80 mt-0.5">
            Enter one of your complaint IDs (for example, DL-2026-1048) to view its current department status and timeline.
          </p>
        </div>
        <form
          onSubmit={handleLookupSubmit}
          className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={lookupId}
            onChange={(e) => {
              setLookupId(e.target.value);
              if (lookupError) setLookupError('');
            }}
            placeholder="DL-2026-1048"
            aria-label="Complaint ID lookup"
            className="h-9 px-3.5 text-sm bg-white border border-white/20 rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:outline-none w-full sm:w-48"
          />
          <button
            type="submit"
            className="h-9 px-4 text-sm font-semibold text-[#0038A8] bg-white hover:bg-[#F3F2EE] rounded-xl transition-colors whitespace-nowrap"
          >
            Track Complaint
          </button>
        </form>
      </section>
      {lookupError && (
        <p className="text-xs text-[#DC2626] bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-4 py-2.5">
          {lookupError}
        </p>
      )}

      {/* Top Action, Search & Filter Bar */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl px-5 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#0038A8] text-white'
                    : 'text-[#4B5563] bg-[#F5F4F0] hover:bg-[#EAE9E4] hover:text-[#111827]'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-60">
            <Search
              className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter my complaints..."
              aria-label="Filter my complaints"
              className="w-full h-9 pl-8 pr-3 text-xs bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8]"
            />
          </div>
          <Link
            to="/report"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#0038A8] hover:bg-[#002D8A] rounded-xl transition-colors whitespace-nowrap"
          >
            Report an Issue
          </Link>
        </div>
      </div>

      {/* Complaints Table */}
      <section className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="px-6 py-4 border-b border-[#F0EFEA] flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[#111827]">
            Submitted Complaints ({filteredComplaints.length})
          </h2>
          <span className="text-xs text-[#6B7280]">
            Click any complaint to track its progress
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F0EFEA] bg-[#FAF9F6] text-xs font-medium text-[#6B7280]">
                <th className="py-3 px-6 whitespace-nowrap">Complaint ID</th>
                <th className="py-3 px-4">Issue Title</th>
                <th className="py-3 px-4 whitespace-nowrap">Submission Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Location</th>
                <th className="py-3 px-4 whitespace-nowrap">Department</th>
                <th className="py-3 px-4 whitespace-nowrap">Current Status</th>
                <th className="py-3 px-6 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA] text-sm">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 px-6 text-center text-sm text-[#6B7280]"
                  >
                    No complaints match your current filter.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    onClick={() => setSearchParams({ id: complaint.id })}
                    className="hover:bg-[#FAF9F6] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-[#0038A8] tabular-nums whitespace-nowrap">
                      {complaint.id}
                    </td>
                    <td className="py-3.5 px-4 text-[#111827] font-medium max-w-xs truncate">
                      {complaint.title}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] tabular-nums whitespace-nowrap">
                      {complaint.submittedDate}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] whitespace-nowrap">
                      {complaint.location}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] whitespace-nowrap">
                      {complaint.department}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusLabel status={complaint.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <span className="text-xs font-semibold text-[#0038A8]">
                        Track →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
