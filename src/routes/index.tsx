import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const HOME_SLIDES = [
  {
    src: '/home-slides/bbjf-slide-01.jpg',
    alt: 'BBJF leadership portrait for digital membership platform',
    title: 'Digital Membership',
    text: 'A verified member record, secure profile, and QR-enabled digital card.',
  },
  {
    src: '/home-slides/bbjf-slide-02.jpg',
    alt: 'BBJF public gathering and outreach moment',
    title: 'Public Outreach',
    text: 'Connecting members through a simple, transparent, and accessible platform.',
  },
  {
    src: '/home-slides/bbjf-slide-03.jpg',
    alt: 'BBJF leadership speaking at a formal event',
    title: 'Admin Review',
    text: 'Applications are reviewed by admins before digital card activation.',
  },
  {
    src: '/home-slides/bbjf-slide-04.jpg',
    alt: 'BBJF public address and member engagement',
    title: 'QR Verification',
    text: 'Approved members receive a public verification link and QR code.',
  },
] as const

function HomePage() {
  return (
    <main className="bbjf-aurora-page px-4 py-10 md:py-14">
      <section className="page-wrap">
        <div className="bbjf-hero-card rise-in relative overflow-hidden rounded-[2.3rem] p-5 md:p-7 lg:p-9">
          <div className="bbjf-hero-ribbon" />
          <div className="bbjf-orb bbjf-orb--red" />
          <div className="bbjf-orb bbjf-orb--green" />

          <div className="relative z-10 grid items-center gap-9 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-2 md:p-5">
              <div className="bbjf-brand-stamp">
                <span className="bbjf-brand-dot" />
                Bilawal Bhutto Jayala Federation
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.055em] text-[var(--sea-ink)] md:text-7xl lg:text-8xl">
                Digital{' '}
                <span className="bbjf-gradient-text">Membership</span>{' '}
                Platform
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)] md:text-xl">
                Create your BBJF profile, submit the membership form, get admin
                approval, and receive a QR-verified digital member card.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/signup" className="bbjf-action-btn">
                  Become a Member
                  <span aria-hidden="true">→</span>
                </Link>

                <Link to="/login" className="bbjf-outline-btn">
                  Login
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Step 01" value="Sign Up" />
                <MiniStat label="Step 02" value="Admin Review" />
                <MiniStat label="Step 03" value="Digital Card" />
              </div>
            </div>

            <div className="relative">
              <div className="bbjf-visual-halo" />
              <HomePhotoSlider />
              <div className="bbjf-floating-chip bbjf-floating-chip--top">
                QR Verified
              </div>
              <div className="bbjf-floating-chip bbjf-floating-chip--bottom">
                Secure Member ID
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <FeatureCard
            step="01"
            title="Submit Membership Form"
            text="Members create an account and submit CNIC, district, mobile number, profession, caste branch, and photo."
          />

          <FeatureCard
            step="02"
            title="Admin Review"
            text="Admins review pending applications, approve valid members, or reject with a reason."
          />

          <FeatureCard
            step="03"
            title="QR Verification"
            text="Approved members get a digital card with QR code linking to a public verification page."
          />
        </div>
      </section>
    </main>
  )
}

function HomePhotoSlider() {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HOME_SLIDES.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [])

  const slide = HOME_SLIDES[activeSlide]

  return (
    <div className="bbjf-photo-slider relative overflow-hidden rounded-[2rem] border border-white/50 bg-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
      <div className="relative aspect-[4/3] min-h-[320px] sm:min-h-[420px] lg:min-h-[540px]">
        {HOME_SLIDES.map((item, index) => (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt}
            className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out ${
              index === activeSlide
                ? 'scale-100 opacity-100'
                : 'scale-105 opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-600 via-white to-emerald-600" />
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-900 shadow-sm">
            BBJF
          </span>
          <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {activeSlide + 1}/{HOME_SLIDES.length}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-100">
            Home Highlights
          </p>
          <h2 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
            {slide.title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 md:text-base">
            {slide.text}
          </p>

          <div className="mt-5 flex items-center gap-2">
            {HOME_SLIDES.map((item, index) => (
              <button
                key={item.src}
                type="button"
                aria-label={`Show home slide ${index + 1}`}
                aria-pressed={index === activeSlide}
                onClick={() => setActiveSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  index === activeSlide
                    ? 'w-12 bg-white'
                    : 'w-3 bg-white/45 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bbjf-mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function FeatureCard({
  step,
  title,
  text,
}: {
  step: string
  title: string
  text: string
}) {
  return (
    <div className="bbjf-feature-card feature-card rounded-3xl p-6">
      <span className="bbjf-feature-step">{step}</span>
      <h2 className="mt-4 text-xl font-black text-[var(--sea-ink)]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--sea-ink-soft)]">
        {text}
      </p>
    </div>
  )
}
