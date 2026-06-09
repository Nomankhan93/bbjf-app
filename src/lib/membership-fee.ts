// src/lib/membership-fee.ts
// BBJF membership-fee helpers adapted from the JAS membership portal.
// Update the manual payment details below before production use.

export const MEMBERSHIP_BASE_FEE = 700
export const MEMBERSHIP_FEE_CURRENCY = 'PKR'
export const MEMBERSHIP_PROCESSING_LABEL = 'applicable tax/processing charges'
export const MEMBERSHIP_PAYMENT_COMING_SOON_TEXT =
  'Manual payment receipt verification pending.'

export const MEMBERSHIP_RECEIPT_BUCKET = 'membership-receipts'
export const MEMBERSHIP_RECEIPT_MAX_SIZE_BYTES = 5 * 1024 * 1024
export const MEMBERSHIP_RECEIPT_MAX_SIZE_LABEL = '5MB'
export const MEMBERSHIP_RECEIPT_ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
]

// Replace this placeholder image with the real BBJF payment QR when available.
export const MEMBERSHIP_PAYMENT_QR_IMAGE_PATH = '/bbjf-icon-512.png'

export const MEMBERSHIP_MANUAL_PAYMENT_DETAILS = {
  bankName: 'BBJF Membership Account',
  accountTitle: 'Bilawal Bhutto Jayala Federation',
  accountNumber: 'Add account number',
  iban: 'Add IBAN',
  paymentNetwork: 'JazzCash / Easypaisa / Bank Transfer',
  tillId: 'Add Till ID',
} as const

export type MembershipPaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'waived'

export type MembershipPaymentMethod =
  | 'manual'
  | 'jazzcash'
  | 'easypaisa'
  | 'bank'
  | 'gateway'

export type MembershipPayment = {
  id: string
  member_id: string
  user_id: string
  base_amount: number
  tax_amount: number
  total_amount: number
  currency: string
  status: MembershipPaymentStatus
  payment_method: MembershipPaymentMethod
  gateway_provider: string | null
  gateway_reference: string | null
  receipt_path: string | null
  receipt_file_name: string | null
  receipt_mime_type: string | null
  receipt_size_bytes: number | null
  receipt_uploaded_at: string | null
  admin_note: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export type MembershipPaymentReceiptPayload = {
  receipt_path?: string | null
  receipt_file_name?: string | null
  receipt_mime_type?: string | null
  receipt_size_bytes?: number | null
  receipt_uploaded_at?: string | null
}

export function formatMembershipMoney(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)

  return `Rs. ${amount.toLocaleString('en-PK', {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    minimumFractionDigits: 0,
  })}`
}

export function createPendingMembershipPaymentPayload(
  memberId: string,
  userId: string,
  receipt?: MembershipPaymentReceiptPayload,
) {
  return {
    member_id: memberId,
    user_id: userId,
    base_amount: MEMBERSHIP_BASE_FEE,
    tax_amount: 0,
    total_amount: MEMBERSHIP_BASE_FEE,
    currency: MEMBERSHIP_FEE_CURRENCY,
    status: 'pending' as const,
    payment_method: 'bank' as const,
    gateway_provider: 'manual_bbjf_membership_account',
    gateway_reference: null,
    receipt_path: receipt?.receipt_path ?? null,
    receipt_file_name: receipt?.receipt_file_name ?? null,
    receipt_mime_type: receipt?.receipt_mime_type ?? null,
    receipt_size_bytes: receipt?.receipt_size_bytes ?? null,
    receipt_uploaded_at: receipt?.receipt_uploaded_at ?? null,
  }
}
