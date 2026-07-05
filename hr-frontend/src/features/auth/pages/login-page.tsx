import { useState } from 'react'
import { User, Lock, Eye, EyeOff, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router'

import { useTokenStore } from '@/stores/token-store'
import citecLogo from "@/assets/citec-logo.png";

function LogoIcon() {
  return (
    <div className="bg-[#193764] flex items-center justify-center rounded-[12px] shrink-0 size-[44px]">
      <Building2 className="size-[22px]" color="white" strokeWidth={2} />
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const setToken = useTokenStore((s) => s.setToken)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    // TEMPORARY fake sign-in — Phase 3 replaces this with the real useLogin mutation
    setTimeout(() => {
      setIsLoading(false)
      setToken('dev-token') // pretend the backend returned a token
      navigate('/')
    }, 1200)
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#1a2535', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Decorative circles */}
      <div className="absolute right-10 -top-28 size-[360px] rounded-full pointer-events-none" style={{ background: 'rgba(31,241,245,0.10)' }} />
      <div className="absolute -bottom-28 -left-20 size-[280px] rounded-full pointer-events-none" style={{ background: 'rgba(46,204,113,0.13)' }} />
      <div className="absolute bottom-4 right-52 size-[220px] rounded-[32px] rotate-[18deg] pointer-events-none" style={{ background: 'rgba(30,144,255,0.08)' }} />

      {/* Main card */}
      <div className="relative flex rounded-[20px] overflow-hidden shadow-2xl" style={{ width: 'min(900px, 95vw)', minHeight: '520px' }}>
        {/* Left panel – branding */}
        <div className="flex flex-col items-center justify-center gap-6 px-10 py-12" style={{ background: '#f3f3f3', flex: '0 0 38%' }}>
          <div className="relative w-full flex items-center justify-center">
            <img src={citecLogo} alt="CITEC Logo" className="w-[200px] object-contain" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="font-bold text-[15px] tracking-wide" style={{ color: '#193764' }}>
              CIVIL INFORMATION TECHNOLOGY CO.
            </p>
            <p className="font-bold text-[22px]" style={{ color: '#193764', fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif", direction: 'rtl' }}>
              شركة تكنولوجيا المعلومات المدنية
            </p>
          </div>
          <p className="font-bold text-[28px] mt-4" style={{ color: '#72cfe9' }}>
            Welcome Back
          </p>
        </div>

        {/* Right panel – form */}
        <div className="flex items-center justify-center flex-1 py-12 px-10" style={{ background: '#ffffff' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-[420px]" autoComplete="off">
            {/* Header */}
            <div className="flex flex-col gap-3">
              <LogoIcon />
              <div className="flex flex-col gap-1.5">
                <h1 className="font-extrabold text-[28px] leading-tight" style={{ color: '#193764' }}>Sign In</h1>
                <p className="text-[14px] leading-relaxed" style={{ color: '#6b7280' }}>Access your ERP dashboard</p>
              </div>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[13px]" style={{ color: '#374151' }} htmlFor="username">Username</label>
              <div className="flex items-center gap-2.5 h-[52px] px-3.5 rounded-[8px] bg-white border transition-colors"
                style={{ borderColor: username ? '#72cfe9' : '#e5e7eb', boxShadow: '0 1px 1px rgba(0,0,0,0.04)' }}>
                <User className="size-5 shrink-0" style={{ color: '#9ca3af' }} />
                <input
                  id="username" type="text" value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9ca3af]"
                  style={{ color: '#111827' }} autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-[13px]" style={{ color: '#374151' }} htmlFor="password">Password</label>
              <div className="flex items-center gap-2.5 h-[52px] px-3.5 rounded-[8px] bg-white border transition-colors"
                style={{ borderColor: password ? '#72cfe9' : '#e5e7eb', boxShadow: '0 1px 1px rgba(0,0,0,0.04)' }}>
                <Lock className="size-5 shrink-0" style={{ color: '#9ca3af' }} />
                <input
                  id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#9ca3af]"
                  style={{ color: '#111827' }} autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="shrink-0 text-[#9ca3af] hover:text-[#6b7280] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button type="button" className="font-semibold text-[13px] transition-opacity hover:opacity-70" style={{ color: '#72cfe9' }}>
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="flex items-center justify-center h-[56px] rounded-[10px] font-extrabold text-[16px] text-white transition-opacity disabled:opacity-70"
              style={{ background: '#72cfe9', boxShadow: '0 10px 12px rgba(114,207,233,0.25)' }}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing In…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}