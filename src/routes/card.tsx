import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { toPng } from 'html-to-image'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase/client'

export const Route = createFileRoute('/card')({
  component: CardPage,
})

const APP_NAME = 'Bilawal Bhutto Jayala Federation'
const APP_SHORT_NAME = 'BBJF'

// BBJF me logo, flag aur icon same use ho rahe hain
const BBJF_ICON_PATH = '/bbjf-icon-512.png'

type Member = {
  id: string
  member_no: string | null
  full_name: string
  father_name: string
  cnic: string
  mobile: string
  district: string
  profession: string | null
  caste_branch: string | null
  photo_url: string
  status: 'pending' | 'approved' | 'rejected'
  approved_at: string | null
}

function CardPage() {
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
    loadCard()
  }, [])

  async function loadCard() {
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

    const { data, error } = await supabase
      .from('members')
      .select(
        'id, member_no, full_name, father_name, cnic, mobile, district, profession, caste_branch, photo_url, status, approved_at',
      )
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data) {
      setError('Membership form not found.')
      setLoading(false)
      return
    }

    setMember(data)

    if (data.status !== 'approved' || !data.member_no) {
      setError('Your membership is not approved yet.')
      setLoading(false)
      return
    }

    const encodedMemberNo = encodeURIComponent(data.member_no)
    const publicVerifyUrl = `${window.location.origin}/verify/${encodedMemberNo}`
    setVerifyUrl(publicVerifyUrl)

    const generatedQr = await QRCode.toDataURL(publicVerifyUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })

    setQrUrl(generatedQr)

    const { data: signed } = await supabase.storage
      .from('member-photos')
      .createSignedUrl(data.photo_url, 60 * 60)

    if (signed?.signedUrl) {
      const dataUrl = await imageUrlToDataUrl(signed.signedUrl)
      setPhotoUrl(dataUrl || signed.signedUrl)
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
      link.download = `${member.member_no}-${APP_SHORT_NAME}-card-front-back.png`
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
          Loading digital card...
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-10">
      <div className="page-wrap space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-emerald-700 no-underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Digital Membership Card
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Download your official {APP_SHORT_NAME} digital ID card with QR
            verification.
          </p>
        </header>

        {error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {member?.status === 'approved' && member.member_no ? (
          <>
            <section className="flex justify-center overflow-x-auto pb-2">
              <div
                ref={cardRef}
                className="w-full min-w-[760px] max-w-5xl space-y-6 bg-white p-4"
              >
                <MembershipCardFront
                  member={member}
                  photoUrl={photoUrl}
                  brandIconUrl={brandIconUrl}
                  qrUrl={qrUrl}
                />

                <MembershipCardBack
                  member={member}
                  brandIconUrl={brandIconUrl}
                  qrUrl={qrUrl}
                  verifyUrl={verifyUrl}
                />
              </div>
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
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-slate-700">
              Your digital card will be available after admin approval.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}

function MembershipCardFront({
  member,
  photoUrl,
  brandIconUrl,
  qrUrl,
}: {
  member: Member
  photoUrl: string | null
  brandIconUrl: string | null
  qrUrl: string | null
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white shadow-2xl">
      <div className="relative overflow-hidden bg-black p-7 text-white">
        <FlagStripes />

        <div className="relative flex items-start justify-between gap-5">
          <div className="flex items-center gap-5">
            {brandIconUrl ? (
              <img
                src={brandIconUrl}
                alt={`${APP_NAME} logo`}
                className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover shadow-xl"
              />
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/85">
                {APP_NAME}
              </p>
              <h2 className="mt-2 text-4xl font-black tracking-tight">
                Digital Member ID
              </h2>
              <p className="mt-2 text-sm text-white/90">
                Official {APP_SHORT_NAME} verified membership card
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-bold">
            VERIFIED
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-white">
        <CardWatermark brandIconUrl={brandIconUrl} />

        <div className="relative grid gap-7 p-7 md:grid-cols-[190px_1fr_190px]">
          <div className="space-y-3">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={member.full_name}
                className="h-48 w-48 rounded-3xl object-cover ring-4 ring-red-50"
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-3xl bg-slate-100 text-sm text-slate-500">
                No photo
              </div>
            )}

            <div className="rounded-2xl bg-slate-950 p-3 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-white/70">
                Member No
              </p>
              <p className="mt-1 text-sm font-black text-white">
                {member.member_no}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Member Name
              </p>
              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {member.full_name}
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Father Name" value={member.father_name} />
              <Info label="CNIC" value={member.cnic} />
              <Info label="Mobile" value={member.mobile} />
              <Info label="District" value={member.district} />
              <Info
                label="Profession"
                value={member.profession || 'Not provided'}
              />
              <Info
                label="Wing / Category"
                value={member.caste_branch || 'Not provided'}
              />
              <Info label="Approved Date" value={formatDate(member.approved_at)} />
              <Info label="Status" value="Approved" />
            </div>
          </div>

          <QrPanel qrUrl={qrUrl} />
        </div>
      </div>

      <CardFooter verifyUrl="" />
    </div>
  )
}

function MembershipCardBack({
  member,
  brandIconUrl,
  qrUrl,
  verifyUrl,
}: {
  member: Member
  brandIconUrl: string | null
  qrUrl: string | null
  verifyUrl: string
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white shadow-2xl">
      <div className="relative overflow-hidden bg-slate-950 p-7 text-white">
        <FlagStripes />

        <div className="relative flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
              Card Back Side
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Verification & Conditions
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">
              This side contains official verification details, issuing authority,
              and membership card usage conditions.
            </p>
          </div>

          {brandIconUrl ? (
            <img
              src={brandIconUrl}
              alt={`${APP_NAME} logo`}
              className="h-20 w-20 rounded-full border-4 border-white bg-white object-cover shadow-xl"
            />
          ) : null}
        </div>
      </div>

      <div className="relative overflow-hidden bg-white">
        <CardWatermark brandIconUrl={brandIconUrl} />

        <div className="relative grid gap-7 p-7 md:grid-cols-[1fr_230px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Issuing Authority
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {APP_NAME}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This digital membership card is issued for identification and
                public QR verification of an approved {APP_SHORT_NAME} member.
              </p>
            </section>

            <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm sm:grid-cols-2">
              <Info label="Member Name" value={member.full_name} />
              <Info label="Father Name" value={member.father_name} />
              <Info label="Member No" value={member.member_no || 'Not issued'} />
              <Info label="CNIC" value={member.cnic} />
              <Info label="Mobile" value={member.mobile} />
              <Info label="District" value={member.district} />
              <Info
                label="Profession"
                value={member.profession || 'Not provided'}
              />
              <Info
                label="Wing / Category"
                value={member.caste_branch || 'Not provided'}
              />
              <Info label="Approved Date" value={formatDate(member.approved_at)} />
              <Info label="Authority Status" value="Active / Approved" />
            </section>

            <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Terms & Conditions
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li>• This card remains valid only while membership status is approved.</li>
                <li>• Misuse, alteration, or unauthorized sharing may cancel membership verification.</li>
                <li>• Verification must be confirmed through the QR code or public verification URL.</li>
              </ul>
            </section>
          </div>

          <aside className="flex flex-col justify-between gap-5 rounded-3xl border border-slate-200 bg-white/90 p-5 text-center shadow-sm">
            <div>
              <QrPanel qrUrl={qrUrl} />

              <p className="mt-4 break-all rounded-2xl bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600">
                {verifyUrl}
              </p>
            </div>

            <div className="pt-4">
              <div className="mx-auto h-14 max-w-[170px] border-b border-slate-400" />
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Authorized Signature
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Digital membership office
              </p>
            </div>
          </aside>
        </div>
      </div>

      <CardFooter verifyUrl={verifyUrl} />
    </div>
  )
}

function FlagStripes() {
  return (
    <>
      <div className="absolute inset-y-0 left-0 w-1/3 bg-red-600" />
      <div className="absolute inset-y-0 left-1/3 w-1/3 bg-black" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-green-600" />
      <div className="absolute inset-0 bg-black/20" />
    </>
  )
}

function CardWatermark({ brandIconUrl }: { brandIconUrl: string | null }) {
  if (!brandIconUrl) return null

  return (
    <>
      <img
        src={brandIconUrl}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.16] mix-blend-multiply"
      />
      <div className="pointer-events-none absolute inset-0 bg-white/76" />
      <img
        src={brandIconUrl}
        alt=""
        className="pointer-events-none absolute right-12 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full object-cover opacity-[0.08]"
      />
    </>
  )
}

function QrPanel({ qrUrl }: { qrUrl: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      {qrUrl ? (
        <img
          src={qrUrl}
          alt="Verification QR"
          className="h-40 w-40 rounded-xl bg-white p-2"
        />
      ) : (
        <div className="h-40 w-40 rounded-xl bg-slate-100" />
      )}

      <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        Scan to verify
      </p>
    </div>
  )
}

function CardFooter({ verifyUrl }: { verifyUrl: string }) {
  return (
    <div className="border-t border-slate-200 bg-slate-50 px-7 py-4">
      <p className="text-xs leading-5 text-slate-500">
        This card is digitally generated by {APP_NAME}. QR verification confirms
        current membership status.
        {verifyUrl ? <span className="ml-1">Verification URL: {verifyUrl}</span> : null}
      </p>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  )
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : 'N/A'
}

async function imageUrlToDataUrl(url: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}
