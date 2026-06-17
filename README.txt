ETAP 1 modułu Partnerzy

Pliki do dodania:
- sql/01_partners_stage1.sql
- lib/admin/partners/schema.ts
- lib/admin/partners/repository.ts
- app/api/admin/partners/route.ts
- app/api/admin/partners/[id]/route.ts
- app/api/admin/partners/[id]/assignments/route.ts
- app/admin/partners/page.tsx
- app/admin/partners/[id]/page.tsx

Ważne:
1. Najpierw odpal SQL.
2. Potem upewnij się, że przy aktywacji profilu zapisujesz profiles.qr_code_id = qr_codes.id.
3. Jeśli masz własną warstwę autoryzacji admina w API, dołóż ją do nowych route.ts.
4. Jeśli w Twoim projekcie nazwy tabel qr_runs / qr_lots / qr_codes różnią się od tych w SQL, popraw nazwy przed odpaleniem.
