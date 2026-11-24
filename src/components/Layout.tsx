import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  ClipboardList,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { IssueImage } from './IssueImage';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/report', label: 'Report an Issue', icon: PlusCircle },
  { to: '/explore', label: 'Explore Issues', icon: Compass },
  { to: '/complaints', label: 'My Complaints', icon: ClipboardList },
  { to: '/community', label: 'Community', icon: Users },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/report': 'Report an Issue',
  '/explore': 'Explore Issues',
  '/complaints': 'My Complaints',
  '/community': 'Community',
  '/notifications': 'Notifications',
  '/profile': 'Settings',
};

export const Layout: React.FC = () => {
  const {
    notifications,
    profile,
    globalSearch,
    setGlobalSearch,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
  } = useCivic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageTitle = PAGE_TITLES[location.pathname] || 'CivicTrack';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== '/explore') {
      navigate('/explore');
    }
  };

  const renderPrimaryNav = (onClickItem?: () => void) => (
    <nav className="flex-1 py-4 space-y-1.5" aria-label="Primary Navigation">
      {PRIMARY_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClickItem}
            className={({ isActive }) =>
              `ml-3.5 pl-4 pr-4 py-3 flex items-center gap-3.5 text-[14px] rounded-l-full transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#F3F2EE] text-[#0038A8] font-semibold shadow-xs'
                  : 'text-white/90 hover:bg-white/10 hover:text-white font-normal'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  const renderSidebarBottom = (onClickItem?: () => void) => (
    <div className="py-4 border-t border-white/15 space-y-1.5">
      <NavLink
        to="/notifications"
        onClick={onClickItem}
        className={({ isActive }) =>
          `ml-3.5 pl-4 pr-4 py-2.5 flex items-center justify-between text-[14px] rounded-l-full transition-colors whitespace-nowrap ${
            isActive
              ? 'bg-[#F3F2EE] text-[#0038A8] font-semibold'
              : 'text-white/90 hover:bg-white/10 hover:text-white'
          }`
        }
      >
        <span className="flex items-center gap-3.5">
          <Bell className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
          <span>Notifications</span>
        </span>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#FACC15] text-[#111827] text-[11px] font-semibold tabular-nums">
            {unreadCount}
          </span>
        )}
      </NavLink>

      <NavLink
        to="/profile"
        onClick={onClickItem}
        className={({ isActive }) =>
          `ml-3.5 pl-4 pr-4 py-2.5 flex items-center gap-3.5 text-[14px] rounded-l-full transition-colors whitespace-nowrap ${
            isActive
              ? 'bg-[#F3F2EE] text-[#0038A8] font-semibold'
              : 'text-white/90 hover:bg-white/10 hover:text-white'
          }`
        }
      >
        <Settings className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
        <span>Settings</span>
      </NavLink>

      <button
        type="button"
        onClick={() => {
          if (onClickItem) onClickItem();
          logout();
          navigate('/login');
        }}
        className="w-[calc(100%-0.875rem)] ml-3.5 pl-4 pr-4 py-2.5 flex items-center gap-3.5 text-[14px] text-white/90 hover:bg-white/10 hover:text-white rounded-l-full transition-colors whitespace-nowrap"
      >
        <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F3F2EE] text-[#111827]">
      {/* Desktop Cobalt Blue Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 bg-[#0038A8] text-white sticky top-0 h-screen">
        <div className="h-20 px-5 flex items-center">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2L4 5.5V11.5C4 16.5 7.4 20.9 12 22C16.6 20.9 20 16.5 20 11.5V5.5L12 2Z"
                  stroke="#FFFFFF"
                  strokeWidth="1.9"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 12L10.8 14.3L15.8 9.3"
                  stroke="#FACC15"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="block text-[18px] font-bold tracking-tight text-white whitespace-nowrap">
                CivicTrack
              </span>
              <span className="block text-[11px] text-white/75 whitespace-nowrap">
                Delhi Citizen
              </span>
            </div>
          </NavLink>
        </div>

        {renderPrimaryNav()}
        {renderSidebarBottom()}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#111827]/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 max-w-full bg-[#0038A8] text-white flex flex-col h-full z-10">
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/15">
              <NavLink
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M8.5 12L10.8 14.3L15.8 9.3"
                      stroke="#FACC15"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[17px] font-bold tracking-tight text-white">
                  CivicTrack
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
            {renderPrimaryNav(() => setMobileMenuOpen(false))}
            {renderSidebarBottom(() => setMobileMenuOpen(false))}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Airy Top Bar matching reference dashboard */}
        <header className="h-16 bg-[#F3F2EE]/95 backdrop-blur-sm border-b border-[#E5E3DD] px-4 sm:px-7 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1.5 rounded-lg text-[#374151] hover:bg-white hover:text-[#111827]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>

            <h1 className="text-[19px] font-bold text-[#111827] truncate shrink-0">
              {pageTitle}
            </h1>

            <form onSubmit={handleSearchSubmit} className="hidden md:block relative w-72 ml-2">
              <Search
                className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.75}
              />
              <input
                type="search"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search Delhi issues or streets..."
                aria-label="Search civic issues"
                className="w-full h-9 pl-10 pr-3.5 text-sm bg-[#E6E5E0] border border-transparent rounded-lg text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#0038A8] transition-colors"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs sm:text-sm font-medium text-white bg-[#0038A8] hover:bg-[#002D8A] rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>Report Issue</span>
            </Link>

            {/* Notifications Bell with Golden Badge */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                aria-expanded={notifOpen}
                aria-haspopup="true"
                className={`relative p-2 rounded-full transition-colors ${
                  notifOpen
                    ? 'bg-white text-[#0038A8] shadow-xs'
                    : 'text-[#374151] hover:bg-white hover:text-[#111827]'
                }`}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-5 h-5" strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FACC15] text-[#111827] text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E7E5E0] rounded-2xl shadow-lg z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#F0EFEA] flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#111827]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-xs font-medium text-[#0038A8] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <ul className="divide-y divide-[#F0EFEA] max-h-80 overflow-y-auto">
                    {notifications.slice(0, 4).map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(item.id);
                            setNotifOpen(false);
                            if (item.issueId) {
                              navigate(`/complaints?id=${item.issueId}`);
                            } else {
                              navigate('/notifications');
                            }
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-[#FAF9F6] transition-colors ${
                            item.read ? 'bg-white' : 'bg-[#EFF6FF]/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#6B7280]">
                            <span className="font-medium">{item.type}</span>
                            <span className="tabular-nums">{item.timestamp}</span>
                          </div>
                          <p className="mt-0.5 text-xs font-semibold text-[#111827]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#6B7280] line-clamp-2">
                            {item.message}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2.5 border-t border-[#F0EFEA] bg-[#FAF9F6] text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-medium text-[#0038A8] hover:underline"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-white transition-colors"
            >
              <IssueImage
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-9 h-9 rounded-full object-cover border border-[#E7E5E0] shrink-0"
                fallbackText=""
              />
              <div className="leading-tight min-w-0">
                <p className="text-xs font-semibold text-[#111827] truncate max-w-[120px]">
                  {profile.name}
                </p>
                <p className="text-[11px] text-[#6B7280] truncate max-w-[120px]">
                  {profile.neighborhood}, Delhi
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-7 max-w-[1320px] w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-[#E5E3DD] bg-[#FAF9F6] px-4 sm:px-7 py-3.5">
          <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#6B7280]">
            <span>CivicTrack · Delhi Citizen Portal</span>
            <div className="flex items-center gap-4">
              <Link to="/report" className="hover:text-[#111827]">
                Report an Issue
              </Link>
              <Link to="/explore" className="hover:text-[#111827]">
                Explore Map
              </Link>
              <Link to="/complaints" className="hover:text-[#111827]">
                My Complaints
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
