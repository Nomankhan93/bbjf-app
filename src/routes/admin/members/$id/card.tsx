import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { AdminShell } from '../../../../components/admin/AdminShell'
import {
  APP_SHORT_NAME,
  BBJF_ICON_PATH,
  CARD_EXPORT_HEIGHT,
  CARD_EXPORT_WIDTH,
  MembershipCard,
  type MembershipCardMember,
  imageUrlToDataUrl,
} from '../../../../components/MembershipCard'
import { useI18n, type TranslationKey } from '../../../../lib/i18n'
import { exportElementAsPng } from '../../../../lib/shared/card-export'
import { generateQrDataUrl } from '../../../../lib/shared/qrcode'
import { supabase } from '../../../../lib/supabase/client'

export const Route = createFileRoute('/admin/members/$id/card')({
  component: AdminMemberCardPage,
})

type Member = MembershipCardMember & {
  user_id: string
  rejection_reason: string | null
  reviewed_at: string | null
  created_at: string
}

type DownloadTarget = 'front' | 'back' | 'both'

const statusLabelKeys: Record<Member['status'], TranslationKey> = {
  pending: 'common.status.pending',
  approved: 'common.status.approved',
  rejected: 'common.status.rejected',
}

function AdminMemberCardPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const cardRef = useRef<HTMLDivElement>(null)
  const frontCardRef = useRef<HTMLElement>(null)
  const backCardRef = useRef<HTMLElement>(null)

  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<DownloadTarget | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [member, setMember] = useState<Member | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [brandIconUrl, setBrandIconUrl] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [verifyUrl, setVerifyUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void loadMemberCard()
  }, [id])

  async function loadMemberCard() {
    setLoading(true)
    setError('')

    const iconDataUrl = await imageUrlToDataUrl(BBJF_ICON_PATH)
    setBrandIconUrl(iconDataUrl || BBJF_ICON_PATH)

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
      .select(
        'id, user_id, member_no, full_name, father_name, cnic, mobile, district, taluka, address, date_of_birth, gender, education, blood_group, profession, designation, designation_level, designation_area, caste_branch, photo_url, status, rejection_reason, reviewed_at, approved_at, created_at',
      )
      .eq('id', id)
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMember(data)

    if (data.status !== 'approved' || !data.member_no) {
      setError(t('admin.card.onlyApproved'))
      setLoading(false)
      return
    }

    const publicVerifyUrl = createPublicVerifyUrl(data.member_no)
    setVerifyUrl(publicVerifyUrl)

    const generatedQr = await createQrDataUrl(publicVerifyUrl)
    setQrUrl(generatedQr)

    if (data.photo_url) {
      const { data: signed } = await supabase.storage
        .from('member-photos')
        .createSignedUrl(data.photo_url, 60 * 60)

      if (signed?.signedUrl) {
        const dataUrl = await imageUrlToDataUrl(signed.signedUrl)
        setPhotoUrl(dataUrl || signed.signedUrl)
      }
    }

    setLoading(false)
  }

  async function handleDownload(target: DownloadTarget) {
    if (!member?.member_no) return

    const exportTarget =
      target === 'front'
        ? frontCardRef.current
        : target === 'back'
          ? backCardRef.current
          : cardRef.current

    if (!exportTarget) return

    setDownloading(target)
    setError('')

    try {
      const suffix = target === 'both' ? 'front-back-card' : `${target}-card`
      await exportElementAsPng(
        exportTarget,
        `${member.member_no}-${APP_SHORT_NAME}-admin-${suffix}.png`,
        target === 'both'
          ? undefined
          : {
              width: CARD_EXPORT_WIDTH,
              height: CARD_EXPORT_HEIGHT,
              canvasWidth: CARD_EXPORT_WIDTH * 2,
              canvasHeight: CARD_EXPORT_HEIGHT * 2,
              pixelRatio: 2,
            },
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : t('card.downloadError'))
    } finally {
      setDownloading(null)
    }
  }

  async function handleCopyVerificationLink() {
    if (!verifyUrl) return

    try {
      await navigator.clipboard.writeText(verifyUrl)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 1600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to copy link.')
    }
  }

  if (loading) {
    return (
      <AdminShell title={t('admin.card.title')} subtitle={t('admin.card.loading')}>
        <div className="rounded-2xl bg-white p-6 shadow-sm" dir={direction}>
          {t('admin.card.loading')}
        </div>
      </AdminShell>
    )
  }

  if (!member) {
    return (
      <AdminShell title={t('admin.card.title')} subtitle={t('admin.card.onlyApproved')}>
        <div className="rounded-2xl bg-white p-6 shadow-sm" dir={direction}>
          {t('common.memberNotFound')}
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title={t('admin.card.title')} subtitle={member.full_name}>
      <div className="space-y-6" dir={direction}>
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <Link to="/admin" className="text-emerald-700 no-underline">
              {t('common.backToAdmin')}
            </Link>
            <Link
              to="/admin/members/$id"
              params={{ id: member.id }}
              className="text-emerald-700 no-underline"
            >
              {t('common.backToMemberDetail')}
            </Link>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t('admin.card.title')}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {member.full_name} · {member.member_no || t('dashboard.notIssuedYet')}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              {t(statusLabelKeys[member.status])}
            </span>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {member.status === 'approved' && member.member_no ? (
          <>
            <section className="overflow-x-auto pb-3">
              <div className="min-w-[1048px]">
                <MembershipCard
                  ref={cardRef}
                  frontRef={frontCardRef}
                  backRef={backCardRef}
                  member={member}
                  photoUrl={photoUrl}
                  brandIconUrl={brandIconUrl}
                  qrUrl={qrUrl}
                  verifyUrl={verifyUrl}
                />
              </div>
            </section>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => void handleDownload('front')}
                disabled={Boolean(downloading)}
                className="rounded-lg bg-slate-950 px-5 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
              >
                {downloading === 'front'
                  ? t('common.downloading')
                  : t('common.downloadFrontPng')}
              </button>

              <button
                type="button"
                onClick={() => void handleDownload('back')}
                disabled={Boolean(downloading)}
                className="rounded-lg bg-slate-950 px-5 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
              >
                {downloading === 'back'
                  ? t('common.downloading')
                  : t('common.downloadBackPng')}
              </button>

              <button
                type="button"
                onClick={() => void handleDownload('both')}
                disabled={Boolean(downloading)}
                className="rounded-lg bg-slate-950 px-5 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
              >
                {downloading === 'both'
                  ? t('common.downloading')
                  : t('common.downloadFrontBackPng')}
              </button>

              <button
                type="button"
                onClick={() => void handleCopyVerificationLink()}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {linkCopied ? t('common.copied') : t('common.copyVerificationLink')}
              </button>

              <Link
                to="/verify/$memberNo"
                params={{ memberNo: member.member_no }}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 no-underline hover:bg-slate-50"
              >
                {t('common.openVerificationPage')}
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </AdminShell>
  )
}

function createPublicVerifyUrl(memberNo: string) {
  const encodedMemberNo = encodeURIComponent(memberNo)
  return `${window.location.origin}/verify/${encodedMemberNo}`
}

async function createQrDataUrl(value: string) {
  return generateQrDataUrl(value, {
    width: 280,
    margin: 1,
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
  })
}
