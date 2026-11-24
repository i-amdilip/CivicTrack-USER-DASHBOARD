import React, { useState } from 'react';
import { Check, Upload } from 'lucide-react';
import { IssueImage } from '../components/IssueImage';
import { useCivic } from '../context/CivicContext';
import { DELHI_LOCALITIES } from '../data/mockData';
import { CitizenProfile } from '../types/civic';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
      checked ? 'bg-[#0038A8]' : 'bg-[#D1D5DB]'
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
      }`}
    />
  </button>
);

export const ProfilePage: React.FC = () => {
  const { profile, issues, updateProfile } = useCivic();
  const [form, setForm] = useState<CitizenProfile>(profile);
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const myReportsCount = issues.filter((i) => i.isMine).length;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        setSavedNotice(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg('Name and email address are required.');
      return;
    }
    setErrorMsg('');
    updateProfile(form);
    setSavedNotice(true);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <section className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <div className="px-6 py-4 border-b border-[#F0EFEA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-[16px] font-bold text-[#111827]">
                Citizen Profile
              </h2>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                Keep your contact details current so city departments can reach you about submitted reports.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-semibold text-[#0038A8] tabular-nums shrink-0">
              {myReportsCount} submitted reports
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#E7E5E0] shrink-0">
                <IssueImage
                  src={form.avatarUrl}
                  alt={form.name}
                  className="w-full h-full object-cover"
                  fallbackText="Photo"
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#111827] bg-[#F5F4F0] border border-[#E2E0D8] hover:bg-[#EAE9E4] rounded-xl cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Change photograph</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                </label>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Used on your citizen account and support activity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-sm font-medium text-[#111827] mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    setSavedNotice(false);
                  }}
                  className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-sm font-medium text-[#111827] mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setSavedNotice(false);
                  }}
                  className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-sm font-medium text-[#111827] mb-1.5"
                >
                  Phone number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    setSavedNotice(false);
                  }}
                  className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-neighborhood"
                  className="block text-sm font-medium text-[#111827] mb-1.5"
                >
                  Delhi Locality
                </label>
                <select
                  id="profile-neighborhood"
                  value={form.neighborhood}
                  onChange={(e) => {
                    setForm({ ...form, neighborhood: e.target.value });
                    setSavedNotice(false);
                  }}
                  className="w-full h-10 px-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                >
                  {DELHI_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}, Delhi
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-address"
                className="block text-sm font-medium text-[#111827] mb-1.5"
              >
                Residential address
              </label>
              <input
                id="profile-address"
                type="text"
                value={form.address}
                onChange={(e) => {
                  setForm({ ...form, address: e.target.value });
                  setSavedNotice(false);
                }}
                className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
              />
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <div className="px-6 py-4 border-b border-[#F0EFEA]">
            <h2 className="text-[16px] font-bold text-[#111827]">
              Account Settings
            </h2>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Manage how CivicTrack sends complaint progress and neighborhood alerts.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="block text-sm font-medium text-[#111827]">
                  Email complaint updates
                </span>
                <span className="block text-xs text-[#6B7280]">
                  Receive an email when a department assigns an officer or resolves your report.
                </span>
              </div>
              <ToggleSwitch
                checked={form.preferences.emailUpdates}
                label="Toggle email complaint updates"
                onChange={(next) => {
                  setForm({
                    ...form,
                    preferences: { ...form.preferences, emailUpdates: next },
                  });
                  setSavedNotice(false);
                }}
              />
            </div>

            <div className="border-t border-[#F0EFEA] pt-4 flex items-start justify-between gap-4">
              <div>
                <span className="block text-sm font-medium text-[#111827]">
                  SMS status alerts
                </span>
                <span className="block text-xs text-[#6B7280]">
                  Receive text messages for high-priority and critical municipal notices.
                </span>
              </div>
              <ToggleSwitch
                checked={form.preferences.smsAlerts}
                label="Toggle SMS status alerts"
                onChange={(next) => {
                  setForm({
                    ...form,
                    preferences: { ...form.preferences, smsAlerts: next },
                  });
                  setSavedNotice(false);
                }}
              />
            </div>

            <div className="border-t border-[#F0EFEA] pt-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="block text-sm font-medium text-[#111827]">
                    Nearby civic alerts
                  </span>
                  <span className="block text-xs text-[#6B7280]">
                    Get notified about newly reported issues within your neighborhood radius.
                  </span>
                </div>
                <ToggleSwitch
                  checked={form.preferences.nearbyAlerts}
                  label="Toggle nearby civic alerts"
                  onChange={(next) => {
                    setForm({
                      ...form,
                      preferences: { ...form.preferences, nearbyAlerts: next },
                    });
                    setSavedNotice(false);
                  }}
                />
              </div>

              {form.preferences.nearbyAlerts && (
                <div className="mt-3 flex items-center gap-3">
                  <label
                    htmlFor="alert-radius"
                    className="text-xs font-medium text-[#6B7280]"
                  >
                    Alert radius:
                  </label>
                  <select
                    id="alert-radius"
                    value={form.preferences.alertRadiusKm}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        preferences: {
                          ...form.preferences,
                          alertRadiusKm: Number(e.target.value),
                        },
                      });
                      setSavedNotice(false);
                    }}
                    className="h-8 px-2.5 text-xs bg-[#F5F4F0] border border-[#E2E0D8] rounded-lg text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                  >
                    <option value={1}>1 km</option>
                    <option value={2}>2 km</option>
                    <option value={5}>5 km</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>

        {errorMsg && <p className="text-sm text-[#DC2626]">{errorMsg}</p>}

        <div className="flex items-center justify-between gap-4">
          <div>
            {savedNotice && (
              <span className="inline-flex items-center gap-1.5 text-sm text-[#16A34A] font-medium">
                <Check className="w-4 h-4" strokeWidth={1.75} />
                Changes saved
              </span>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0038A8] hover:bg-[#002D8A] rounded-xl transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
