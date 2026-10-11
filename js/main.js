(function () {
  'use strict';

  var MOBILE = window.matchMedia('(max-width: 719.98px)');

  // Padajući meniji u zaglavlju (miš: lebdenje, tastatura i dodir: klik)
  var menus = Array.prototype.slice.call(document.querySelectorAll('.menu'));
  function setMenu(m, open, pinned) {
    m.classList.toggle('is-open', open);
    m.dataset.pinned = open && pinned ? '1' : '';
    m.querySelector('.menu__btn').setAttribute('aria-expanded', String(open));
  }
  function closeMenus(except) {
    menus.forEach(function (m) { if (m !== except) setMenu(m, false); });
  }
  menus.forEach(function (m) {
    var btn = m.querySelector('.menu__btn');
    m.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover)').matches) { closeMenus(m); setMenu(m, true, false); }
    });
    m.addEventListener('mouseleave', function () {
      if (window.matchMedia('(hover: hover)').matches) setMenu(m, false);
    });
    btn.addEventListener('click', function () {
      var pinned = m.classList.contains('is-open') && m.dataset.pinned === '1';
      closeMenus(m);
      setMenu(m, !pinned, true);
    });
    m.addEventListener('click', function (e) {
      if (e.target.closest('.menu__list a')) setMenu(m, false);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.menu')) closeMenus();
  });

  // Mobilni meni
  var burger = document.querySelector('.burger');
  var drawer = document.getElementById('mobilni-meni');
  var lastFocus = null;
  function lock(on) {
    var b = document.body;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    b.style.paddingRight = on && sbw > 0 ? sbw + 'px' : '';
    b.style.overflow = on ? 'hidden' : '';
  }
  function drawerOpen(on) {
    if (!burger || !drawer) return;
    var isOpen = document.body.classList.contains('drawer-open');
    if (on === isOpen) return;
    document.body.classList.toggle('drawer-open', on);
    burger.setAttribute('aria-expanded', String(on));
    drawer.setAttribute('aria-hidden', String(!on));
    lock(on);
    if (on) {
      lastFocus = document.activeElement;
      var x = drawer.querySelector('.drawer__x');
      if (x) x.focus();
    } else if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  }
  if (burger) burger.addEventListener('click', function () { drawerOpen(true); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-close-drawer]'), function (el) {
    el.addEventListener('click', function () { drawerOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    drawerOpen(false);
    closeMenus();
  });
  function onBreakpoint() { if (!MOBILE.matches) drawerOpen(false); }
  if (MOBILE.addEventListener) MOBILE.addEventListener('change', onBreakpoint);
  else MOBILE.addListener(onBreakpoint);

  // Naslovi: H1 uvek staje u dva reda, a H2 na telefonu u jedan red
  var h1 = document.getElementById('h1');
  function fitH1() {
    if (!h1) return;
    var w = h1.clientWidth;
    if (!w) return;
    h1.style.fontSize = '';
    var cur = parseFloat(getComputedStyle(h1).fontSize);
    var m = 0;
    Array.prototype.forEach.call(h1.querySelectorAll('span'), function (s) { m = Math.max(m, s.scrollWidth); });
    if (!m) return;
    var next = Math.max(26, Math.min(56, Math.floor(cur * w / m * 0.98)));
    if (Math.abs(next - cur) > 0.5) h1.style.fontSize = next + 'px';
  }
  function fitH2() {
    var mob = MOBILE.matches;
    Array.prototype.forEach.call(document.querySelectorAll('main h2'), function (el) {
      el.style.fontSize = '';
      if (!mob) return;
      var cw = el.clientWidth, sw = el.scrollWidth;
      if (cw && sw > cw) {
        var cur = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = Math.floor(cur * cw / sw * 0.97 * 10) / 10 + 'px';
      }
    });
  }
  function fit() { fitH1(); fitH2(); }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('resize', fit, { passive: true });
  window.addEventListener('orientationchange', fit);

  // Pitanja: otvoreno je samo jedno
  var faq = document.getElementById('faq');
  if (faq) {
    faq.addEventListener('toggle', function (e) {
      var d = e.target;
      if (!d.open) return;
      Array.prototype.forEach.call(faq.querySelectorAll('details[open]'), function (o) { if (o !== d) o.open = false; });
    }, true);
  }

  // Forma
  var form = document.getElementById('forma');
  var msg = document.getElementById('forma-msg');
  if (!form || !msg) return;
  var btn = form.querySelector('button[type=submit]');
  var PHONE = '064 252 45 62';

  var rules = {
    ime: { ok: function (el) { return el.value.trim().length > 1; }, text: 'Upiši ime.' },
    telefon: { ok: function (el) { return el.value.replace(/\D/g, '').length >= 8; }, text: 'Upiši broj telefona, npr. 064 123 4567.' },
    mesto: { ok: function (el) { return el.value.trim().length > 1; }, text: 'Upiši mesto gde je plac.' },
    saglasnost: { ok: function (el) { return el.checked; }, text: 'Potvrdi saglasnost da bismo ti se javili.' }
  };

  function say(text, kind) {
    msg.textContent = text;
    msg.className = 'form__msg ' + (kind || '');
  }

  function setError(name, text) {
    var el = form.elements[name];
    var out = document.getElementById('err-' + name);
    if (!el || !out) return;
    out.hidden = !text;
    out.textContent = text || '';
    if (text) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
  }

  // Greška nestaje čim osoba počne da ispravlja polje
  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name];
    if (!el) return;
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      if (rules[name].ok(el)) setError(name, '');
    });
  });

  function busy(on) {
    btn.disabled = false; // dugme ostaje aktivno do početka zahteva
    if (on) {
      btn.setAttribute('aria-busy', 'true');
      btn.disabled = true;
      btn.textContent = 'Slanje…';
    } else {
      btn.removeAttribute('aria-busy');
      btn.disabled = false;
      btn.textContent = btn.getAttribute('data-label');
    }
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    say('', '');

    var first = null;
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      var ok = rules[name].ok(el);
      setError(name, ok ? '' : rules[name].text);
      if (!ok && !first) first = el;
    });
    if (first) { first.focus(); return; }
    if (form.elements.website.value) return; // honeypot

    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) {
      say('Ovo je koncept za pregled: forma još nije povezana sa prijemom upita. Pozovi ' + PHONE + '.', 'is-info');
      return;
    }

    busy(true);
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        say('Hvala! Javljamo ti se u vezi okvirne cene.', 'is-info');
      })
      .catch(function () {
        say('Slanje nije uspelo. Pokušaj ponovo ili pozovi ' + PHONE + '.', 'is-err');
      })
      .then(function () { busy(false); });
  });
})();
