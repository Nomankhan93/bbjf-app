// src/routes/admin/members/$id.tsx
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { AdminShell } from '../../../components/admin/AdminShell'
import {
  designationLevelOptions,
  designationTitleOptions,
  getDefaultDesignationArea,
} from '../../../lib/designation-assignment'
import { approveMemberAction, rejectMemberAction } from '../../../lib/admin/actions'
import { useI18n, type TranslationKey } from '../../../lib/i18n'
import {
  formatCnicInput,
  formatMobileInput,
  isPakistaniMobile,
  normalizeMobile,
  optionalText,
} from '../../../lib/shared/formatters'
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
  photo_url: string | null
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

type AdminEditFormState = {
  fullName: string
  fatherName: string
  cnic: string
  mobile: string
  district: string
  taluka: string
  address: string
  dateOfBirth: string
  gender: string
  education: string
  bloodGroup: string
  profession: string
  casteBranch: string
  declarationAccepted: boolean
}

type AdminEditField = keyof AdminEditFormState | 'photo'

type AdminEditErrors = Partial<Record<AdminEditField, string>>

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

const MEMBER_PHOTO_BUCKET = 'member-photos'
const MEMBER_PHOTO_MAX_SIZE_BYTES = 2 * 1024 * 1024
const MEMBER_PHOTO_MAX_SIZE_LABEL = '2MB'
const MEMBER_PHOTO_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const SIGNED_URL_TTL_SECONDS = 60 * 60

function AdminMemberDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t, direction, language } = useI18n()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isCardChildRoute = pathname.endsWith(`/admin/members/${id}/card`)

  const [member, setMember] = useState<Member | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [designationForm, setDesignationForm] =
    useState<DesignationFormState>(emptyDesignationForm)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [designationSaving, setDesignationSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [designationMessage, setDesignationMessage] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editForm, setEditForm] = useState<AdminEditFormState | null>(null)
  const [editErrors, setEditErrors] = useState<AdminEditErrors>({})
  const [editPhoto, setEditPhoto] = useState<File | null>(null)
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null)

  const canOpenCard = member?.status === 'approved' && Boolean(member.member_no)

  useEffect(() => {
    if (isCardChildRoute) return

    void loadMember()
  }, [id, isCardChildRoute])

  useEffect(() => {
    return () => {
      if (editPhotoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(editPhotoPreview)
      }
    }
  }, [editPhotoPreview])

  if (isCardChildRoute) {
    return <Outlet />
  }

  async function loadMember(options?: { keepEditMode?: boolean }) {
    setLoading(true)
    setError('')
    setSuccess('')
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

    const nextMember = data as Member
    setMember(nextMember)
    setDesignationForm(memberToDesignationForm(nextMember))
    setEditForm(memberToAdminEditForm(nextMember))

    if (!options?.keepEditMode) {
      setEditMode(false)
      setEditPhoto(null)
      setEditErrors({})
      if (editPhotoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(editPhotoPreview)
      }
      setEditPhotoPreview(null)
    }

    if (nextMember.photo_url) {
      const { data: signed } = await supabase.storage
        .from(MEMBER_PHOTO_BUCKET)
        .createSignedUrl(nextMember.photo_url, SIGNED_URL_TTL_SECONDS)

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
    setSuccess('')

    try {
      const accessToken = await getAccessToken()

      await approveMemberAction({
        data: {
          memberId: member.id,
          accessToken,
        },
      })

      await loadMember()
      setSuccess('Member approved successfully. Digital card preview is now available.')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.detail.approveError'))
    }

    setActionLoading(false)
  }

  async function handleReject() {
    if (!member) return

    setActionLoading(true)
    setError('')
    setSuccess('')

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
      setSuccess('Member application marked as rejected.')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.detail.rejectError'))
    }

    setActionLoading(false)
  }

  function startEditMode() {
    if (!member) return

    setEditForm(memberToAdminEditForm(member))
    setEditErrors({})
    setEditPhoto(null)
    setError('')
    setSuccess('')
    setEditMode(true)

    if (editPhotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(editPhotoPreview)
    }
    setEditPhotoPreview(null)
  }

  function cancelEditMode() {
    setEditMode(false)
    setEditForm(member ? memberToAdminEditForm(member) : null)
    setEditErrors({})
    setEditPhoto(null)

    if (editPhotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(editPhotoPreview)
    }
    setEditPhotoPreview(null)
  }

  function updateEditField<K extends keyof AdminEditFormState>(
    field: K,
    value: AdminEditFormState[K],
  ) {
    setEditForm((current) => (current ? { ...current, [field]: value } : current))
    setEditErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    setError('')
    setSuccess('')
  }

  function handleEditPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    if (editPhotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(editPhotoPreview)
    }

    setEditPhoto(null)
    setEditPhotoPreview(null)

    if (!file) return

    if (!MEMBER_PHOTO_ALLOWED_TYPES.includes(file.type)) {
      setEditErrors((current) => ({
        ...current,
        photo: 'Upload PNG, JPG or WebP image only.',
      }))
      event.target.value = ''
      return
    }

    if (file.size > MEMBER_PHOTO_MAX_SIZE_BYTES) {
      setEditErrors((current) => ({
        ...current,
        photo: `Profile photo must be ${MEMBER_PHOTO_MAX_SIZE_LABEL} or smaller.`,
      }))
      event.target.value = ''
      return
    }

    setEditPhoto(file)
    setEditPhotoPreview(URL.createObjectURL(file))
    setEditErrors((current) => {
      const next = { ...current }
      delete next.photo
      return next
    })
  }

  async function handleAdminEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!member || !editForm || editSaving) return

    const validationErrors = validateAdminEditForm(editForm)
    setEditErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the highlighted fields before saving.')
      return
    }

    setEditSaving(true)
    setError('')
    setSuccess('')

    try {
      let photoPath = member.photo_url ?? ''

      if (editPhoto) {
        const extension = editPhoto.name.split('.').pop()?.toLowerCase() || 'jpg'
        photoPath = `${member.user_id}/admin-photo-${Date.now()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from(MEMBER_PHOTO_BUCKET)
          .upload(photoPath, editPhoto, {
            cacheControl: '3600',
            contentType: editPhoto.type || 'image/jpeg',
            upsert: false,
          })

        if (uploadError) throw uploadError
      }

      const payload = {
        full_name: editForm.fullName.trim(),
        father_name: editForm.fatherName.trim(),
        cnic: editForm.cnic.trim(),
        mobile: normalizeMobile(editForm.mobile),
        district: editForm.district.trim(),
        taluka: optionalText(editForm.taluka),
        address: editForm.address.trim(),
        date_of_birth: editForm.dateOfBirth || null,
        gender: optionalText(editForm.gender),
        education: optionalText(editForm.education),
        blood_group: optionalText(editForm.bloodGroup),
        profession: optionalText(editForm.profession),
        caste_branch: optionalText(editForm.casteBranch),
        declaration_accepted: editForm.declarationAccepted,
        photo_url: photoPath,
      }

      const { data: updatedMember, error: updateError } = await supabase
        .from('members')
        .update(payload)
        .eq('id', member.id)
        .select('*')
        .single()

      if (updateError) throw updateError
      if (!updatedMember) {
        throw new Error('Application could not be updated. Please refresh and try again.')
      }

      const nextMember = updatedMember as Member
      setMember(nextMember)
      setEditForm(memberToAdminEditForm(nextMember))
      setDesignationForm(memberToDesignationForm(nextMember))
      setEditMode(false)
      setEditPhoto(null)
      setEditErrors({})

      if (editPhotoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(editPhotoPreview)
      }
      setEditPhotoPreview(null)

      if (nextMember.photo_url) {
        const { data: signed } = await supabase.storage
          .from(MEMBER_PHOTO_BUCKET)
          .createSignedUrl(nextMember.photo_url, SIGNED_URL_TTL_SECONDS)
        setPhotoUrl(signed?.signedUrl ?? null)
      } else {
        setPhotoUrl(null)
      }

      setSuccess('Member profile updated successfully. Card preview will use the latest details.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update member profile.',
      )
    } finally {
      setEditSaving(false)
    }
  }

  function updateDesignationForm(fields: Partial<DesignationFormState>) {
    setDesignationForm((current) => ({ ...current, ...fields }))
    setDesignationMessage('')
    setError('')
    setSuccess('')
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
    setSuccess('')

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
    setSuccess('')

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

              <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={editMode ? cancelEditMode : startEditMode}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800 shadow-sm hover:bg-emerald-100"
                >
                  {editMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>

                {canOpenCard ? (
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
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
            {success}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
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

            <CardPreviewPanel member={member} canOpenCard={canOpenCard} />
          </div>

          {editMode && editForm ? (
            <AdminProfileEditPanel
              form={editForm}
              errors={editErrors}
              photoPreview={editPhotoPreview || photoUrl}
              selectedPhotoName={editPhoto?.name ?? ''}
              saving={editSaving}
              onChange={updateEditField}
              onPhotoChange={handleEditPhotoChange}
              onCancel={cancelEditMode}
              onSubmit={handleAdminEditSubmit}
            />
          ) : (
            <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    {t('admin.detail.memberDetails')}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Review submitted profile data. Use Edit Profile to correct details exactly like JAS admin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startEditMode}
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-800 shadow-sm hover:bg-emerald-50"
                >
                  Edit Profile
                </button>
              </div>

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
          )}
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

function AdminProfileEditPanel({
  form,
  errors,
  photoPreview,
  selectedPhotoName,
  saving,
  onChange,
  onPhotoChange,
  onCancel,
  onSubmit,
}: {
  form: AdminEditFormState
  errors: AdminEditErrors
  photoPreview: string | null
  selectedPhotoName: string
  saving: boolean
  onChange: <K extends keyof AdminEditFormState>(
    field: K,
    value: AdminEditFormState[K],
  ) => void
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-amber-200/90 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-700">
            Admin Edit Mode
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-950">
            Edit member profile
          </h2>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
            Correct member data, replace photo and save. The same updated data is used by dashboard, admin detail, card preview and QR verification.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6" noValidate>
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile preview"
                className="aspect-square w-full rounded-2xl object-cover object-top"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-500 ring-1 ring-slate-200">
                No photo
              </div>
            )}

            <label className="mt-4 block cursor-pointer rounded-xl border border-emerald-200 bg-white px-4 py-3 text-center text-sm font-black text-emerald-800 shadow-sm hover:bg-emerald-50">
              Replace profile photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={onPhotoChange}
                disabled={saving}
              />
            </label>

            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              PNG, JPG or WebP. Maximum {MEMBER_PHOTO_MAX_SIZE_LABEL}.
            </p>
            {selectedPhotoName ? (
              <p className="mt-2 break-words text-xs font-black text-emerald-700">
                Selected: {selectedPhotoName}
              </p>
            ) : null}
            {errors.photo ? <p className="mt-2 text-xs font-bold text-red-700">{errors.photo}</p> : null}
          </div>

          <div className="space-y-5">
            <AdminEditGroup title="Identity">
              <AdminFormField label="Full name" required error={errors.fullName}>
                <input
                  value={form.fullName}
                  onChange={(event) => onChange('fullName', event.target.value)}
                  className="input"
                />
              </AdminFormField>
              <AdminFormField label="Father name" required error={errors.fatherName}>
                <input
                  value={form.fatherName}
                  onChange={(event) => onChange('fatherName', event.target.value)}
                  className="input"
                />
              </AdminFormField>
              <AdminFormField label="CNIC" required error={errors.cnic}>
                <input
                  value={form.cnic}
                  onChange={(event) => onChange('cnic', formatCnicInput(event.target.value))}
                  className="input"
                  inputMode="numeric"
                  placeholder="42101-1234567-1"
                />
              </AdminFormField>
              <AdminFormField label="Mobile" required error={errors.mobile}>
                <input
                  value={form.mobile}
                  onChange={(event) => onChange('mobile', formatMobileInput(event.target.value))}
                  className="input"
                  inputMode="tel"
                  placeholder="03001234567"
                />
              </AdminFormField>
            </AdminEditGroup>

            <AdminEditGroup title="Location">
              <AdminFormField label="District" required error={errors.district}>
                <input
                  value={form.district}
                  onChange={(event) => onChange('district', event.target.value)}
                  className="input"
                />
              </AdminFormField>
              <AdminFormField label="Taluka" required error={errors.taluka}>
                <input
                  value={form.taluka}
                  onChange={(event) => onChange('taluka', event.target.value)}
                  className="input"
                />
              </AdminFormField>
              <AdminFormField label="Address" required error={errors.address} wide>
                <textarea
                  value={form.address}
                  onChange={(event) => onChange('address', event.target.value)}
                  className="input min-h-24"
                />
              </AdminFormField>
            </AdminEditGroup>

            <AdminEditGroup title="Personal details">
              <AdminFormField label="Date of birth">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) => onChange('dateOfBirth', event.target.value)}
                  className="input"
                />
              </AdminFormField>
              <AdminFormField label="Gender">
                <select
                  value={form.gender}
                  onChange={(event) => onChange('gender', event.target.value)}
                  className="input"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </AdminFormField>
              <AdminFormField label="Education">
                <input
                  value={form.education}
                  onChange={(event) => onChange('education', event.target.value)}
                  className="input"
                />
              </AdminFormField>
              <AdminFormField label="Blood group">
                <input
                  value={form.bloodGroup}
                  onChange={(event) => onChange('bloodGroup', event.target.value)}
                  className="input"
                  placeholder="A+"
                />
              </AdminFormField>
              <AdminFormField label="Profession">
                <input
                  value={form.profession}
                  onChange={(event) => onChange('profession', event.target.value)}
                  className="input"
                />
              </AdminFormField>
              <AdminFormField label="Caste branch">
                <input
                  value={form.casteBranch}
                  onChange={(event) => onChange('casteBranch', event.target.value)}
                  className="input"
                />
              </AdminFormField>
            </AdminEditGroup>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <label className="flex items-start gap-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.declarationAccepted}
                  onChange={(event) => onChange('declarationAccepted', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700"
                />
                <span>Declaration accepted by member / verified by admin.</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60"
          >
            {saving ? 'Saving profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </section>
  )
}

function AdminEditGroup({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
      <legend className="px-2 text-sm font-black uppercase tracking-wide text-slate-600">
        {title}
      </legend>
      <div className="mt-3 grid gap-4 md:grid-cols-2">{children}</div>
    </fieldset>
  )
}

function CardPreviewPanel({
  member,
  canOpenCard,
}: {
  member: Member
  canOpenCard: boolean
}) {
  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
        Card Preview
      </p>
      <h3 className="mt-2 text-lg font-black text-slate-950">Digital membership card</h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
        Preview/export front and back card after approval. Any profile edit or designation update is reflected on this card page.
      </p>

      {canOpenCard ? (
        <Link
          to="/admin/members/$id/card"
          params={{ id: member.id }}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white no-underline hover:bg-black"
        >
          Open Card Preview
        </Link>
      ) : (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
          Card preview becomes available after approval and member number issuance.
        </div>
      )}
    </div>
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
  const hasCustomDesignation =
    Boolean(form.designation) &&
    !designationTitleOptions.some((item) => item === form.designation)
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
            <select
              value={form.designation}
              onChange={(event) => onChange({ designation: event.target.value })}
              className="input"
            >
              <option value="">Select designation</option>
              {hasCustomDesignation ? (
                <option value={form.designation}>
                  {form.designation} (current)
                </option>
              ) : null}
              {designationTitleOptions.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
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
  error,
  wide,
}: {
  label: string
  children: ReactNode
  required?: boolean
  error?: string
  wide?: boolean
}) {
  return (
    <label className={`block ${wide ? 'md:col-span-2' : ''}`}>
      <span className="mb-2 block text-sm font-black text-slate-800">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-2 block text-xs font-bold text-red-700">{error}</span> : null}
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

function memberToAdminEditForm(member: Member): AdminEditFormState {
  return {
    fullName: member.full_name ?? '',
    fatherName: member.father_name ?? '',
    cnic: member.cnic ?? '',
    mobile: member.mobile ?? '',
    district: member.district ?? '',
    taluka: member.taluka ?? '',
    address: member.address ?? '',
    dateOfBirth: member.date_of_birth ?? '',
    gender: member.gender ?? '',
    education: member.education ?? '',
    bloodGroup: member.blood_group ?? '',
    profession: member.profession ?? '',
    casteBranch: member.caste_branch ?? '',
    declarationAccepted: Boolean(member.declaration_accepted),
  }
}

function validateAdminEditForm(form: AdminEditFormState): AdminEditErrors {
  const errors: AdminEditErrors = {}

  if (!form.fullName.trim()) errors.fullName = 'Full name is required.'
  if (!form.fatherName.trim()) errors.fatherName = 'Father name is required.'
  if (!/^\d{5}-\d{7}-\d$/.test(form.cnic.trim())) {
    errors.cnic = 'CNIC format should be 42101-1234567-1.'
  }
  if (!isPakistaniMobile(form.mobile)) {
    errors.mobile = 'Enter a valid Pakistani mobile number.'
  }
  if (!form.district.trim()) errors.district = 'District is required.'
  if (!form.taluka.trim()) errors.taluka = 'Taluka is required.'
  if (!form.address.trim()) errors.address = 'Address is required.'

  return errors
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
