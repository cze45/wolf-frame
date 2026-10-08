# Wolf Frame – landing page (koncept)

Statična stranica, bez build koraka. `index.html` + `css/` + `js/` + `assets/img/` + `assets/fonts/` (Montserrat, lokalno, bez spoljnih zahteva).
Sve putanje su relativne, pa radi i pod `/wolf-frame/` na GitHub Pages i na Cloudflare Pages.

## Pregled
- GitHub Pages: Settings → Pages → Deploy from a branch → izaberi granu i `/ (root)`.
- Lokalno: `python3 -m http.server 8000` pa otvori `http://localhost:8000`.

## Pre objave
- Stranica ima `noindex` i traku "Koncept za pregled". Ukloni obe kad firma odobri.
- Sva žuta polja (`class="ph"`) su podaci koji još nedostaju. Pronađi ih sa `grep -n 'class="ph"' index.html`.
- Forma: `data-endpoint=""` u `index.html`. Dok je prazan, forma samo prikazuje poruku. Upiši URL (Formspree, Cloudflare Worker...) kad se poveže prijem upita.
- Fotografije procesa su isečci iz Instagram priča (niska rezolucija). Zameni originalima.
