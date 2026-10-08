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

  function say(text, kind) {
    msg.textContent = text;
    msg.className = 'form__msg ' + (kind || '');
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    say('', '');

    var bad = [];
    ['ime', 'telefon', 'mesto'].forEach(function (n) {
      var el = form.elements[n];
      var ok = el.value.trim().length > 1;
      if (n === 'telefon') ok = el.value.replace(/\D/g, '').length >= 8;
      el.classList.toggle('err', !ok);
      if (!ok) bad.push(el);
    });
    if (!form.elements.saglasnost.checked) bad.push(form.elements.saglasnost);
    if (bad.length) {
      say('Proveri ime, telefon, mesto i saglasnost.', 'is-err');
      bad[0].focus();
      return;
    }
    if (form.elements.website.value) return; // honeypot

    var endpoint = form.getAttribute('data-endpoint');
    if (!endpoint) {
      say('Ovo je koncept za pregled: forma još nije povezana sa prijemom upita. Pozovi 064 252 45 62.', 'is-info');
      return;
    }

    var data = new FormData(form);
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        say('Hvala! Javljamo ti se u vezi okvirne ponude.', 'is-info');
      })
      .catch(function () {
        say('Slanje nije uspelo. Pozovi 064 252 45 62.', 'is-err');
      })
      .then(function () { btn.disabled = false; });
  });
})();
