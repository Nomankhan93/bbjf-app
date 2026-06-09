import { forwardRef } from 'react'

export const APP_NAME = 'Bilawal Bhutto Jayala Federation'
export const APP_SHORT_NAME = 'BBJF'
export const BBJF_ICON_PATH = '/bbjf-icon-512.png'

export type MembershipCardMember = {
  id: string
  member_no: string | null
  full_name: string
  father_name: string
  cnic: string
  mobile: string
  district: string
  profession: string | null
  caste_branch: string | null
  photo_url?: string | null
  status: 'pending' | 'approved' | 'rejected'
  approved_at: string | null
}

type MembershipCardProps = {
  member: MembershipCardMember
  photoUrl: string | null
  brandIconUrl: string | null
  qrUrl: string | null
  verifyUrl: string
}

export const MembershipCard = forwardRef<HTMLDivElement, MembershipCardProps>(
  function MembershipCard(
    { member, photoUrl, brandIconUrl, qrUrl, verifyUrl },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className="w-full max-w-5xl space-y-5 rounded-[2rem] bg-white p-4 shadow-2xl"
      >
        <CardFront
          member={member}
          photoUrl={photoUrl}
          brandIconUrl={brandIconUrl}
          qrUrl={qrUrl}
        />

        <CardBack
          member={member}
          brandIconUrl={brandIconUrl}
          qrUrl={qrUrl}
          verifyUrl={verifyUrl}
        />
      </div>
    )
  },
)

function CardFront({
  member,
  photoUrl,
  brandIconUrl,
  qrUrl,
}: {
  member: MembershipCardMember
  photoUrl: string | null
  brandIconUrl: string | null
  qrUrl: string | null
}) {
  return (
    <section className="overflow-hidden rounded-[1.65rem] border border-slate-900/10 bg-white">
      <div className="relative overflow-hidden bg-black p-7 text-white">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-red-600" />
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-black" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-green-600" />
        <div className="absolute inset-0 bg-black/25" />

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
              <Info label="Profession" value={member.profession} />
              <Info label="Wing / Category" value={member.caste_branch} />
              <Info label="Approved Date" value={formatDate(member.approved_at)} />
              <Info label="Status" value="Approved" />
            </div>
          </div>

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
        </div>
      </div>
    </section>
  )
}

function CardBack({
  member,
  brandIconUrl,
  qrUrl,
  verifyUrl,
}: {
  member: MembershipCardMember
  brandIconUrl: string | null
  qrUrl: string | null
  verifyUrl: string
}) {
  return (
    <section className="overflow-hidden rounded-[1.65rem] border border-slate-900/10 bg-white">
      <div className="relative overflow-hidden bg-slate-950 p-7 text-white">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-red-700" />
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-black" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-green-700" />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">
              Official Verification Side
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              {APP_SHORT_NAME} Membership Verification
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/85">
              This card remains valid only when the QR verification page shows
              approved membership status.
            </p>
          </div>

          {brandIconUrl ? (
            <img
              src={brandIconUrl}
              alt={`${APP_SHORT_NAME} logo`}
              className="h-20 w-20 rounded-full border-4 border-white bg-white object-cover shadow-xl"
            />
          ) : null}
        </div>
      </div>

      <div className="relative overflow-hidden bg-white">
        <CardWatermark brandIconUrl={brandIconUrl} />

        <div className="relative grid gap-7 p-7 md:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">
                Member Information
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Info label="Name" value={member.full_name} />
                <Info label="Father Name" value={member.father_name} />
                <Info label="Member No" value={member.member_no} />
                <Info label="CNIC" value={member.cnic} />
                <Info label="Mobile" value={member.mobile} />
                <Info label="District" value={member.district} />
                <Info label="Profession" value={member.profession} />
                <Info label="Wing / Category" value={member.caste_branch} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-950">
                Terms & Conditions
              </h3>

              <ol className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                <li>1. This digital card is property of {APP_NAME}.</li>
                <li>
                  2. Misuse, alteration, or unauthorized duplication is not
                  allowed.
                </li>
                <li>
                  3. Verification must be confirmed through the official QR
                  code or verification URL.
                </li>
                <li>
                  4. Membership status may be updated by the authorized admin
                  office.
                </li>
              </ol>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white/95 p-5 text-center shadow-sm">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Verification QR"
                  className="mx-auto h-44 w-44 rounded-xl bg-white p-2"
                />
              ) : (
                <div className="mx-auto h-44 w-44 rounded-xl bg-slate-100" />
              )}

              <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Scan to Verify
              </p>
              <p className="mt-2 break-all text-xs leading-5 text-slate-600">
                {verifyUrl || 'Verification URL not available'}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                Issuing Authority
              </p>
              <p className="mt-2 text-lg font-black">{APP_NAME}</p>
              <p className="mt-1 text-sm text-white/70">
                Digital Membership Office
              </p>

              <div className="mt-8 border-t border-white/30 pt-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                  Authorized Signature
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  Issued Electronically
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
              Official Notice: If found, please verify the QR code and contact
              the issuing organization before using this card for any official
              purpose.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CardWatermark({ brandIconUrl }: { brandIconUrl: string | null }) {
  if (!brandIconUrl) return null

  return (
    <>
      <img
        src={brandIconUrl}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12] mix-blend-multiply"
      />
      <div className="pointer-events-none absolute inset-0 bg-white/80" />
      <img
        src={brandIconUrl}
        alt=""
        className="pointer-events-none absolute right-10 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full object-cover opacity-[0.08]"
      />
    </>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-950">
        {value || 'Not provided'}
      </p>
    </div>
  )
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'N/A'

  return new Date(value).toLocaleDateString()
}

export async function imageUrlToDataUrl(url: string) {
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
