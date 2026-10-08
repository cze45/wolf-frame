(function () {
  'use strict';

  // Lepljiva traka se sakriva dok je forma na ekranu
  var stick = document.getElementById('stick');
  var upit = document.getElementById('upit');
  if (stick && upit && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      stick.classList.toggle('is-hidden', e[0].isIntersecting);
    }, { threshold: 0.15 }).observe(upit);
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
