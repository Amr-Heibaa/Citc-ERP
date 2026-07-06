import { useState } from 'react'
import { User, Lock, Eye, EyeOff, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { IconInput } from '@/components/icon-input'
import { useTokenStore } from '@/stores/token-store'
import citecLogo from '@/assets/citec-logo.png'

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
      setToken('dev-token')
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
              <Label htmlFor="username" className="text-[13px] font-semibold" style={{ color: '#374151' }}>Username</Label>
              <IconInput
                id="username"
                icon={User}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                className="h-[52px] rounded-[8px] bg-white text-[14px]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-[13px] font-semibold" style={{ color: '#374151' }}>Password</Label>
              <IconInput
                id="password"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-[52px] rounded-[8px] bg-white text-[14px]"
                trailing={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                }
              />
              <div className="flex justify-end">
                <Button type="button" variant="link" className="h-auto p-0 text-[13px] font-semibold" style={{ color: '#72cfe9' }}>
                  Forgot Password?
                </Button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-[56px] w-full rounded-[10px] text-[16px] font-extrabold text-white hover:opacity-90"
              style={{ background: '#72cfe9', boxShadow: '0 10px 12px rgba(114,207,233,0.25)' }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing In…
                </span>
              ) : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}