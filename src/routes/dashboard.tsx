import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase/client'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

type MemberStatus = 'pending' | 'approved' | 'rejected'

type Member = {
  id: string
  user_id: string
  member_no: string | null
  full_name: string
  father_name: string
  cnic: string
  mobile: string
  district: string
  taluka: string | null
  address: string | null
  date_of_birth: string | null
  gender: string | null
  education: string | null
  blood_group: string | null
  profession: string | null
  designation: string | null
  designation_level: string | null
  designation_area: string | null
  caste_branch: string | null
  emergency_contact_name: string | null
  emergency_contact_relation: string | null
  emergency_contact_mobile: string | null
  declaration_accepted: boolean
  photo_url: string
  status: MemberStatus
  rejection_reason: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
}

function DashboardPage() {
  const navigate = useNavigate()
  const { t, direction, language } = useI18n()
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [photoSignedUrl, setPhotoSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showSensitive, setShowSensitive] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const verifyUrl = useMemo(() => {
    if (!member?.member_no || typeof window === 'undefined') return ''
    return `${window.location.origin}/verify/${encodeURIComponent(member.member_no)}`
  }, [member?.member_no])

  async function loadDashboard() {
    setLoading(true)
    setError('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      navigate({ to: '/login' })
      return
    }

    const { data, error: memberError } = await (supabase as any)
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    const nextMember = data as Member | null
    setMember(nextMember)

    if (nextMember?.photo_url) {
      const { data: signed } = await supabase.storage
        .from('member-photos')
        .createSignedUrl(nextMember.photo_url, 60 * 60)

      setPhotoSignedUrl(signed?.signedUrl ?? null)
    } else {
      setPhotoSignedUrl(null)
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate({ to: '/login' })
  }

  async function copyVerifyLink() {
    if (!verifyUrl) return

    try {
      await navigator.clipboard.writeText(verifyUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError(t('dashboard.copyFailed'))
    }
  }

  if (loading) {
    return (
      <main className="bbjf-dashboard-page px-4 py-10" dir={direction}>
        <div className="mx-auto max-w-6xl rounded-3xl bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.10)] ring-1 ring-white/70">
          <p className="text-slate-600">{t('dashboard.loading')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="bbjf-dashboard-page px-4 py-10" dir={direction}>
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="bbjf-dashboard-hero flex flex-col justify-between gap-4 rounded-[2rem] p-7 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              {t('brand.name')}
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">
              {t('dashboard.title')}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {t('dashboard.description')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadDashboard}
              className="rounded-xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-white"
            >
              {t('dashboard.refresh')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-white"
            >
              {t('auth.logout')}
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {!member ? (
          <section className="bbjf-empty-card rounded-[2rem] p-7">
            <h2 className="text-xl font-bold text-slate-900">
              {t('dashboard.completeRegistrationTitle')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('dashboard.completeRegistrationDescription')}
            </p>

            <Link
              to="/register"
              className="bbjf-action-btn mt-5"
            >
              {t('dashboard.fillMembershipForm')}
            </Link>
          </section>
        ) : (
          <>
            <StatusHero
              member={member}
              language={language}
              verifyUrl={verifyUrl}
              copied={copied}
              onCopyVerifyLink={copyVerifyLink}
            />

            <section className="grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
              <div className="rounded-[2rem] border border-white/70 bg-white/92 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {t('dashboard.memberProfile')}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {t('dashboard.submittedInfo')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSensitive((value) => !value)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
                  >
                    {showSensitive ? t('dashboard.hideSensitive') : t('dashboard.showSensitive')}
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-6 md:flex-row">
                  <div className="shrink-0">
                    {photoSignedUrl ? (
                      <img
                        src={photoSignedUrl}
                        alt={member.full_name}
                        className="h-32 w-32 rounded-2xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                        {t('dashboard.noPhoto')}
                      </div>
                    )}
                  </div>

                  <div className="grid flex-1 gap-4 sm:grid-cols-2">
                    <InfoItem label={t('dashboard.fullName')} value={member.full_name} />
                    <InfoItem label={t('dashboard.fatherName')} value={member.father_name} />
                    <InfoItem label={t('dashboard.cnic')} value={showSensitive ? member.cnic : maskCnic(member.cnic)} />
                    <InfoItem label={t('dashboard.mobile')} value={showSensitive ? member.mobile : maskMobile(member.mobile)} />
                    <InfoItem label={t('dashboard.district')} value={member.district} />
                    <InfoItem label={t('dashboard.taluka')} value={member.taluka} />
                    <InfoItem label={t('dashboard.dateOfBirth')} value={formatDate(member.date_of_birth, language)} />
                    <InfoItem label={t('dashboard.gender')} value={member.gender} />
                    <InfoItem label={t('dashboard.education')} value={member.education} />
                    <InfoItem label={t('dashboard.bloodGroup')} value={member.blood_group} />
                    <InfoItem label={t('dashboard.profession')} value={member.profession} />
                    <InfoItem label={t('dashboard.designation')} value={member.designation} />
                    <InfoItem label={t('dashboard.designationLevel')} value={member.designation_level} />
                    <InfoItem label={t('dashboard.designationArea')} value={member.designation_area} />
                    <InfoItem label={t('dashboard.casteBranch')} value={member.caste_branch} />
                    <InfoItem
                      label={t('dashboard.memberNo')}
                      value={member.member_no ?? t('dashboard.notIssuedYet')}
                    />
                    <InfoItem label={t('dashboard.emergencyContact')} value={member.emergency_contact_name} />
                    <InfoItem label={t('dashboard.emergencyRelation')} value={member.emergency_contact_relation} />
                    <InfoItem
                      label={t('dashboard.emergencyMobile')}
                      value={
                        member.emergency_contact_mobile
                          ? showSensitive
                            ? member.emergency_contact_mobile
                            : maskMobile(member.emergency_contact_mobile)
                          : null
                      }
                    />
                    <InfoItem
                      label={t('dashboard.declaration')}
                      value={member.declaration_accepted ? t('common.accepted') : t('common.notAccepted')}
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <InfoItem label={t('dashboard.address')} value={member.address} />
                </div>
              </div>

              <aside className="space-y-6">
                <section className="bbjf-empty-card rounded-[2rem] p-7">
                  <h2 className="text-lg font-bold text-slate-900">
                    {t('dashboard.currentStatus')}
                  </h2>

                  <div className="mt-4">
                    <StatusBadge status={member.status} />
                  </div>

                  <StatusNotice member={member} language={language} />
                </section>

                <section className="bbjf-empty-card rounded-[2rem] p-7">
                  <h2 className="text-lg font-bold text-slate-900">
                    {t('dashboard.nextSteps')}
                  </h2>

                  <StatusTimeline status={member.status} />

                  <div className="mt-6 flex flex-col gap-3">
                    {member.status !== 'approved' ? (
                      <Link
                        to="/register"
                        className="rounded-xl border border-emerald-700 px-4 py-2 text-center text-sm font-bold text-emerald-700 no-underline hover:bg-emerald-50"
                      >
                        {member.status === 'rejected'
                          ? t('dashboard.updateAndResubmit')
                          : t('dashboard.editPendingForm')}
                      </Link>
                    ) : null}

                    {member.status === 'approved' ? (
                      <>
                        <Link
                          to="/card"
                          className="rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-bold text-white no-underline hover:bg-slate-800"
                        >
                          {t('dashboard.viewDigitalCard')}
                        </Link>

                        <button
                          type="button"
                          onClick={copyVerifyLink}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {copied ? t('dashboard.linkCopied') : t('dashboard.copyVerifyLink')}
                        </button>
                      </>
                    ) : null}
                  </div>
                </section>
              </aside>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function StatusHero({
  member,
  language,
  verifyUrl,
  copied,
  onCopyVerifyLink,
}: {
  member: Member
  language: string
  verifyUrl: string
  copied: boolean
  onCopyVerifyLink: () => void
}) {
  const { t } = useI18n()
  const hero = getStatusHero(member.status)

  return (
    <section className={`rounded-3xl border p-6 shadow-sm ${hero.wrapper}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black ${hero.icon}`}>
            {hero.symbol}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={member.status} />
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                {member.member_no ?? t('dashboard.notIssuedYet')}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-950">
              {t(hero.titleKey)}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              {t(hero.descriptionKey)}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              {t('dashboard.submittedOn')}: {formatDate(member.created_at, language) ?? t('common.na')} · {t('dashboard.updated')}: {formatDate(member.updated_at, language) ?? t('common.na')}
            </p>
          </div>
        </div>

        {member.status === 'approved' && verifyUrl ? (
          <div className="flex w-full flex-col gap-2 rounded-2xl bg-white/70 p-4 ring-1 ring-slate-200 lg:max-w-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              {t('dashboard.publicVerification')}
            </p>
            <p className="break-all text-xs font-semibold text-slate-700">
              {verifyUrl}
            </p>
            <button
              type="button"
              onClick={onCopyVerifyLink}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white hover:bg-emerald-800"
            >
              {copied ? t('dashboard.linkCopied') : t('dashboard.copyVerifyLink')}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function StatusNotice({ member, language }: { member: Member; language: string }) {
  const { t } = useI18n()

  if (member.status === 'pending') {
    return (
      <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        {t('dashboard.pendingNotice')}
      </p>
    )
  }

  if (member.status === 'approved') {
    return (
      <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
        <p className="font-bold">{t('dashboard.verifiedMember')}</p>
        <p className="mt-1">
          {t('dashboard.approvedOn')}{' '}
          {member.approved_at ? formatDate(member.approved_at, language) : t('common.na')}
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800">
      <p className="font-bold">{t('dashboard.applicationRejected')}</p>
      <p className="mt-1">
        {member.rejection_reason || t('dashboard.noReasonProvided')}
      </p>
    </div>
  )
}

function StatusTimeline({ status }: { status: MemberStatus }) {
  const { t } = useI18n()
  const steps: Array<{ key: 'submitted' | 'review' | 'approved'; label: string; done: boolean; active: boolean }> = [
    {
      key: 'submitted',
      label: t('dashboard.timeline.submitted'),
      done: true,
      active: false,
    },
    {
      key: 'review',
      label: status === 'rejected' ? t('dashboard.timeline.needsUpdate') : t('dashboard.timeline.review'),
      done: status !== 'pending',
      active: status === 'pending' || status === 'rejected',
    },
    {
      key: 'approved',
      label: t('dashboard.timeline.cardIssued'),
      done: status === 'approved',
      active: status === 'approved',
    },
  ]

  return (
    <div className="mt-5 space-y-3">
      {steps.map((step, index) => (
        <div key={step.key} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ring-1 ${
                step.done
                  ? 'bg-emerald-700 text-white ring-emerald-700'
                  : step.active
                    ? 'bg-amber-100 text-amber-800 ring-amber-200'
                    : 'bg-slate-100 text-slate-500 ring-slate-200'
              }`}
            >
              {step.done ? '✓' : index + 1}
            </span>
            {index < steps.length - 1 ? <span className="h-7 w-px bg-slate-200" /> : null}
          </div>
          <p className="pt-1 text-sm font-bold text-slate-700">{step.label}</p>
        </div>
      ))}
    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  const { t } = useI18n()

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {value || t('common.notProvided')}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: MemberStatus }) {
  const { t } = useI18n()
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-red-50 text-red-700 ring-red-200',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[status]}`}
    >
      {t(`common.status.${status}`)}
    </span>
  )
}

function getStatusHero(status: MemberStatus) {
  const map = {
    pending: {
      titleKey: 'dashboard.hero.pending.title',
      descriptionKey: 'dashboard.hero.pending.description',
      wrapper: 'border-amber-200 bg-amber-50',
      icon: 'bg-amber-100 text-amber-800',
      symbol: '…',
    },
    approved: {
      titleKey: 'dashboard.hero.approved.title',
      descriptionKey: 'dashboard.hero.approved.description',
      wrapper: 'border-emerald-200 bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-800',
      symbol: '✓',
    },
    rejected: {
      titleKey: 'dashboard.hero.rejected.title',
      descriptionKey: 'dashboard.hero.rejected.description',
      wrapper: 'border-red-200 bg-red-50',
      icon: 'bg-red-100 text-red-800',
      symbol: '!',
    },
  } as const

  return map[status]
}

function maskCnic(value: string | null | undefined) {
  if (!value) return value
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 13) return '*****-*******-*'
  return `${digits.slice(0, 5)}-*******-${digits.slice(-1)}`
}

function maskMobile(value: string | null | undefined) {
  if (!value) return value
  const digits = value.replace(/\D/g, '')
  if (digits.length < 8) return '03*********'
  return `${digits.slice(0, 4)}*****${digits.slice(-2)}`
}

function formatDate(value: string | null | undefined, language: string) {
  if (!value) return null

  const locale = language === 'ur' ? 'ur-PK' : language === 'sd' ? 'sd-PK' : 'en-PK'
  return new Date(value).toLocaleDateString(locale)
}
