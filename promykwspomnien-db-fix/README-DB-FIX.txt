Podmien ten plik:
- lib/db.ts

Jesli nadal masz w projekcie plik `types/pg.d.ts`, mozesz go zostawic.
Ten fix usuwa uzycie `Pool` jako typu, wiec build nie powinien juz padac na:
"Cannot use namespace 'Pool' as a type".

Po podmianie zrob:
- git add .
- git commit -m "Fix db pool typing"
- git push
