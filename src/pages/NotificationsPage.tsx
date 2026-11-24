import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, MapPin, UserCheck } from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { NotificationType } from '../types/civic';

const FILTER_TYPES: ('All' | NotificationType)[] = [
  'All',
  'Complaint Update',
  'Officer Assignment',
  'Resolution Update',
  'Nearby Alert',
];

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useCivic();
  const [activeType, setActiveType] = useState<'All' | NotificationType>('All');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (activeType !== 'All' && n.type !== activeType) return false;
      if (unreadOnly && n.read) return false;
      return true;
    });
  }, [notifications, activeType, unreadOnly]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'Officer Assignment':
        return <UserCheck className="w-4 h-4 text-[#0038A8]" strokeWidth={1.8} />;
      case 'Resolution Update':
        return <Check className="w-4 h-4 text-[#16A34A]" strokeWidth={1.8} />;
      case 'Nearby Alert':
        return <MapPin className="w-4 h-4 text-[#D97706]" strokeWidth={1.8} />;
      default:
        return <Bell className="w-4 h-4 text-[#0038A8]" strokeWidth={1.8} />;
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* Filter & Mark All Read */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl px-5 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_TYPES.map((type) => {
            const active = activeType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#0038A8] text-white'
                    : 'text-[#4B5563] bg-[#F5F4F0] hover:bg-[#EAE9E4] hover:text-[#111827]'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              unreadOnly
                ? 'bg-[#EFF6FF] border-[#0038A8] text-[#0038A8]'
                : 'bg-[#F5F4F0] border-[#E2E0D8] text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Unread only ({unreadCount})
          </button>

          <button
            type="button"
            onClick={markAllNotificationsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0038A8] hover:underline disabled:text-[#6B7280] disabled:no-underline whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4" strokeWidth={1.75} />
            <span>Mark all as read</span>
          </button>
        </div>
      </div>

      {/* Notification List */}
      <section className="bg-white border border-[#E7E5E0] rounded-2xl divide-y divide-[#F0EFEA] overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">
            {unreadOnly
              ? 'You are caught up — no unread notifications.'
              : 'No notifications in this category.'}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`px-6 py-4 flex items-start gap-4 transition-colors ${
                item.read ? 'bg-white' : 'bg-[#EFF6FF]/70'
              }`}
            >
              <div className="mt-0.5 w-9 h-9 rounded-full bg-[#FAF9F6] border border-[#E7E5E0] flex items-center justify-center shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#6B7280]">
                    {item.type}
                  </span>
                  <span className="text-xs text-[#6B7280] tabular-nums">
                    {item.timestamp}
                  </span>
                </div>

                <h2
                  className={`mt-1 text-sm ${
                    item.read
                      ? 'font-normal text-[#111827]'
                      : 'font-semibold text-[#111827]'
                  }`}
                >
                  {item.title}
                </h2>

                <p className="mt-1 text-sm text-[#6B7280]">{item.message}</p>

                <div className="mt-2.5 flex items-center gap-4 text-xs">
                  {item.issueId && (
                    <Link
                      to={`/complaints?id=${item.issueId}`}
                      onClick={() => markNotificationRead(item.id)}
                      className="font-semibold text-[#0038A8] hover:underline"
                    >
                      View complaint
                    </Link>
                  )}
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(item.id)}
                      className="text-[#6B7280] hover:text-[#111827]"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};
