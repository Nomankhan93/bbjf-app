# BBJF Payment Method JAS Data Patch

This patch updates the BBJF Rs. 500 membership payment panel to show the same manual payment method/data used in the JAS app while keeping the BBJF membership fee at Rs. 500.

## Updated payment details

- Bank name: Mobilink Microfinance Bank
- Account title: Abdur shop
- Account number: 01333300393
- IBAN: PK08JCMA1905921333300393
- Payment network: JazzCash / Raast
- Till ID: 983365478
- QR image: `public/bbjf/membership-payment-qr.jpg`

## Changed files

- `src/lib/membership-fee.ts`
- `public/bbjf/membership-payment-qr.jpg`
- `supabase/migrations/20260618150000_bbjf_membership_payment_rs500.sql`

## Notes

The displayed fee remains `Rs. 500 + applicable tax/processing charges.`
