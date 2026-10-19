"""Pretvara canvas (.dc.html) u statične stranice repoa: index.html i galerija.html."""
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]

STATIC = {
    'accent': '#d9a05b', 'paper': '#f6eee0', 'dark': '#26231b',
    'sivaOd': '320', 'sivaDo': '450', 'kljucOd': '530', 'kljucDo': '690',
    # početno stanje kalkulatora (siva faza, 35 m²); dalje ga vodi js/main.js
    'sivaPressed': 'true', 'kljucPressed': 'false',
    'sivaBorder': '#d9a05b', 'sivaBg': '#ffffff',
    'kljucBorder': '#cfbe9f', 'kljucBg': 'transparent',
    # početno stanje zaglavlja (preko hero dela)
    'navBg': 'transparent', 'navShadow': 'none', 'navFg': '#ffffff',
    'navLine': 'rgba(255,255,255,0.7)', 'callOpacity': '0', 'callVis': 'hidden',
    'callShift': '-6px', 'callHidden': 'true', 'callTab': '-1',
}
LIVE = {  # vrednosti koje js/main.js menja
    'cenaOd': '11.200', 'cenaDo': '15.800', 'cenaM2': '320–450', 'nivoNaziv': 'Siva faza', 'm2': '35',
}

FONT_PRELOAD = '''<link rel="preload" href="assets/fonts/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/mulish-latin.woff2" as="font" type="font/woff2" crossorigin>'''


def body_of(path):
    s = open(path, encoding='utf-8').read()
    title = re.search(r'<title>(.*?)</title>', s).group(1)
    body = s[s.index('<x-dc>') + 6:s.index('</x-dc>')]
    helmet = re.search(r'<helmet>(.*?)</helmet>', body, flags=re.S).group(1)
    # stilovi iz canvasa (animacije, pravila za telefon) idu u <head>
    css = '\n'.join(re.findall(r'<style>\s*(.*?)\s*</style>', helmet, flags=re.S)).replace('body{margin:0}\n', '')
    body = re.sub(r'<helmet>.*?</helmet>\s*', '', body, flags=re.S)
    return title, body.strip() + '\n', css


def common(b):
    b = b.replace('href="Galerija.dc.html', 'href="galerija.html').replace('href="Main.dc.html', 'href="index.html')
    return b


def page(title, desc, body, css, extra_head=''):
    return f'''<!doctype html>
<html lang="sr-Latn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#2f3322">
{FONT_PRELOAD}
{extra_head}<link rel="stylesheet" href="css/style.css">
<style>
{css}
</style>
</head>
<body>
{body}<script src="js/main.js" defer></script>
</body>
</html>
'''


# ---- Glavna stranica ----
title, b, css = body_of(f'{SRC}/Main.dc.html')
b = common(b)

b = b.replace('<img src="/_blob/4853c60635104a2236bc936247eb9624" width="1500" height="1000" alt=""',
              '<img src="assets/img/hero-aframe.webp" srcset="assets/img/hero-aframe-900.webp 900w, assets/img/hero-aframe.webp 1500w" sizes="100vw" width="1500" height="1000" alt="" fetchpriority="high"')
assert '/_blob/' not in b

# Kalkulator: događaji idu u js/main.js
b = b.replace('onClick="{{pickSiva}}"', 'data-nivo="siva"').replace('onClick="{{pickKljuc}}"', 'data-nivo="kljuc"')
b = b.replace(' onChange="{{setM2}}"', '')
b = b.replace('value="{{m2}}"', 'value="35"')
for k, v in LIVE.items():
    b = b.replace('{{%s}}' % k, f'<span data-calc="{k}">{v}</span>')

# Zaglavlje i dugme za poziv dobijaju id za js/main.js
b = b.replace('<header style="position: sticky;', '<header id="nav" style="position: sticky;', 1)
assert 'id="nav-tel"' in b

b = b.replace('zameniti cenama Wolf Frame u Tweaks', 'zameniti cenama Wolf Frame u js/main.js')

# Forma
b = b.replace('<div style="flex: 1; display: flex; flex-direction: column; gap: 14px">\n<div><label for="ime"',
              '<form id="forma" data-endpoint="" novalidate style="flex: 1; display: flex; flex-direction: column; gap: 14px; margin: 0">\n<div><label for="ime"', 1)
b = b.replace('<input id="ime" type="text"', '<input id="ime" name="ime" type="text" required')
b = b.replace('<input id="telefon" type="tel"', '<input id="telefon" name="telefon" type="tel" required')
b = b.replace('<textarea id="opis"', '<textarea id="opis" name="opis"')
b = b.replace('<input type="checkbox" style="margin-top: 3px;', '<input type="checkbox" name="saglasnost" required style="margin-top: 3px;')
b = b.replace('<button type="button" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%;',
              '<p id="forma-msg" role="status" aria-live="polite" hidden style="margin: 0; padding: 10px 12px; border-radius: 6px; background: #f6eee0; border: 1px solid #cfbe9f; font-size: 15px; color: #26231b"></p>\n<button type="submit" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; width: 100%;', 1)
b = b.replace('Broj koristimo samo da te pozovemo povodom upita.</p>\n</div>',
              'Broj koristimo samo da te pozovemo povodom upita.</p>\n</form>', 1)
assert b.count('<form') == 1 and b.count('</form>') == 1

for k, v in STATIC.items():
    b = b.replace('{{%s}}' % k, v)
left = re.findall(r'\{\{[^}]+\}\}', b)
assert not left, left

hero_preload = '<link rel="preload" as="image" href="assets/img/hero-aframe.webp" imagesrcset="assets/img/hero-aframe-900.webp 900w, assets/img/hero-aframe.webp 1500w" imagesizes="100vw">\n'
open(f'{OUT}/index.html', 'w', encoding='utf-8').write(page(
    title, 'A-frame vikendice po meri tvog placa. Kragujevac, cela Srbija i Crna Gora. Izračunaj okvirnu cenu ili pošalji upit.',
    b, css, hero_preload))

# ---- Galerija ----
title, b, css = body_of(f'{SRC}/Galerija.dc.html')
b = common(b)
for k, v in STATIC.items():
    b = b.replace('{{%s}}' % k, v)
left = re.findall(r'\{\{[^}]+\}\}|/_blob/', b)
assert not left, left
open(f'{OUT}/galerija.html', 'w', encoding='utf-8').write(page(
    title, 'Galerija radova Wolf Frame: A-frame vikendice, bungalovi i brvnare, po projektima.', b, css))
print('ok')
