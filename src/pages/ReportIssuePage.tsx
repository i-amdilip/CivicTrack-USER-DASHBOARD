import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Crosshair,
  FileText,
  Layers,
  MapPin,
  Upload,
  X,
} from 'lucide-react';
import { CivicMap } from '../components/CivicMap';
import { useCivic } from '../context/CivicContext';
import { DELHI_LOCALITIES, DELHI_LOCALITY_COORDS } from '../data/mockData';
import { CivicIssue, IssueCategory, IssueSeverity } from '../types/civic';
import { getDistanceMeters, isSameProblemByLocation } from '../utils/issueGrouping';

const CATEGORIES: IssueCategory[] = [
  'Road & Sidewalk',
  'Street Lighting',
  'Waste & Sanitation',
  'Water & Drainage',
  'Parks & Trees',
  'Traffic & Signage',
];

const SEVERITIES: IssueSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

const SEVERITY_ACTIVE_STYLES: Record<IssueSeverity, string> = {
  Low: 'bg-[#ECFDF5] border-[#16A34A] text-[#15803D] font-semibold',
  Medium: 'bg-[#FFFBEB] border-[#F59E0B] text-[#D97706] font-semibold',
  High: 'bg-[#FFF7ED] border-[#EA580C] text-[#C2410C] font-semibold',
  Critical: 'bg-[#FEF2F2] border-[#EF4444] text-[#DC2626] font-semibold',
};

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
}

