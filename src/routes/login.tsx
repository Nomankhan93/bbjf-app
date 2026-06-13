import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { PasswordInput } from '../components/auth/PasswordInput'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase/client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate({ to: '/dashboard' })
  }

  return (
    <main className="bbjf-auth-page px-4 py-12" dir={direction}>
      <div className="bbjf-auth-card mx-auto max-w-md p-7 md:p-8">
        <div className="mb-7 text-center">
          <span className="bbjf-auth-badge">BBJF Access</span>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.03em] text-slate-950">
            {t('login.form.title')}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t('login.hero.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('authPage.common.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="bbjf-input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('authPage.common.password')}
            </label>
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder={t('login.password.placeholder')}
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="bbjf-auth-button w-full disabled:opacity-60"
          >
            {loading ? t('login.submit.loading') : t('auth.login')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {t('login.noAccount')}{' '}
          <Link to="/signup" className="font-bold text-emerald-700">
            {t('login.needAccount.cta')}
          </Link>
        </p>
      </div>
    </main>
  )
}
