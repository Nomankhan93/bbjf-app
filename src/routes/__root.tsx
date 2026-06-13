import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect, useState, type ReactNode } from 'react'
import {
  I18nProvider,
  LanguageSwitcher,
  useI18n,
} from '../lib/i18n'
import { useAuthRole } from '../hooks/useAuthRole'
import { InstallAppPrompt } from '../components/pwa/InstallAppPrompt'
import styles from '../styles.css?url'

const APP_NAME = 'Bilawal Bhutto Jayala Federation'
const APP_SHORT_NAME = 'BBJF'
const APP_FULL_TITLE = `${APP_NAME} - Membership Platform`
const BBJF_ICON_PATH = '/bbjf-icon-512.png'

type AppRoutePath =
  | '/'
  | '/signup'
  | '/login'
  | '/dashboard'
  | '/register'
  | '/admin'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: APP_FULL_TITLE },
      {
        name: 'description',
        content:
          'Bilawal Bhutto Jayala Federation digital membership platform with member registration, admin approval, digital cards, and QR verification.',
      },
      { name: 'theme-color', content: '#1F6B43' },
      { name: 'application-name', content: `${APP_NAME} - ${APP_SHORT_NAME}` },
      { name: 'apple-mobile-web-app-title', content: APP_SHORT_NAME },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'msapplication-TileColor', content: '#1F6B43' },
      { property: 'og:title', content: APP_FULL_TITLE },
      {
        property: 'og:description',
        content: 'Digital membership platform for Bilawal Bhutto Jayala Federation.',
      },
      { property: 'og:image', content: BBJF_ICON_PATH },
    ],
    links: [
      { rel: 'stylesheet', href: styles },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <RootDocument>
      <SiteHeader />
      <Outlet />
      <SiteFooter />
      <InstallAppPrompt />

      {import.meta.env.DEV ? (
        <TanStackRouterDevtools position="bottom-right" />
      ) : null}
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <I18nProvider>
          <I18nShell>{children}</I18nShell>
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  )
}

function I18nShell({ children }: { children: ReactNode }) {
  const { language, direction } = useI18n()

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = direction
    document.body.dataset.language = language
    document.body.dataset.direction = direction
  }, [direction, language])

  return <div dir={direction}>{children}</div>
}

function SiteHeader() {
  const { t } = useI18n()
  const { isLoggedIn, isAdmin } = useAuthRole()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems: Array<{ to: AppRoutePath; label: string }> = isLoggedIn
    ? [
        { to: '/', label: t('nav.home') },
        { to: '/dashboard', label: t('nav.dashboard') },
        { to: '/register', label: t('nav.register') },
        ...(isAdmin ? [{ to: '/admin' as const, label: t('nav.admin') }] : []),
      ]
    : [
        { to: '/', label: t('nav.home') },
        { to: '/signup', label: t('auth.joinNow') },
        { to: '/login', label: t('auth.login') },
      ]

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)]/95 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-md">
      <div className="page-wrap flex min-h-20 items-center justify-between gap-4">
        <Link
          to="/"
          className="brand-pill max-w-[72vw] no-underline"
          onClick={() => setMobileOpen(false)}
        >
          <img
            src={BBJF_ICON_PATH}
            alt={`${APP_SHORT_NAME} logo`}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-emerald-100"
          />
          <span className="brand-text truncate">
            {t('brand.name')} - {APP_SHORT_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher compact />
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white text-[var(--sea-ink)] shadow-sm"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`border-t border-[var(--line)] bg-white/96 backdrop-blur-md md:hidden ${
          mobileOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="page-wrap py-3">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                mobile
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to={isLoggedIn ? '/dashboard' : '/signup'}
            onClick={() => setMobileOpen(false)}
            className="mt-3 flex justify-center rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white no-underline shadow-[0_12px_30px_rgba(31,107,67,0.22)]"
          >
            {isLoggedIn ? t('nav.dashboard') : t('auth.joinNow')}
          </Link>
        </div>
      </div>
    </header>
  )
}

function NavLink({
  to,
  children,
  mobile = false,
  onClick,
}: {
  to: AppRoutePath
  children: ReactNode
  mobile?: boolean
  onClick?: () => void
}) {
  const baseClass = mobile
    ? 'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 no-underline transition hover:bg-slate-50 hover:text-emerald-800'
    : 'nav-link'

  const activeClass = mobile
    ? 'flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 no-underline ring-1 ring-emerald-100'
    : 'nav-link is-active'

  return (
    <Link
      to={to}
      onClick={onClick}
      className={baseClass}
      activeProps={{ className: activeClass }}
    >
      {children}
    </Link>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      >
        <path d="M6 6l12 12M18 6L6 18" />
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
      strokeWidth="2.4"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="site-footer mt-16 border-t border-[var(--line)] py-8">
      <div className="page-wrap flex flex-col gap-2 text-sm text-[var(--sea-ink-soft)] md:flex-row md:items-center md:justify-between">
        <span>
          © {new Date().getFullYear()} {t('brand.name')}. All rights reserved.
        </span>
        <span className="font-semibold text-emerald-800">
          Secure digital membership • QR verification
        </span>
      </div>
    </footer>
  )
}

function NotFoundPage() {
  return (
    <main className="px-4 py-12">
      <div className="page-wrap rounded-[1.75rem] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--lagoon)]">
          {APP_SHORT_NAME}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-slate-600">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 font-semibold text-white no-underline"
        >
          Home
        </Link>
      </div>
    </main>
  )
}