export const ReportIssuePage: React.FC = () => {
  const { issues, submitIssue, profile } = useCivic();
  const [searchParams] = useSearchParams();
  const initialCategoryParam = searchParams.get('category') as IssueCategory | null;
  const initialNeighborhoodParam = searchParams.get('neighborhood');
  const initialLocationParam = searchParams.get('location');
  const initialLatParam = Number(searchParams.get('lat'));
  const initialLngParam = Number(searchParams.get('lng'));

  const resolvedInitialNeighborhood =
    initialNeighborhoodParam && DELHI_LOCALITIES.includes(initialNeighborhoodParam)
      ? initialNeighborhoodParam
      : profile.neighborhood;

  const fallbackCoords =
    DELHI_LOCALITY_COORDS[resolvedInitialNeighborhood] || {
      lat: 28.5677,
      lng: 77.2433,
    };

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IssueCategory>(
    initialCategoryParam && CATEGORIES.includes(initialCategoryParam)
      ? initialCategoryParam
      : 'Road & Sidewalk'
  );
  const [severity, setSeverity] = useState<IssueSeverity>('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(initialLocationParam || '');
  const [neighborhood, setNeighborhood] = useState(resolvedInitialNeighborhood);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    Number.isFinite(initialLatParam) &&
      Number.isFinite(initialLngParam) &&
      initialLatParam !== 0 &&
      initialLngParam !== 0
      ? { lat: initialLatParam, lng: initialLngParam }
      : fallbackCoords
  );

  useEffect(() => {
    const paramCat = searchParams.get('category') as IssueCategory | null;
    if (paramCat && CATEGORIES.includes(paramCat)) {
      setCategory(paramCat);
    }
    const paramLoc = searchParams.get('location');
    if (paramLoc) setLocation(paramLoc);
    const paramNeigh = searchParams.get('neighborhood');
    if (paramNeigh && DELHI_LOCALITIES.includes(paramNeigh)) {
      setNeighborhood(paramNeigh);
    }
    const pLat = Number(searchParams.get('lat'));
    const pLng = Number(searchParams.get('lng'));
    if (Number.isFinite(pLat) && Number.isFinite(pLng) && pLat !== 0 && pLng !== 0) {
      setCoords({ lat: pLat, lng: pLng });
    }
  }, [searchParams]);

  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [photoName, setPhotoName] = useState<string>('');
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [detectingGps, setDetectingGps] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedIssue, setSubmittedIssue] = useState<CivicIssue | null>(null);

  const nearbyMatchingIssues = useMemo(
    () =>
      issues.filter((existing) =>
        isSameProblemByLocation(existing, {
          category,
          neighborhood,
          latitude: coords.lat,
          longitude: coords.lng,
        })
      ),
    [issues, category, neighborhood, coords]
  );

  const nearestDistance = nearbyMatchingIssues[0]
    ? getDistanceMeters(
        nearbyMatchingIssues[0].latitude,
        nearbyMatchingIssues[0].longitude,
        coords.lat,
        coords.lng
      )
    : null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDetectGps = () => {
    setGpsStatus('');
    if (!navigator.geolocation) {
      setGpsStatus(
        'Geolocation is not supported by this browser. Click the map to set coordinates.'
      );
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(5));
        const lng = Number(position.coords.longitude.toFixed(5));
        setCoords({ lat, lng });
        if (!location.trim()) {
          setLocation(`Near ${lat}, ${lng}`);
        }
        setGpsStatus(`Location detected (${lat}, ${lng}).`);
        setDetectingGps(false);
      },
      () => {
        const fallbackLat = 28.5677;
        const fallbackLng = 77.2433;
        setCoords({ lat: fallbackLat, lng: fallbackLng });
        if (!location.trim()) {
          setLocation('Block B, Lajpat Nagar II, New Delhi');
        }
        setGpsStatus(
          'Browser location access unavailable; centered pin on Delhi. Drag or click map to adjust.'
        );
        setDetectingGps(false);
      },
      { timeout: 6000 }
    );
  };

  const handlePickMapLocation = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    if (!location.trim()) {
      setLocation(`Pinned location (${lat}, ${lng})`);
    }
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: undefined }));
    }
    setGpsStatus(`Map pin updated to ${lat}, ${lng}.`);
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (title.trim().length < 6) {
      nextErrors.title = 'Please enter a concise title (at least 6 characters).';
    }
    if (description.trim().length < 15) {
      nextErrors.description =
        'Please describe the issue and any safety impact (at least 15 characters).';
    }
    if (!location.trim()) {
      nextErrors.location =
        'Please enter a street address or click the map to set a location.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const created = submitIssue({
      title,
      category,
      description,
      severity,
      location,
      neighborhood,
      latitude: coords.lat,
      longitude: coords.lng,
      photoUrl: photoPreview,
    });
    setSubmittedIssue(created);
  };

  const handleResetForm = () => {
    setTitle('');
    setCategory('Road & Sidewalk');
    setSeverity('Medium');
    setDescription('');
    setLocation('');
    setNeighborhood(profile.neighborhood);
    setCoords(
      DELHI_LOCALITY_COORDS[profile.neighborhood] || { lat: 28.5677, lng: 77.2433 }
    );
    setPhotoPreview(undefined);
    setPhotoName('');
    setGpsStatus('');
    setErrors({});
    setSubmittedIssue(null);
  };

  if (submittedIssue) {
    return (
      <div className="max-w-2xl bg-white border border-[#E7E5E0] rounded-2xl p-6 sm:p-8 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              Issue report submitted
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Your complaint has been logged under reference{' '}
              <span className="font-semibold text-[#0038A8] tabular-nums">
                {submittedIssue.id}
              </span>{' '}
              and routed to the responsible municipal department.
            </p>
            {submittedIssue.problemGroupId && (
              <div className="mt-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-3 text-xs text-[#111827] flex items-start gap-2.5">
                <Layers
                  className="w-4 h-4 text-[#0038A8] shrink-0 mt-0.5"
                  strokeWidth={1.75}
                />
                <span>
                  Automatically grouped by your {submittedIssue.neighborhood}{' '}
                  location with existing nearby reports for{' '}
                  <strong>{submittedIssue.category}</strong> in Community.
                </span>
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to={`/complaints?id=${submittedIssue.id}`}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0038A8] hover:bg-[#002D8A] rounded-xl transition-colors"
              >
                Track Complaint
              </Link>
              <Link
                to="/community"
                className="px-4 py-2 text-sm font-medium text-[#0038A8] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-xl transition-colors"
              >
                View in Community
              </Link>
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 text-sm font-medium text-[#111827] bg-[#F5F4F0] border border-[#E2E0D8] hover:bg-[#EAE9E4] rounded-xl transition-colors"
              >
                Submit Another Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Cobalt Blue Intro Banner */}
      <section className="bg-[#0038A8] text-white rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-[0_4px_18px_rgba(0,56,168,0.14)]">
        <div>
          <h2 className="text-[18px] font-bold text-white">
            Report a Civic Issue in Delhi
          </h2>
          <p className="text-xs sm:text-sm text-white/85 mt-0.5">
            Pin the location and provide details so PWD, MCD, NDMC, or DJB crews can inspect and resolve it.
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full bg-white/15 text-xs font-medium text-white whitespace-nowrap self-start sm:self-center">
          {neighborhood}, Delhi
        </span>
      </section>

      {nearbyMatchingIssues.length > 0 && (
        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl px-5 py-4 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#0038A8] text-white flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="text-xs text-[#111827] leading-relaxed">
            <p className="font-semibold text-[#111827]">
              Automated Location Match: {nearbyMatchingIssues.length} existing{' '}
              {category} report{nearbyMatchingIssues.length > 1 ? 's' : ''} found
              nearby in {neighborhood} (~{Math.max(20, nearestDistance ?? 50)}m away)
            </p>
            <p className="mt-0.5 text-[#4B5563]">
              Closest report: &ldquo;{nearbyMatchingIssues[0].title}&rdquo;. Submitting
              this form gives you a private tracking ID and automatically groups it
              into the same community problem.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Issue Details */}
        <section className="lg:col-span-7 bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <div className="px-6 py-4 border-b border-[#F0EFEA] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#0038A8] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#111827]">
                Issue Details
              </h2>
              <p className="text-xs text-[#6B7280]">
                Describe the problem clearly so municipal crews can prepare the right equipment.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="issue-title"
                  className="block text-sm font-medium text-[#111827] mb-1.5"
                >
                  Issue title <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  id="issue-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors({ ...errors, title: undefined });
                  }}
                  placeholder="e.g., Broken streetlight near Lajpat Nagar Metro Gate 2"
                  className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8] transition-colors"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-[#DC2626]">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="issue-category"
                  className="block text-sm font-medium text-[#111827] mb-1.5"
                >
                  Category
                </label>
                <select
                  id="issue-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full h-10 px-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8] transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-[#111827] mb-1.5">
                Severity level
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SEVERITIES.map((level) => {
                  const active = severity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      className={`h-9 px-3 text-sm rounded-xl border transition-colors text-center ${
                        active
                          ? SEVERITY_ACTIVE_STYLES[level]
                          : 'bg-[#F5F4F0] border-[#E2E0D8] text-[#4B5563] hover:text-[#111827] hover:bg-[#EAE9E4]'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="issue-description"
                className="block text-sm font-medium text-[#111827] mb-1.5"
              >
                Description <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                id="issue-description"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description)
                    setErrors({ ...errors, description: undefined });
                }}
                placeholder="Describe what you observed, exact landmarks, and any safety hazard for pedestrians or vehicles."
                className="w-full p-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8] transition-colors"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-[#DC2626]">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <span className="block text-sm font-medium text-[#111827] mb-1.5">
                Photograph (optional)
              </span>
              {!photoPreview ? (
                <label className="flex flex-col items-center justify-center border border-dashed border-[#93C5FD] rounded-xl px-4 py-6 bg-[#FAF9F6] hover:bg-[#EFF6FF]/60 cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#0038A8] flex items-center justify-center mb-2">
                    <Upload className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <span className="text-sm font-medium text-[#111827]">
                    Click to upload an image
                  </span>
                  <span className="mt-0.5 text-xs text-[#6B7280]">
                    JPG, PNG, or WebP up to 10 MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="border border-[#E2E0D8] rounded-xl p-3 flex items-center justify-between gap-4 bg-[#FAF9F6]">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={photoPreview}
                      alt="Uploaded issue preview"
                      className="w-20 h-16 object-cover rounded-lg border border-[#E2E0D8] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#111827] truncate">
                        {photoName || 'Attached photo'}
                      </p>
                      <p className="text-xs text-[#16A34A] font-medium">
                        Ready for submission
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(undefined);
                      setPhotoName('');
                    }}
                    className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-white transition-colors"
                    aria-label="Remove photo"
                  >
                    <X className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Location & Interactive Map */}
        <section className="lg:col-span-5 bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <div className="px-6 py-4 border-b border-[#F0EFEA] flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Location & Map Pin
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Click or drag the pin to mark the spot.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDetectGps}
              disabled={detectingGps}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0038A8] hover:bg-[#002D8A] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Crosshair className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>{detectingGps ? 'Detecting...' : 'Detect GPS'}</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="issue-location"
                className="block text-xs font-medium text-[#4B5563] mb-1.5"
              >
                Street address or intersection{' '}
                <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="issue-location"
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location)
                    setErrors({ ...errors, location: undefined });
                }}
                placeholder="e.g., Ring Road Service Lane, Lajpat Nagar II"
                className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8] transition-colors"
              />
              {errors.location && (
                <p className="mt-1 text-xs text-[#DC2626]">{errors.location}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="issue-neighborhood"
                className="block text-xs font-medium text-[#4B5563] mb-1.5"
              >
                Delhi Locality
              </label>
              <select
                id="issue-neighborhood"
                value={neighborhood}
                onChange={(e) => {
                  const nextLocality = e.target.value;
                  setNeighborhood(nextLocality);
                  const nextCoords = DELHI_LOCALITY_COORDS[nextLocality];
                  if (nextCoords) {
                    setCoords(nextCoords);
                  }
                }}
                className="w-full h-10 px-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8] transition-colors"
              >
                {DELHI_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}, Delhi
                  </option>
                ))}
              </select>
            </div>

            {gpsStatus && (
              <p className="text-xs text-[#0038A8] bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl px-3.5 py-2.5 leading-relaxed">
                {gpsStatus}
              </p>
            )}

            <div className="space-y-1.5">
              <CivicMap
                pickerPosition={coords}
                onPickLocation={handlePickMapLocation}
                center={[coords.lat, coords.lng]}
                zoom={14}
                className="w-full h-64 rounded-xl"
              />
              <p className="text-xs text-[#6B7280] tabular-nums">
                Coordinates: {coords.lat}, {coords.lng}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Form Footer Action Bar */}
      <div className="bg-white border border-[#E7E5E0] rounded-2xl px-6 py-4 flex items-center justify-between gap-4 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <p className="text-xs text-[#6B7280]">
          Fields marked with <span className="text-[#DC2626]">*</span> are required.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-[#111827] bg-[#F5F4F0] border border-[#E2E0D8] hover:bg-[#EAE9E4] rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-[#0038A8] hover:bg-[#002D8A] rounded-xl transition-colors"
          >
            Submit Report
          </button>
        </div>
      </div>
    </form>
  );
};
