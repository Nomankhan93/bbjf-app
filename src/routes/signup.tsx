import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase/client'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage(t('signup.message.created'))
    setTimeout(() => {
      navigate({ to: '/login' })
    }, 1200)
  }

  return (
    <main className="bbjf-auth-page px-4 py-12" dir={direction}>
      <div className="bbjf-auth-card mx-auto max-w-md p-7 md:p-8">
        <div className="mb-7 text-center">
          <span className="bbjf-auth-badge">BBJF Member</span>
          <h1 className="mt-5 text-3xl font-black tracking-[-0.03em] text-slate-950">
            {t('signup.form.title')}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {t('signup.form.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {t('authPage.common.fullName')}
            </label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="bbjf-input"
              placeholder={t('signup.fullName.placeholder')}
            />
          </div>

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
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="bbjf-input"
              placeholder={t('signup.password.placeholder')}
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
            className="bbjf-auth-button w-full disabled:opacity-60"
          >
            {loading ? t('signup.submit.loading') : t('signup.submit.cta')}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {t('signup.haveAccount')}{' '}
          <Link to="/login" className="font-bold text-emerald-700">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </main>
  )
}
