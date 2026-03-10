PORZĄDEK W PROJEKCIE – CO ROBI TA PACZKA

Ta paczka NIE rusza działającego live profilu ani księgi gości.
Dodaje tylko bezpieczne porządki techniczne:
- poprawny .gitignore
- package.json z typami dla pg
- instrukcję sprzątania repo po wcześniejszym wrzuceniu node_modules

PO PODMIANIE PLIKÓW ZRÓB W POWERSHELL W GŁÓWNYM FOLDERZE PROJEKTU:

git rm -r --cached node_modules
git rm -r --cached .next
git add .
git commit -m "Clean repo and ignore generated files"
git push

POTEM W VERCEL:
- Build Command powinien zostać: npm run build
- uruchom Redeploy

DALSZY PORZĄDEK (RĘCZNIE, PÓŹNIEJ):
- zostaw live kod w app/profile/[slug], app/api/profiles i components/profile
- duży MemoryProfilePrototype traktuj jako demo/prototyp, nie rdzeń produkcyjny
- jeśli chcesz go zachować, przenieś go później do osobnego pliku demo lub dokumentacji
