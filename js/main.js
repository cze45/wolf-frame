(function () {
  'use strict';

  var NAV_H = 72;

  // Pojavljivanje sekcija pri skrolovanju (jedan stil, jednom po sekciji)
  var reveal = document.querySelectorAll('[data-reveal]');
  if (reveal.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('a-js');
    var ro = new IntersectionObserver(function (unosi) {
      unosi.forEach(function (u) {
        if (u.isIntersecting) { u.target.classList.add('a-in'); ro.unobserve(u.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(reveal, function (el) { ro.observe(el); });
  }

  // Zaglavlje: providno preko hero dela, maslinasto posle njega,
  // svetlo preko maslinastih delova (data-nav="svetla")
  var nav = document.getElementById('nav');
  var tel = document.getElementById('nav-tel');
  var hero = document.getElementById('hero');
  if (nav) {
    var stanje = '';
    var proveriNav = function () {
      var posleHero = hero ? hero.getBoundingClientRect().bottom <= NAV_H : true;
      var svetla = Array.prototype.some.call(document.querySelectorAll('[data-nav="svetla"]'), function (el) {
        var r = el.getBoundingClientRect();
        return r.top + 40 <= NAV_H / 2 && r.bottom >= NAV_H / 2;
      });
      var novo = !posleHero ? 'hero' : (svetla ? 'svetla' : 'tamna');
      if (novo === stanje) return;
      stanje = novo;
      var s = nav.style;
      if (novo === 'hero') {
        s.background = 'transparent'; s.boxShadow = 'none'; s.color = '#ffffff';
      } else if (novo === 'svetla') {
        s.background = '#f6eee0'; s.color = '#26231b';
        s.boxShadow = '0 1px 0 rgba(38,35,27,0.1), 0 6px 18px rgba(0,0,0,0.12)';
      } else {
        s.background = '#2f3322'; s.color = '#ffffff';
        s.boxShadow = '0 1px 0 rgba(255,255,255,0.08), 0 6px 18px rgba(0,0,0,0.18)';
      }
      if (tel) {
        var vidi = novo !== 'hero';
        tel.style.opacity = vidi ? '1' : '0';
        tel.style.visibility = vidi ? 'visible' : 'hidden';
        tel.style.transform = vidi ? 'translateY(0)' : 'translateY(-6px)';
        tel.style.borderColor = novo === 'svetla' ? 'rgba(38,35,27,0.45)' : 'rgba(255,255,255,0.7)';
        tel.setAttribute('aria-hidden', String(!vidi));
        tel.setAttribute('tabindex', vidi ? '0' : '-1');
      }
      if (menuBtn) menuBtn.style.borderColor = novo === 'svetla' ? 'rgba(38,35,27,0.45)' : 'rgba(255,255,255,0.7)';
    };
    // Merenje najviše jednom po frejmu
    var zakazano = false;
    var naScroll = function () {
      if (zakazano) return;
      zakazano = true;
      requestAnimationFrame(function () { zakazano = false; proveriNav(); });
    };
    window.addEventListener('scroll', naScroll, { passive: true });
    window.addEventListener('resize', naScroll);
    proveriNav();
  }

  // Meni na telefonu
  var menuBtn = document.getElementById('nav-menu');
  var linkovi = document.getElementById('nav-linkovi');
  if (nav && menuBtn && linkovi) {
    var postavi = function (otvoren) {
      nav.setAttribute('data-open', String(otvoren));
      menuBtn.setAttribute('aria-expanded', String(otvoren));
    };
    menuBtn.addEventListener('click', function () {
      postavi(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    linkovi.addEventListener('click', function (e) {
      if (e.target.closest('a')) postavi(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        postavi(false);
        menuBtn.focus();
      }
    });
  }

  // Kalkulator okvirne cene (cene po m² su primer, zameniti cenama firme)
  var CENE = { siva: [320, 450, 'Siva faza'], kljuc: [530, 690, 'Ključ u ruke'] };
  var range = document.getElementById('kvadratura');
  var dugmad = document.querySelectorAll('[data-nivo]');
  if (range && dugmad.length) {
    var nivo = 'siva';
    var fmt = function (v) { return new Intl.NumberFormat('sr-RS').format(Math.round(v / 100) * 100); };
    var upisi = function (k, v) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-calc="' + k + '"]'), function (el) { el.textContent = v; });
    };
    var racunaj = function () {
      var m2 = Number(range.value);
      var c = CENE[nivo];
      upisi('m2', m2);
      range.setAttribute('aria-valuetext', m2 + ' m²');
      upisi('cenaOd', fmt(c[0] * m2));
      upisi('cenaDo', fmt(c[1] * m2));
      upisi('cenaM2', c[0] + '–' + c[1]);
      upisi('nivoNaziv', c[2]);
      Array.prototype.forEach.call(dugmad, function (b) {
        var on = b.getAttribute('data-nivo') === nivo;
        b.setAttribute('aria-pressed', String(on));
        b.style.borderColor = on ? '#d9a05b' : '#cfbe9f';
        b.style.background = on ? '#ffffff' : 'transparent';
      });
    };
    Array.prototype.forEach.call(dugmad, function (b) {
      b.addEventListener('click', function () { nivo = b.getAttribute('data-nivo'); racunaj(); });
    });
    range.addEventListener('input', racunaj);
    racunaj();
  }

  // Forma za upit
  var form = document.getElementById('forma');
  var msg = document.getElementById('forma-msg');
  if (!form || !msg) return;
  var btn = form.querySelector('button[type=submit]');
  var label = btn.textContent;
  var PHONE = '064 252 45 62';

  var rules = {
    ime: { ok: function (el) { return el.value.trim().length > 1; }, text: 'Upiši ime.' },
    telefon: { ok: function (el) { return el.value.replace(/\D/g, '').length >= 8; }, text: 'Upiši broj telefona, npr. 064 123 4567.' },
    saglasnost: { ok: function (el) { return el.checked; }, text: 'Potvrdi saglasnost da bismo ti se javili.' }
  };

  function say(text) {
    msg.textContent = text;
    msg.hidden = !text;
  }

  // Greška stoji odmah ispod polja (#err-ime, #err-telefon, #err-saglasnost)
  function setError(name, text) {
    var el = form.elements[name];
    var out = document.getElementById('err-' + name);
    if (text) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    if (out) { out.textContent = text || ''; out.hidden = !text; }
  }

  // Greška nestaje čim osoba ispravi polje
  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name];
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      if (rules[name].ok(el)) setError(name, '');
    });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    say('');
    var first = null;
    Object.keys(rules).forEach(function (name) {
      var el = form.elements[name];
      var ok = rules[name].ok(el);
      setError(name, ok ? '' : rules[name].text);
      if (!ok && !first) first = el;
    });
    if (first) { first.focus(); return; }

    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) {
      say('Ovo je koncept za pregled: forma još nije povezana sa prijemom upita. Pozovi ' + PHONE + '.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Slanje…';
    fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        say('Hvala! Javljamo ti se sa okvirnom cenom.');
      })
      .catch(function () {
        say('Slanje nije uspelo. Pokušaj ponovo ili pozovi ' + PHONE + '.');
      })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  });
})();
