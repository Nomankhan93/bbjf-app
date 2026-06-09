import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import {
  APP_SHORT_NAME,
  BBJF_ICON_PATH,
  MembershipCard,
  type MembershipCardMember,
  imageUrlToDataUrl,
} from '../../../../components/MembershipCard'
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

function AdminMemberCardPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const cardRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [member, setMember] = useState<Member | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [brandIconUrl, setBrandIconUrl] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [verifyUrl, setVerifyUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadMemberCard()
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
        'id, user_id, member_no, full_name, father_name, cnic, mobile, district, profession, caste_branch, photo_url, status, rejection_reason, reviewed_at, approved_at, created_at',
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
      setError('Card preview is available only after approval and member number generation.')
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

  async function handleDownload() {
    if (!cardRef.current || !member?.member_no) return

    setDownloading(true)
    setError('')

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        fontEmbedCSS: '',
      })

      const link = document.createElement('a')
      link.download = `${member.member_no}-${APP_SHORT_NAME}-admin-front-back-card.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to download card. Please try again.',
      )
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <main className="px-4 py-10">
        <div className="page-wrap rounded-2xl bg-white p-6 shadow-sm">
          Loading member card...
        </div>
      </main>
    )
  }

  if (!member) {
    return (
      <main className="px-4 py-10">
        <div className="page-wrap rounded-2xl bg-white p-6 shadow-sm">
          Member not found.
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-10">
      <div className="page-wrap space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3 text-sm font-medium">
            <Link to="/admin" className="text-emerald-700 no-underline">
              ← Back to Admin
            </Link>
            <Link
              to="/admin/members/$id"
              params={{ id: member.id }}
              className="text-emerald-700 no-underline"
            >
              Back to Member Detail
            </Link>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Card Preview
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {member.full_name} · {member.member_no || 'No member number'}
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              {member.status}
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
            <section className="flex justify-center">
              <MembershipCard
                ref={cardRef}
                member={member}
                photoUrl={photoUrl}
                brandIconUrl={brandIconUrl}
                qrUrl={qrUrl}
                verifyUrl={verifyUrl}
              />
            </section>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="rounded-lg bg-slate-950 px-5 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
              >
                {downloading ? 'Downloading...' : 'Download Front + Back PNG'}
              </button>

              <Link
                to="/verify/$memberNo"
                params={{ memberNo: member.member_no }}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 no-underline hover:bg-slate-50"
              >
                Open Verification Page
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </main>
  )
}

function createPublicVerifyUrl(memberNo: string) {
  const encodedMemberNo = encodeURIComponent(memberNo)
  return `${window.location.origin}/verify/${encodedMemberNo}`
}

async function createQrDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    width: 280,
    margin: 1,
    color: {
      dark: '#111827',
      light: '#ffffff',
    },
  })
}
