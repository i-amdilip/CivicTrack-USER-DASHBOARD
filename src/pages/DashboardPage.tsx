import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  Compass,
  Droplets,
  LayoutGrid,
  Lightbulb,
  MapPin,
  Search,
  ThumbsUp,
  Trash2,
  Wrench,
} from 'lucide-react';
import { IssueImage } from '../components/IssueImage';
import { StatusLabel } from '../components/StatusLabel';
import { useCivic } from '../context/CivicContext';

export const DashboardPage: React.FC = () => {
  const { issues, activities, profile, toggleSupport } = useCivic();
  const navigate = useNavigate();

  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackError, setTrackError] = useState('');

  const myComplaints = issues.filter((i) => i.isMine);
  const myComplaintIds = new Set(myComplaints.map((i) => i.id));
  const nearbyIssues = issues.slice(0, 4);
  const myActivity = activities
    .filter((entry) => myComplaintIds.has(entry.issueId))
    .slice(0, 5);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackIdInput.trim().toUpperCase();
    if (!trimmed) {
      setTrackError('Enter your complaint ID (e.g., DL-2026-1048).');
      return;
    }
    const match = myComplaints.find((i) => i.id.toUpperCase() === trimmed);
    if (!match) {
      setTrackError(`No complaint with ID "${trimmed}" was found under your account.`);
      return;
    }
    setTrackError('');
    navigate(`/complaints?id=${match.id}`);
  };

  const quickServices = [
    {
      title: 'Road & Sidewalk',
      description: 'Potholes, broken footpaths, road patches',
      to: '/report?category=Road%20%26%20Sidewalk',
      icon: Wrench,
      iconBg: 'bg-[#EFF6FF] text-[#0038A8]',
      accentBar: 'bg-[#0038A8]',
    },
    {
      title: 'Street Lighting',
      description: 'Unlit poles, market crossings, wiring faults',
      to: '/report?category=Street%20Lighting',
      icon: Lightbulb,
      iconBg: 'bg-[#FFFBEB] text-[#D97706]',
      accentBar: 'bg-[#F59E0B]',
    },
    {
      title: 'Water & Drainage',
      description: 'Pipeline leaks, clogged stormwater grates',
      to: '/report?category=Water%20%26%20Drainage',
      icon: Droplets,
      iconBg: 'bg-[#F0F9FF] text-[#0284C7]',
      accentBar: 'bg-[#00A3E0]',
    },
    {
      title: 'Waste & Sanitation',
      description: 'Overflowing bins, uncollected street waste',
      to: '/report?category=Waste%20%26%20Sanitation',
      icon: Trash2,
      iconBg: 'bg-[#ECFDF5] text-[#16A34A]',
      accentBar: 'bg-[#16A34A]',
    },
    {
      title: 'My Complaints',
      description: `View and track your ${myComplaints.length} submitted reports`,
      to: '/complaints',
      icon: ClipboardList,
      iconBg: 'bg-[#EFF6FF] text-[#0038A8]',
      accentBar: 'bg-[#0038A8]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cobalt Blue Welcome Banner + Private Complaint Tracker */}
      <section className="bg-[#0038A8] text-white rounded-2xl px-6 py-7 sm:px-8 sm:py-8 shadow-[0_6px_24px_rgba(0,56,168,0.16)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight leading-snug text-white">
              Welcome back, {profile.name}
            </h2>
            <p className="text-sm sm:text-[15px] text-white/85 max-w-xl leading-relaxed">
              Report civic issues in {profile.neighborhood} and across Delhi, follow neighbourhood updates, and track your own complaints in one place.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white text-[#0038A8] hover:bg-[#F3F2EE] rounded-xl transition-colors whitespace-nowrap"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white border border-white/35 hover:bg-white/10 rounded-xl transition-colors whitespace-nowrap"
              >
                <Compass className="w-4 h-4" strokeWidth={1.75} />
                <span>Explore Delhi Map</span>
              </Link>
            </div>
          </div>

          {/* Embedded White Tracker Card */}
          <div className="lg:col-span-5">
            <div className="bg-white text-[#111827] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <Search className="w-4 h-4 text-[#0038A8]" strokeWidth={2} />
                <span>Track Your Complaint</span>
              </div>
              <form onSubmit={handleTrackSubmit} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={trackIdInput}
                  onChange={(e) => {
                    setTrackIdInput(e.target.value);
                    if (trackError) setTrackError('');
                  }}
                  placeholder="e.g., DL-2026-1048"
                  aria-label="Enter your Complaint ID to track"
                  className="flex-1 h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                />
                <button
                  type="submit"
                  aria-label="Track complaint"
                  className="h-10 px-4 bg-[#0038A8] hover:bg-[#002D8A] text-white rounded-xl transition-colors inline-flex items-center justify-center shrink-0"
                >
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                <span>Your recent IDs:</span>
                {myComplaints.slice(0, 2).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTrackIdInput(item.id);
                      setTrackError('');
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#0038A8] font-medium hover:bg-[#DBEAFE] transition-colors tabular-nums"
                  >
                    {item.id}
                  </button>
                ))}
              </div>

              {trackError && (
                <p className="mt-2 text-xs text-[#DC2626]">{trackError}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Citizen Services Grid with Signature Accent Lines */}
      <section className="space-y-4">
        <div>
          <h3 className="text-[18px] font-bold text-[#111827]">
            Quick Citizen Services
          </h3>
          <p className="text-sm text-[#6B7280]">
            Choose a civic category to submit a report or open your complaint tracker
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickServices.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                to={service.to}
                className="bg-white border border-[#E7E5E0] hover:border-[#0038A8] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-[0_2px_14px_rgba(15,23,42,0.04)] group"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${service.iconBg}`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#111827] group-hover:text-[#0038A8] transition-colors">
                      {service.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6B7280] leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className={`h-[3px] w-16 rounded-full ${service.accentBar}`} />
              </Link>
            );
          })}

          <Link
            to="/explore"
            className="bg-[#0038A8] hover:bg-[#002D8A] text-white rounded-2xl p-5 flex flex-col justify-between gap-4 transition-colors shadow-[0_4px_18px_rgba(0,56,168,0.18)]"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center shrink-0">
                <LayoutGrid className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-white">
                  Explore All Delhi Issues
                </p>
                <p className="mt-0.5 text-xs text-white/80 leading-relaxed">
                  Browse the interactive map and neighbourhood reports
                </p>
              </div>
            </div>
            <div className="h-[3px] w-16 rounded-full bg-[#38BDF8]" />
          </Link>
        </div>
      </section>

      {/* Nearby Issues + Updates on Your Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <div className="px-6 py-4 border-b border-[#F0EFEA] flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">
              Nearby Issues in Delhi
            </h3>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0038A8] hover:underline whitespace-nowrap"
            >
              <span>See all on map</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
            </Link>
          </div>

          <ul className="divide-y divide-[#F0EFEA]">
            {nearbyIssues.map((issue) => (
              <li
                key={issue.id}
                className="px-6 py-4 flex items-start gap-4 hover:bg-[#FAF9F6] transition-colors"
              >
                <Link
                  to={`/explore?id=${issue.id}`}
                  className="w-[74px] h-[56px] rounded-xl overflow-hidden shrink-0 border border-[#E7E5E0] block"
                >
                  <IssueImage
                    src={issue.photoUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                    fallbackText="Photo"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/explore?id=${issue.id}`}
                      className="text-sm font-semibold text-[#111827] hover:text-[#0038A8] truncate"
                    >
                      {issue.title}
                    </Link>
                    <StatusLabel status={issue.status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
                      {issue.neighborhood} · {issue.location}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSupport(issue.id)}
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors tabular-nums ${
                          issue.supportedByMe
                            ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#0038A8]'
                            : 'bg-[#FAF9F6] border-[#E7E5E0] text-[#6B7280] hover:text-[#111827]'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" strokeWidth={1.75} />
                        <span>{issue.supporters}</span>
                      </button>
                      {issue.isMine && (
                        <Link
                          to={`/complaints?id=${issue.id}`}
                          className="text-xs font-semibold text-[#0038A8] hover:underline whitespace-nowrap"
                        >
                          Track
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <div className="px-6 py-4 border-b border-[#F0EFEA] flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#111827]">
              Updates on Your Reports
            </h3>
            <Link
              to="/complaints"
              className="text-xs font-semibold text-[#0038A8] hover:underline whitespace-nowrap"
            >
              My Complaints
            </Link>
          </div>

          <div className="p-6">
            {myActivity.length === 0 ? (
              <p className="text-sm text-[#6B7280]">
                Updates on complaints you submit will appear here.
              </p>
            ) : (
              <ol className="space-y-4">
                {myActivity.map((entry, idx) => {
                  const isLast = idx === myActivity.length - 1;
                  return (
                    <li key={entry.id} className="relative flex gap-3.5">
                      {!isLast && (
                        <span
                          className="absolute left-[5px] top-3 bottom-[-16px] w-px bg-[#E7E5E0]"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className="mt-1.5 w-[11px] h-[11px] rounded-full border-2 border-[#0038A8] bg-white shrink-0"
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 text-xs text-[#6B7280]">
                          <Link
                            to={`/complaints?id=${entry.issueId}`}
                            className="font-semibold text-[#0038A8] hover:underline tabular-nums"
                          >
                            {entry.issueId}
                          </Link>
                          <span className="tabular-nums">{entry.timestamp}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-[#111827] leading-snug">
                          {entry.action}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6B7280] truncate">
                          {entry.issueTitle}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
