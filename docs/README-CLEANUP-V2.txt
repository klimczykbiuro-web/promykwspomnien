PROMYK WSPOMNIEN - CLEANUP PATCH V2

Cel tej paczki:
- odseparować prototyp/demo od live kodu,
- zostawić działający profil i księgę gości,
- uporządkować repo przed płatnościami.

Ta paczka NIE rusza:
- app/profile/[slug]/page.tsx
- app/api/profiles/[slug]/route.ts
- app/api/profiles/[slug]/guestbook/route.ts
- components/profile/guestbook-section.tsx
- lib/db.ts

Co robi:
- dodaje bezpieczny app/demo/page.tsx
- odświeża .gitignore
- daje checklistę ręcznego sprzątania

Po podmianie:
1. rozpakuj paczkę do głównego folderu projektu
2. nadpisz pliki
3. wykonaj ręczne usunięcia z REMOVE-LIST.txt
4. zrób:
   git add .
   git commit -m "Cleanup v2 separate demo from live code"
   git push

Po deployu:
- sprawdź /
- sprawdź /profile/maria-kowalska
- sprawdź /demo
