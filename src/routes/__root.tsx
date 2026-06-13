import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect, type ReactNode } from 'react'
import {
  I18nProvider,
  LanguageSwitcher,
  useI18n,
} from '../lib/i18n'
import { useAuthRole } from '../hooks/useAuthRole'
import styles from '../styles.css?url'

const APP_NAME = 'Bilawal Bhutto Jayala Federation'
const APP_SHORT_NAME = 'BBJF'
const APP_FULL_TITLE = `${APP_NAME} - Membership Platform`
const BBJF_ICON_PATH = '/bbjf-icon-512.png'

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
      { name: 'theme-color', content: '#000000' },
      { name: 'application-name', content: `${APP_NAME} - ${APP_SHORT_NAME}` },
      { name: 'apple-mobile-web-app-title', content: APP_SHORT_NAME },
      { name: 'msapplication-TileColor', content: '#000000' },
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
        href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap',
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

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] backdrop-blur-md">
      <div className="page-wrap flex min-h-20 items-center justify-between gap-4">
        <Link to="/" className="brand-pill">
          <img
            src={BBJF_ICON_PATH}
            alt={`${APP_SHORT_NAME} logo`}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="brand-text">
            {t('brand.name')} - {APP_SHORT_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/">{t('nav.home')}</NavLink>
          {isLoggedIn ? (
            <>
              <NavLink to="/dashboard">{t('nav.dashboard')}</NavLink>
              <NavLink to="/register">{t('nav.register')}</NavLink>
              {isAdmin ? <NavLink to="/admin">{t('nav.admin')}</NavLink> : null}
            </>
          ) : (
            <>
              <NavLink to="/signup">{t('auth.joinNow')}</NavLink>
              <NavLink to="/login">{t('auth.login')}</NavLink>
            </>
          )}
        </nav>

        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher compact />
          <Link
            to={isLoggedIn ? '/dashboard' : '/login'}
            className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white no-underline"
          >
            {isLoggedIn ? t('nav.dashboard') : t('auth.login')}
          </Link>
        </div>
      </div>
    </header>
  )
}

function NavLink({
  to,
  children,
}: {
  to: '/' | '/signup' | '/login' | '/dashboard' | '/register' | '/admin'
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      className="nav-link"
      activeProps={{ className: 'nav-link is-active' }}
    >
      {children}
    </Link>
  )
}

function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="site-footer mt-16 py-8">
      <div className="page-wrap text-sm text-[var(--sea-ink-soft)]">
        © {new Date().getFullYear()} {t('brand.name')}. All rights reserved.
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
