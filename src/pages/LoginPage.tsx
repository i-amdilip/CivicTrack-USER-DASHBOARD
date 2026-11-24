import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { DELHI_LOCALITIES } from '../data/mockData';

type AuthMode = 'signin' | 'register';

export const LoginPage: React.FC = () => {
  const { login } = useCivic();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [neighborhood, setNeighborhood] = useState('Lajpat Nagar');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [resetNotice, setResetNotice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetNotice('');

    if (mode === 'register' && name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    if (mode === 'register') {
      login(email.trim(), name.trim(), neighborhood.trim() || 'Lajpat Nagar');
    } else {
      login(email.trim());
    }
    navigate('/', { replace: true });
  };

  const handleDemoSignIn = () => {
    setError('');
    setResetNotice('');
    login('ananya.sharma@example.in', 'Ananya Sharma', 'Lajpat Nagar');
    navigate('/', { replace: true });
  };

  const handleForgotPassword = () => {
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setResetNotice(
        'Enter your email address above, then click Forgot password to receive reset instructions.'
      );
      return;
    }
    setResetNotice(
      `If an account exists for ${email.trim()}, password reset instructions have been sent.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F2EE] flex flex-col justify-center px-4 py-10">
      <div className="w-full max-w-[430px] mx-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0038A8] flex items-center justify-center shadow-xs">
              <svg
                width="20"
                height="20"
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
            <span className="text-[22px] font-bold tracking-tight text-[#111827]">
              CivicTrack
            </span>
          </div>
          <p className="mt-1.5 text-sm text-[#6B7280]">
            Delhi Citizen Portal · Report and track local civic issues
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 border-b border-[#F0EFEA] bg-[#FAF9F6]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setResetNotice('');
              }}
              className={`py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                mode === 'signin'
                  ? 'bg-white text-[#0038A8] border-[#0038A8]'
                  : 'text-[#6B7280] border-transparent hover:text-[#111827]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setResetNotice('');
              }}
              className={`py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                mode === 'register'
                  ? 'bg-white text-[#0038A8] border-[#0038A8]'
                  : 'text-[#6B7280] border-transparent hover:text-[#111827]'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="login-name"
                  className="block text-sm font-medium text-[#111827] mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="login-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ananya Sharma"
                  className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[#111827] mb-1.5"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="name@example.in"
                className="w-full h-10 px-3.5 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8]"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label
                  htmlFor="login-neighborhood"
                  className="block text-sm font-medium text-[#111827] mb-1.5"
                >
                  Delhi Locality
                </label>
                <select
                  id="login-neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                >
                  {DELHI_LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}, Delhi
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-[#111827]"
                >
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-[#0038A8] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  className="w-full h-10 pl-3.5 pr-10 text-sm bg-[#F5F4F0] border border-[#E2E0D8] rounded-xl text-[#111827] placeholder:text-[#6B7280] focus:bg-white focus:outline-none focus:border-[#0038A8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#111827]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-4 h-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <label className="flex items-center gap-2 text-xs text-[#6B7280] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E2E0D8] accent-[#0038A8]"
                />
                <span>Keep me signed in on this device</span>
              </label>
            )}

            {error && (
              <p className="text-xs text-[#DC2626]" role="alert">
                {error}
              </p>
            )}

            {resetNotice && (
              <p className="text-xs text-[#16A34A] bg-[#DCFCE7] rounded-xl px-3.5 py-2.5">
                {resetNotice}
              </p>
            )}

            <button
              type="submit"
              className="w-full h-10 text-sm font-semibold text-white bg-[#0038A8] hover:bg-[#002D8A] rounded-xl transition-colors"
            >
              {mode === 'signin' ? 'Sign In' : 'Create Citizen Account'}
            </button>

            <div className="relative py-1 flex items-center">
              <div className="flex-grow border-t border-[#F0EFEA]" />
              <span className="px-3 text-xs text-[#6B7280]">or</span>
              <div className="flex-grow border-t border-[#F0EFEA]" />
            </div>

            <button
              type="button"
              onClick={handleDemoSignIn}
              className="w-full h-10 text-sm font-medium text-[#111827] bg-[#F5F4F0] border border-[#E2E0D8] hover:bg-[#EAE9E4] rounded-xl transition-colors"
            >
              Continue as Ananya Sharma (Demo)
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-[#6B7280]">
          Only you can view and track the status of your private complaints.
        </p>
      </div>
    </div>
  );
};
