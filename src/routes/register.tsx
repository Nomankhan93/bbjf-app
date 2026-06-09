import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

const sindhDistricts = [
  'Badin',
  'Dadu',
  'Ghotki',
  'Hyderabad',
  'Jacobabad',
  'Jamshoro',
  'Karachi Central',
  'Karachi East',
  'Karachi Keamari',
  'Karachi Korangi',
  'Karachi Malir',
  'Karachi South',
  'Karachi West',
  'Kashmore',
  'Khairpur',
  'Larkana',
  'Matiari',
  'Mirpur Khas',
  'Naushahro Feroze',
  'Qambar Shahdadkot',
  'Sanghar',
  'Shaheed Benazirabad',
  'Shikarpur',
  'Sukkur',
  'Sujawal',
  'Tando Allahyar',
  'Tando Muhammad Khan',
  'Tharparkar',
  'Thatta',
  'Umerkot',
]

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const genderOptions = ['Male', 'Female', 'Other']

type ExistingMember = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
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
  caste_branch: string | null
  declaration_accepted: boolean
  photo_url: string
}

function RegisterPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState('')
  const [existingMember, setExistingMember] = useState<ExistingMember | null>(
    null,
  )

  const [fullName, setFullName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [cnic, setCnic] = useState('')
  const [mobile, setMobile] = useState('')
  const [district, setDistrict] = useState('')
  const [taluka, setTaluka] = useState('')
  const [address, setAddress] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [education, setEducation] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [profession, setProfession] = useState('')
  const [casteBranch, setCasteBranch] = useState('')
  const [declarationAccepted, setDeclarationAccepted] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)

  const [error, setError] = useState('')

  useEffect(() => {
    loadExisting()
  }, [])

  async function loadExisting() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate({ to: '/login' })
      return
    }

    setUserId(user.id)

    const { data, error } = await supabase
      .from('members')
      .select(
        'id, status, full_name, father_name, cnic, mobile, district, taluka, address, date_of_birth, gender, education, blood_group, profession, caste_branch, declaration_accepted, photo_url',
      )
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data) {
      setExistingMember(data)
      setFullName(data.full_name)
      setFatherName(data.father_name)
      setCnic(data.cnic)
      setMobile(data.mobile)
      setDistrict(data.district)
      setTaluka(data.taluka ?? '')
      setAddress(data.address ?? '')
      setDateOfBirth(data.date_of_birth ?? '')
      setGender(data.gender ?? '')
      setEducation(data.education ?? '')
      setBloodGroup(data.blood_group ?? '')
      setProfession(data.profession ?? '')
      setCasteBranch(data.caste_branch ?? '')
      setDeclarationAccepted(data.declaration_accepted)
    }

    setLoading(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!userId) {
      setError('You must be logged in.')
      return
    }

    if (existingMember && existingMember.status !== 'pending') {
      setError('Only pending membership forms can be edited.')
      return
    }

    if (!existingMember && !photo) {
      setError('Photo is required.')
      return
    }

    if (!fullName.trim() || !fatherName.trim()) {
      setError('Full name and father name are required.')
      return
    }

    if (!/^[0-9]{5}-[0-9]{7}-[0-9]$/.test(cnic.trim())) {
      setError('CNIC format must be 12345-1234567-1')
      return
    }

    if (!district || !taluka.trim()) {
      setError('District and taluka are required.')
      return
    }

    if (!address.trim()) {
      setError('Address is required.')
      return
    }

    if (!declarationAccepted) {
      setError('Please accept the membership declaration before submitting.')
      return
    }

    setSubmitting(true)

    let photoPath = existingMember?.photo_url ?? ''

    if (photo) {
      const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
      photoPath = `${userId}/photo-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(photoPath, photo, {
          upsert: true,
          contentType: photo.type,
        })

      if (uploadError) {
        setError(uploadError.message)
        setSubmitting(false)
        return
      }
    }

    const payload = {
      full_name: fullName.trim(),
      father_name: fatherName.trim(),
      cnic: cnic.trim(),
      mobile: mobile.trim(),
      district,
      taluka: taluka.trim(),
      address: address.trim(),
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      education: education.trim() || null,
      blood_group: bloodGroup || null,
      profession: profession.trim() || null,
      caste_branch: casteBranch.trim() || null,
      declaration_accepted: declarationAccepted,
      photo_url: photoPath,
    }

    if (existingMember) {
      const { error: updateError } = await supabase
        .from('members')
        .update(payload)
        .eq('id', existingMember.id)

      if (updateError) {
        setError(updateError.message)
        setSubmitting(false)
        return
      }
    } else {
      const { error: insertError } = await supabase.from('members').insert({
        user_id: userId,
        ...payload,
        status: 'pending',
      })

      if (insertError) {
        setError(insertError.message)
        setSubmitting(false)
        return
      }
    }

    setSubmitting(false)
    navigate({ to: '/dashboard' })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-600">Loading form...</p>
        </div>
      </main>
    )
  }

  const locked = existingMember?.status !== undefined && existingMember.status !== 'pending'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium text-emerald-700">
            Bilawal Bhutto Jayala Federation
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Membership Registration
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Submit your complete profile, contact details and photo for admin review.
          </p>
        </div>

        {existingMember?.status === 'approved' ? (
          <div className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            Your membership is approved. You cannot edit this form now.
          </div>
        ) : null}

        {existingMember?.status === 'rejected' ? (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
            Your application was rejected. Editing rejected forms is not enabled
            yet.
          </div>
        ) : null}

        {error ? (
          <div className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full Name">
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                disabled={locked}
                required
                className="input"
                placeholder="Enter full name"
              />
            </Field>

            <Field label="Father Name">
              <input
                value={fatherName}
                onChange={(event) => setFatherName(event.target.value)}
                disabled={locked}
                required
                className="input"
                placeholder="Enter father name"
              />
            </Field>

            <Field label="CNIC">
              <input
                value={cnic}
                onChange={(event) => setCnic(event.target.value)}
                disabled={locked}
                required
                className="input"
                placeholder="12345-1234567-1"
              />
            </Field>

            <Field label="Mobile">
              <input
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                disabled={locked}
                required
                className="input"
                placeholder="03001234567"
              />
            </Field>

            <Field label="District">
              <select
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                disabled={locked}
                required
                className="input"
              >
                <option value="">Select district</option>
                {sindhDistricts.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Taluka / Town">
              <input
                value={taluka}
                onChange={(event) => setTaluka(event.target.value)}
                disabled={locked}
                required
                className="input"
                placeholder="Enter taluka or town"
              />
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                disabled={locked}
                className="input"
              />
            </Field>

            <Field label="Gender">
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                disabled={locked}
                className="input"
              >
                <option value="">Select gender</option>
                {genderOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Education">
              <input
                value={education}
                onChange={(event) => setEducation(event.target.value)}
                disabled={locked}
                className="input"
                placeholder="Optional"
              />
            </Field>

            <Field label="Blood Group">
              <select
                value={bloodGroup}
                onChange={(event) => setBloodGroup(event.target.value)}
                disabled={locked}
                className="input"
              >
                <option value="">Select blood group</option>
                {bloodGroups.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Profession">
              <input
                value={profession}
                onChange={(event) => setProfession(event.target.value)}
                disabled={locked}
                className="input"
                placeholder="Optional"
              />
            </Field>

            <Field label="Caste Branch / Category">
              <input
                value={casteBranch}
                onChange={(event) => setCasteBranch(event.target.value)}
                disabled={locked}
                className="input"
                placeholder="Optional"
              />
            </Field>

            <Field label="Address">
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                disabled={locked}
                required
                className="input min-h-24 resize-y md:col-span-2"
                placeholder="Enter complete residential address"
              />
            </Field>

            <Field label="Photo">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
                disabled={locked}
                required={!existingMember}
                className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-800"
              />
            </Field>
          </div>

          <label className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={declarationAccepted}
              onChange={(event) => setDeclarationAccepted(event.target.checked)}
              disabled={locked}
              required
              className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"
            />
            <span>
              I confirm that the information provided in this membership form is
              correct and I agree to follow the organization membership rules.
            </span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting || locked}
              className="rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : existingMember ? 'Update Form' : 'Submit Form'}
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: '/dashboard' })}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Back to Dashboard
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  )
}
