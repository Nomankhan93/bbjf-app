import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { AdminShell } from '../../../components/admin/AdminShell'
import {
  designationLevelOptions,
  getDefaultDesignationArea,
  getRecommendedDesignations,
} from '../../../lib/designation-assignment'
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

type DesignationFormState = {
  designation: string
  designationLevel: string
  designationArea: string
}

const emptyDesignationForm: DesignationFormState = {
  designation: '',
  designationLevel: '',
  designationArea: '',
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
  const [designationForm, setDesignationForm] = useState<DesignationFormState>(emptyDesignationForm)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [designationSaving, setDesignationSaving] = useState(false)
  const [error, setError] = useState('')
  const [designationMessage, setDesignationMessage] = useState('')

  useEffect(() => {
    void loadMember()
  }, [id])

  async function loadMember() {
    setLoading(true)
    setError('')
    setDesignationMessage('')

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
    setDesignationForm(memberToDesignationForm(data))

    if (data.photo_url) {
      const { data: signed } = await supabase.storage
        .from('member-photos')
        .createSignedUrl(data.photo_url, 60 * 60)

      setPhotoUrl(signed?.signedUrl ?? null)
    } else {
      setPhotoUrl(null)
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

  function updateDesignationForm(fields: Partial<DesignationFormState>) {
    setDesignationForm((current) => ({ ...current, ...fields }))
    setDesignationMessage('')
    setError('')
  }

  function handleDesignationLevelChange(level: string) {
    if (!member) return

    updateDesignationForm({
      designationLevel: level,
      designationArea:
        designationForm.designationArea || getDefaultDesignationArea(level, member),
    })
  }

  async function handleDesignationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!member || designationSaving) return

    if (member.status !== 'approved') {
      setDesignationMessage('Approve this member before assigning an official designation.')
      return
    }

    const designation = designationForm.designation.trim()
    const designationLevel = designationForm.designationLevel.trim()
    const designationArea = designationForm.designationArea.trim()

    if (!designation || !designationLevel || !designationArea) {
      setDesignationMessage('Designation, level and area are required.')
      return
    }

    setDesignationSaving(true)
    setDesignationMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('members')
      .update({
        designation,
        designation_level: designationLevel,
        designation_area: designationArea,
      })
      .eq('id', member.id)

    if (updateError) {
      setDesignationMessage(updateError.message)
      setDesignationSaving(false)
      return
    }

    await loadMember()
    setDesignationMessage('Designation assigned successfully. It will now appear on the membership card and QR verification page.')
    setDesignationSaving(false)
  }

  async function handleDesignationClear() {
    if (!member || designationSaving) return

    setDesignationSaving(true)
    setDesignationMessage('')
    setError('')

    const { error: updateError } = await supabase
      .from('members')
      .update({
        designation: null,
        designation_level: null,
        designation_area: null,
      })
      .eq('id', member.id)

    if (updateError) {
      setDesignationMessage(updateError.message)
      setDesignationSaving(false)
      return
    }

    await loadMember()
    setDesignationMessage('Designation cleared from this membership card.')
    setDesignationSaving(false)
  }

  if (loading) {
    return (
      <AdminShell title={t('admin.detail.memberDetails')} subtitle={t('admin.description')}>
        <div className="rounded-2xl bg-white p-6 shadow-sm" dir={direction}>
          {t('admin.detail.loading')}
        </div>
      </AdminShell>
    )
  }

  if (!member) {
    return (
      <AdminShell title={t('admin.detail.memberDetails')} subtitle={t('admin.description')}>
        <div className="rounded-2xl bg-white p-6 shadow-sm" dir={direction}>
          {t('common.memberNotFound')}
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title={member.full_name} subtitle={t('admin.detail.memberDetails')}>
      <div className="space-y-6" dir={direction}>
        <header className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          <Link
            to="/admin"
            className="text-sm font-black text-emerald-700 no-underline"
          >
            {t('common.backToAdmin')}
          </Link>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-950">
                {member.full_name}
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-600">
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
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white no-underline hover:bg-black"
                >
                  {t('admin.detail.openCard')}
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={member.full_name}
                className="aspect-square w-full rounded-[1.6rem] object-cover object-top"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-[1.6rem] bg-slate-100 text-slate-500">
                {t('common.noPhoto')}
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                {t('dashboard.memberNo')}
              </p>
              <p className="mt-2 break-all text-lg font-black">
                {member.member_no || t('common.notProvided')}
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
            <h2 className="text-lg font-black text-slate-950">
              {t('admin.detail.memberDetails')}
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              <InfoItem label={t('dashboard.casteBranch')} value={member.caste_branch} />
              <InfoItem
                label={t('dashboard.declaration')}
                value={member.declaration_accepted ? t('common.accepted') : t('common.notAccepted')}
              />
              <InfoItem
                label={t('admin.detail.submitted')}
                value={formatDateTime(member.created_at, language)}
              />
              <InfoItem
                label={t('admin.detail.approvedAt')}
                value={formatDateTime(member.approved_at, language)}
              />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <InfoItem label={t('dashboard.address')} value={member.address} />
            </div>

            {member.rejection_reason ? (
              <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-100">
                <p className="font-black">{t('admin.detail.rejectionReason')}</p>
                <p className="mt-1 leading-6">{member.rejection_reason}</p>
              </div>
            ) : null}
          </div>
        </section>

        <DesignationAssignmentPanel
          member={member}
          form={designationForm}
          saving={designationSaving}
          message={designationMessage}
          onChange={updateDesignationForm}
          onLevelChange={handleDesignationLevelChange}
          onSubmit={handleDesignationSubmit}
          onClear={() => void handleDesignationClear()}
        />

        {member.status === 'pending' ? (
          <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
            <h2 className="text-lg font-black text-slate-950">
              {t('admin.detail.reviewApplication')}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Approve the membership first. Official designation can be assigned after approval.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
                className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {actionLoading ? t('admin.detail.processing') : t('admin.detail.approveMember')}
              </button>
            </div>

            <div className="mt-6 max-w-xl">
              <label className="block">
                <span className="mb-1 block text-sm font-black text-slate-700">
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
                className="mt-3 rounded-xl bg-red-700 px-5 py-2 text-sm font-black text-white hover:bg-red-800 disabled:opacity-60"
              >
                {t('admin.detail.rejectMember')}
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </AdminShell>
  )
}

function DesignationAssignmentPanel({
  member,
  form,
  saving,
  message,
  onChange,
  onLevelChange,
  onSubmit,
  onClear,
}: {
  member: Member
  form: DesignationFormState
  saving: boolean
  message: string
  onChange: (fields: Partial<DesignationFormState>) => void
  onLevelChange: (level: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
}) {
  const suggestions = getRecommendedDesignations(form.designationLevel)
  const hasDesignation = Boolean(member.designation?.trim())
  const canAssign = member.status === 'approved'

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
            Member Designation
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Assign designation to membership card
          </h2>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
            Same JAS-style workflow: member does not enter office title in registration. Admin assigns the official designation after approval, then it appears on card and QR verification.
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${
            hasDesignation
              ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
              : 'bg-amber-50 text-amber-900 ring-amber-200'
          }`}
        >
          {hasDesignation ? 'Active Designation' : 'No Designation'}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(260px,0.38fr)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">
            Current card designation
          </h3>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <InfoItem label="Designation" value={member.designation} />
            <InfoItem label="Level" value={member.designation_level} />
            <InfoItem label="Area / Jurisdiction" value={member.designation_area} />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-950">
          <p className="font-black">Process</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Approve member application.</li>
            <li>Select level and designation.</li>
            <li>Save to print on card and verify page.</li>
          </ol>
        </div>
      </div>

      {message ? (
        <div className={`mt-4 rounded-2xl p-4 text-sm font-bold ring-1 ${message.toLowerCase().includes('success') || message.toLowerCase().includes('cleared') ? 'bg-emerald-50 text-emerald-800 ring-emerald-100' : 'bg-amber-50 text-amber-900 ring-amber-100'}`}>
          {message}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4" noValidate>
        <fieldset disabled={!canAssign || saving} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 disabled:opacity-60">
          <AdminFormField label="Designation Level" required>
            <select
              value={form.designationLevel}
              onChange={(event) => onLevelChange(event.target.value)}
              className="input"
            >
              <option value="">Select level</option>
              {designationLevelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </AdminFormField>

          <AdminFormField label="Designation / Office Title" required>
            <input
              value={form.designation}
              onChange={(event) => onChange({ designation: event.target.value })}
              className="input"
              placeholder={suggestions[0] ?? 'e.g. City General Secretary'}
              list="bbjf-designation-suggestions"
            />
            <datalist id="bbjf-designation-suggestions">
              {suggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </AdminFormField>

          <AdminFormField label="Area / Jurisdiction" required>
            <input
              value={form.designationArea}
              onChange={(event) => onChange({ designationArea: event.target.value })}
              className="input"
              placeholder="e.g. City Kunri, District Umerkot"
            />
          </AdminFormField>
        </fieldset>

        {!canAssign ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
            This form unlocks after approving the member.
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClear}
            disabled={saving || !hasDesignation}
            className="rounded-xl border border-red-200 bg-white px-5 py-2 text-sm font-black text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear Designation
          </button>
          <button
            type="submit"
            disabled={!canAssign || saving}
            className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Designation'}
          </button>
        </div>
      </form>
    </section>
  )
}

function AdminFormField({
  label,
  children,
  required,
}: {
  label: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {children}
    </label>
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
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-slate-900">
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
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${styles[status]}`}
    >
      {t(statusLabelKeys[status])}
    </span>
  )
}

function memberToDesignationForm(member: Member): DesignationFormState {
  return {
    designation: member.designation ?? '',
    designationLevel: member.designation_level ?? '',
    designationArea: member.designation_area ?? '',
  }
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
