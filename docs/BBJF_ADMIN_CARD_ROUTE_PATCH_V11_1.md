# BBJF Admin Card Route Patch v11.1

Fixes TypeScript role typing error in `src/routes/admin/members/$id/card.tsx`.

BBJF typed Supabase schema currently allows the admin role as `admin`, so the admin card route now checks `.eq('role', 'admin')` instead of passing multiple JAS role names to `.in()`.

Run:

```bash
npm run check
npm run build
```
