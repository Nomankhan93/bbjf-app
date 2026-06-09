import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { approveMemberAction, rejectMemberAction } from '../../../lib/admin/actions'
import { useI18n, type TranslationKey } from '../../../lib/i18n'
import { supabase } from '../../../lib/supabase/client'

export const Route = createFileRoute('/admin/members/$id')({
  component: AdminMemberDetailPage,
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
  reviewed_at: string | null
  approved_at: string | null
  created_at: string
}

const statusLabelKeys: Record<Member['status'], TranslationKey> = {
  pending: 'common.status.pending',
  approved: 'common.status.approved',
  rejected: 'common.status.rejected',
}

function AdminMemberDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t, direction, language } = useI18n()

  const [member, setMember] = useState<Member | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadMember()
  }, [id])

  async function loadMember() {
    setLoading(true)
    setError('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate({ to: '/login' })
      return
    }

    const { data: role } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!role) {
      navigate({ to: '/dashboard' })
      return
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMember(data)

    if (data.photo_url) {
      const { data: signed } = await supabase.storage
        .from('member-photos')
        .createSignedUrl(data.photo_url, 60 * 60)

      setPhotoUrl(signed?.signedUrl ?? null)
    }

    setLoading(false)
  }

  async function getAccessToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? ''
  }

  async function handleApprove() {
    if (!member) return

    setActionLoading(true)
    setError('')

    try {
      const accessToken = await getAccessToken()

      await approveMemberAction({
        data: {
          memberId: member.id,
          accessToken,
        },
      })

      await loadMember()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.detail.approveError'))
    }

    setActionLoading(false)
  }

  async function handleReject() {
    if (!member) return

    setActionLoading(true)
    setError('')

    try {
      const accessToken = await getAccessToken()

      await rejectMemberAction({
        data: {
          memberId: member.id,
          rejectionReason,
          accessToken,
        },
      })

      setRejectionReason('')
      await loadMember()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.detail.rejectError'))
    }

    setActionLoading(false)
  }

  if (loading) {
    return (
      <main className="px-4 py-10" dir={direction}>
        <div className="page-wrap rounded-2xl bg-white p-6 shadow-sm">
          {t('admin.detail.loading')}
        </div>
      </main>
    )
  }

  if (!member) {
    return (
      <main className="px-4 py-10" dir={direction}>
        <div className="page-wrap rounded-2xl bg-white p-6 shadow-sm">
          {t('common.memberNotFound')}
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-10" dir={direction}>
      <div className="page-wrap space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <Link
            to="/admin"
            className="text-sm font-medium text-emerald-700 no-underline"
          >
            {t('common.backToAdmin')}
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {member.full_name}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {t('dashboard.cnic')}: {member.cnic} · {member.district}
                {member.taluka ? ` · ${member.taluka}` : ''}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 md:items-end">
              <StatusBadge status={member.status} />

              {member.status === 'approved' && member.member_no ? (
                <Link
                  to="/admin/members/$id/card"
                  params={{ id: member.id }}
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white no-underline hover:bg-black"
                >
                  {t('admin.detail.openCard')}
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={member.full_name}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                {t('common.noPhoto')}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('admin.detail.memberDetails')}
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
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
              <InfoItem label={t('dashboard.memberNo')} value={member.member_no} />
              <InfoItem
                label={t('admin.detail.submitted')}
                value={formatDateTime(member.created_at, language)}
              />
              <InfoItem
                label={t('admin.detail.approvedAt')}
                value={formatDateTime(member.approved_at, language)}
              />
            </div>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <InfoItem label={t('dashboard.address')} value={member.address} />
            </div>

            {member.rejection_reason ? (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                <p className="font-medium">{t('admin.detail.rejectionReason')}</p>
                <p className="mt-1">{member.rejection_reason}</p>
              </div>
            ) : null}
          </div>
        </section>

        {member.status === 'pending' ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('admin.detail.reviewApplication')}
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {actionLoading ? t('admin.detail.processing') : t('admin.detail.approveMember')}
              </button>
            </div>

            <div className="mt-6 max-w-xl">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  {t('admin.detail.rejectionReason')}
                </span>
                <textarea
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  className="input min-h-28"
                  placeholder={t('admin.detail.rejectPlaceholder')}
                />
              </label>

              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading || rejectionReason.trim().length < 3}
                className="mt-3 rounded-lg bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
              >
                {t('admin.detail.rejectMember')}
              </button>
            </div>
          </section>
        ) : null}
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
      {t(statusLabelKeys[status])}
    </span>
  )
}

function getLocale(language: string) {
  return language === 'ur' ? 'ur-PK' : language === 'sd' ? 'sd-PK' : 'en-PK'
}

function formatDate(value: string | null | undefined, language: string) {
  if (!value) return null
  return new Date(value).toLocaleDateString(getLocale(language))
}

function formatDateTime(value: string | null | undefined, language: string) {
  if (!value) return null
  return new Date(value).toLocaleString(getLocale(language))
}
