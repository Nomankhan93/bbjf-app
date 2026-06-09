import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase/client'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

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
  declaration_accepted: boolean
  photo_url: string
  status: 'pending' | 'approved' | 'rejected'
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

  useEffect(() => {
    loadDashboard()
  }, [])

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

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMember(data)

    if (data?.photo_url) {
      const { data: signed } = await supabase.storage
        .from('member-photos')
        .createSignedUrl(data.photo_url, 60 * 60)

      setPhotoSignedUrl(signed?.signedUrl ?? null)
    }

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate({ to: '/login' })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10" dir={direction}>
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">{t('dashboard.loading')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10" dir={direction}>
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              {t('brand.name')}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {t('dashboard.title')}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {t('dashboard.description')}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('auth.logout')}
          </button>
        </header>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!member ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              {t('dashboard.completeRegistrationTitle')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('dashboard.completeRegistrationDescription')}
            </p>

            <Link
              to="/register"
              className="mt-5 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              {t('dashboard.fillMembershipForm')}
            </Link>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t('dashboard.memberProfile')}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {t('dashboard.submittedInfo')}
                  </p>
                </div>

                <StatusBadge status={member.status} />
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
                  <InfoItem label={t('dashboard.cnic')} value={member.cnic} />
                  <InfoItem label={t('dashboard.mobile')} value={member.mobile} />
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
                    label={t('dashboard.declaration')}
                    value={member.declaration_accepted ? t('common.accepted') : t('common.notAccepted')}
                  />
                  <InfoItem
                    label={t('dashboard.memberNo')}
                    value={member.member_no ?? t('dashboard.notIssuedYet')}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <InfoItem label={t('dashboard.address')} value={member.address} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {member.status === 'pending' ? (
                  <Link
                    to="/register"
                    className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    {t('dashboard.editPendingForm')}
                  </Link>
                ) : null}

                {member.status === 'approved' ? (
                  <Link
                    to="/card"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    {t('dashboard.viewDigitalCard')}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                {t('dashboard.currentStatus')}
              </h2>

              <div className="mt-4">
                <StatusBadge status={member.status} />
              </div>

              {member.status === 'pending' ? (
                <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  {t('dashboard.pendingNotice')}
                </p>
              ) : null}

              {member.status === 'approved' ? (
                <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                  <p className="font-medium">{t('dashboard.verifiedMember')}</p>
                  <p className="mt-1">
                    {t('dashboard.approvedOn')}{' '}
                    {member.approved_at
                      ? formatDate(member.approved_at, language)
                      : t('common.na')}
                  </p>
                </div>
              ) : null}

              {member.status === 'rejected' ? (
                <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-medium">{t('dashboard.applicationRejected')}</p>
                  <p className="mt-1">
                    {member.rejection_reason || t('dashboard.noReasonProvided')}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </main>
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
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">
        {value || t('common.notProvided')}
      </p>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: 'pending' | 'approved' | 'rejected'
}) {
  const { t } = useI18n()
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rejected: 'bg-red-50 text-red-700 ring-red-200',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
    >
      {t(`common.status.${status}`)}
    </span>
  )
}

function formatDate(value: string | null | undefined, language: string) {
  if (!value) return null

  const locale = language === 'ur' ? 'ur-PK' : language === 'sd' ? 'sd-PK' : 'en-PK'
  return new Date(value).toLocaleDateString(locale)
}
