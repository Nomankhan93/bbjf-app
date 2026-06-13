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
    <main className="px-4 py-14">
      <section className="page-wrap">
        <div className="island-shell rise-in overflow-hidden rounded-[2rem] p-6 md:p-8 lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-2 md:p-4">
              <p className="island-kicker">Bilawal Bhutto Jayala Federation</p>

              <h1 className="display-title mt-4 max-w-4xl text-5xl font-bold leading-tight text-[var(--sea-ink)] md:text-7xl">
                Digital Membership Platform for BBJF
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)]">
                Register your profile, submit your membership form, wait for admin
                approval, and receive a digital ID card with QR verification.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white no-underline hover:bg-emerald-800"
                >
                  Become a Member
                </Link>

                <Link
                  to="/login"
                  className="rounded-xl border border-[var(--line)] bg-white/70 px-6 py-3 text-sm font-semibold text-[var(--sea-ink)] no-underline hover:bg-white"
                >
                  Login
                </Link>
              </div>
            </div>

            <HomePhotoSlider />
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <FeatureCard
            title="Submit Membership Form"
            text="Members create an account and submit CNIC, district, mobile number, profession, caste branch, and photo."
          />

          <FeatureCard
            title="Admin Review"
            text="Admins review pending applications, approve valid members, or reject with a reason."
          />

          <FeatureCard
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
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
      <div className="relative aspect-[4/3] min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]">
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5" />
        <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-900 shadow-sm">
            BBJF
          </span>
          <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {activeSlide + 1}/{HOME_SLIDES.length}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
            Home Highlights
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
            {slide.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/85 md:text-base">
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
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide
                    ? 'w-10 bg-white'
                    : 'w-2.5 bg-white/45 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="feature-card rounded-2xl border border-[var(--line)] p-6">
      <h2 className="text-xl font-bold text-[var(--sea-ink)]">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--sea-ink-soft)]">
        {text}
      </p>
    </div>
  )
}
