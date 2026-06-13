import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useI18n, type TranslationKey } from '../lib/i18n'
import { supabase } from '../lib/supabase/client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

type LoginMethod = 'email' | 'phone'

function LoginPage() {
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const [method, setMethod] = useState<LoginMethod>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function resetAlerts() {
    setError('')
  }

  function switchMethod(nextMethod: LoginMethod) {
    setMethod(nextMethod)
    resetAlerts()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetAlerts()

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = normalizePakistanPhone(phone)

    if (method === 'email' && !isValidEmail(normalizedEmail)) {
      setError(t('login.error.invalidEmail'))
      return
    }

    if (method === 'phone' && !isValidPakistanMobile(normalizedPhone)) {
      setError(t('login.error.invalidPhone'))
      return
    }

    if (!password.trim()) {
      setError(t('login.error.passwordRequired'))
      return
    }

    setLoading(true)

    const { error: loginError } =
      method === 'email'
        ? await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          })
        : await supabase.auth.signInWithPassword({
            phone: normalizedPhone,
            password,
          })

    setLoading(false)

    if (loginError) {
      setError(toFriendlyAuthError(loginError.message, t))
      return
    }

    await navigate({ to: '/dashboard', replace: true })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10" dir={direction}>
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {t('login.form.title')}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('login.hero.description')}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => switchMethod('email')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              method === 'email'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={method === 'email'}
          >
            {t('authPage.common.emailMethod')}
          </button>
          <button
            type="button"
            onClick={() => switchMethod('phone')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              method === 'phone'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            aria-pressed={method === 'phone'}
          >
            {t('authPage.common.mobileOtp')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'email' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t('authPage.common.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required={method === 'email'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
                placeholder={t('login.email.placeholder')}
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {t('authPage.common.mobileNumber')}
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required={method === 'phone'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
                placeholder="03001234567"
              />
              <p className="mt-1 text-xs text-slate-500">
                {t('authPage.common.phoneHint')}
              </p>
            </div>
          )}

          <PasswordInput
            id="login-password"
            label={t('authPage.common.password')}
            value={password}
            onChange={setPassword}
            visible={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
            placeholder={t('login.password.placeholder')}
            autoComplete="current-password"
          />

          {error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? t('login.submit.loading') : t('auth.login')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {t('login.noAccount')}{' '}
          <Link to="/signup" className="font-medium text-emerald-700">
            {t('login.needAccount.cta')}
          </Link>
        </p>
      </div>
    </main>
  )
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  visible: boolean
  onToggle: () => void
  placeholder: string
  autoComplete: string
}) {
  const visibilityLabel = visible ? 'Hide password' : 'Show password'

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-11 outline-none focus:border-emerald-600"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          aria-label={visibilityLabel}
          title={visibilityLabel}
        >
          <PasswordVisibilityIcon visible={visible} />
        </button>
      </div>
    </div>
  )
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3l18 18" />
        <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c5 0 9 4.5 10.5 7a13 13 0 0 1-2.5 3.3" />
        <path d="M6.6 6.7A13.7 13.7 0 0 0 1.5 12c1.5 2.5 5.5 7 10.5 7a10.6 10.6 0 0 0 4.1-.8" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function normalizePakistanPhone(value: string) {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('0092')) {
    return `+${digits.slice(2)}`
  }

  if (digits.startsWith('92')) {
    return `+${digits}`
  }

  if (digits.startsWith('0')) {
    return `+92${digits.slice(1)}`
  }

  if (digits.startsWith('3')) {
    return `+92${digits}`
  }

  return value.trim()
}

function isValidPakistanMobile(value: string) {
  return /^\+923\d{9}$/.test(value)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function toFriendlyAuthError(message: string, t: (key: TranslationKey) => string) {
  const lower = message.toLowerCase()

  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return t('login.auth.invalidCredentials')
  }

  if (lower.includes('confirm') && lower.includes('email')) {
    return t('login.auth.emailNotConfirmed')
  }

  if (lower.includes('phone') || lower.includes('sms')) {
    return t('login.auth.phoneFailed')
  }

  return message
}
