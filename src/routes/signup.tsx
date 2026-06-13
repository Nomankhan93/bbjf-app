import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useI18n, type TranslationKey } from '../lib/i18n'
import { supabase } from '../lib/supabase/client'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

type SignupMethod = 'email' | 'phone'

function SignupPage() {
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const [method, setMethod] = useState<SignupMethod>('email')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function resetAlerts() {
    setError('')
    setMessage('')
  }

  function switchMethod(nextMethod: SignupMethod) {
    setMethod(nextMethod)
    resetAlerts()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetAlerts()

    const name = fullName.trim()
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPhone = normalizePakistanPhone(phone)

    if (!name) {
      setError(t('signup.error.fullNameRequired'))
      return
    }

    if (name.length < 3) {
      setError(t('signup.error.fullNameShort'))
      return
    }

    if (method === 'email' && !isValidEmail(normalizedEmail)) {
      setError(t('signup.error.invalidEmail'))
      return
    }

    if (method === 'phone' && !isValidPakistanMobile(normalizedPhone)) {
      setError(t('signup.error.invalidPhone'))
      return
    }

    if (password.length < 6) {
      setError(t('signup.error.passwordShort'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('signup.error.passwordMismatch'))
      return
    }

    setLoading(true)

    const { data, error: signupError } =
      method === 'email'
        ? await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: name,
                login_method: 'email_password',
              },
            },
          })
        : await supabase.auth.signUp({
            phone: normalizedPhone,
            password,
            options: {
              data: {
                full_name: name,
                login_method: 'phone_password',
              },
            },
          })

    setLoading(false)

    if (signupError) {
      setError(toFriendlyAuthError(signupError.message, t))
      return
    }

    if (method === 'phone') {
      setPhone(normalizedPhone)
    }

    if (data.session) {
      await navigate({ to: '/dashboard', replace: true })
      return
    }

    setMessage(t('signup.message.created'))
    window.setTimeout(() => {
      void navigate({ to: '/login', replace: true })
    }, 1200)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10" dir={direction}>
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {t('signup.form.title')}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t('signup.form.description')}
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
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('authPage.common.fullName')}
            </label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
              placeholder={t('signup.fullName.placeholder')}
            />
          </div>

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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('authPage.common.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
              placeholder={t('signup.password.placeholder')}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('authPage.common.confirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
              placeholder={t('signup.confirmPassword.placeholder')}
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          ) : null}

          {message ? (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
          >
            {loading ? t('signup.submit.loading') : t('signup.submit.cta')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {t('signup.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-emerald-700">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </main>
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

  if (lower.includes('already') || lower.includes('registered') || lower.includes('exists')) {
    return t('signup.auth.alreadyRegistered')
  }

  if (lower.includes('password')) {
    return t('signup.auth.passwordInvalid')
  }

  if (lower.includes('phone') || lower.includes('sms')) {
    return t('signup.auth.phoneFailed')
  }

  if (lower.includes('email')) {
    return t('signup.auth.emailFailed')
  }

  return message
}
