# Wolf Frame – landing page (koncept)

Statične stranice, bez build koraka. `index.html` (početna) + `galerija.html` (galerija radova po projektima) + `css/` + `js/` + `assets/img/` + `assets/fonts/` (Montserrat i Mulish, lokalno, bez spoljnih zahteva).
Sve putanje su relativne, pa radi i pod `/wolf-frame/` na GitHub Pages i na Cloudflare Pages.

## Pregled
- GitHub Pages: Settings → Pages → Deploy from a branch → izaberi granu i `/ (root)`.
- Lokalno: `python3 -m http.server 8000` pa otvori `http://localhost:8000`.

## Pre objave
- Stranica ima `noindex` i traku "Koncept za pregled". Ukloni obe kad firma odobri.
- Polja u isprekidanom okviru (`[POTREBNA INFORMACIJA]`, `[MESTO]`...) su podaci koji još nedostaju. Pronađi ih sa `grep -n 'dashed rgba(134,120,98' index.html galerija.html`.
- Fotografije su za sada placeholderi ("Fotografija: ..."). Zameni ih slikama objekata Wolf Frame.
- Kalkulator cene: cene po m² u `js/main.js` (`CENE`) i u tekstu kartica u `index.html` su primer iz reference. Zameni ih cenama firme.
- Forma: `data-endpoint=""` u `index.html`. Dok je prazan, forma samo prikazuje poruku. Upiši URL (Formspree, Cloudflare Worker...) kad se poveže prijem upita.

## Izvoz iz Claude Design-a
Stranice se prave iz canvasa u Claude Design-u (`Main.dc.html`, `Galerija.dc.html`):

    python3 tools/izvoz-canvasa.py <folder sa .dc.html fajlovima> .

Skripta prepisuje `index.html` i `galerija.html`; stilovi ostaju inline kao u canvasu, a kalkulator, zaglavlje i forma rade preko `js/main.js`.
`canvas-izvoz.html` je stariji izvoz (11. 10.), sačuvan kao referenca.
