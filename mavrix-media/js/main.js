/* ============================================================
   MAVRIX MEDIA — main.js
   General interaction layer.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var isTouch = window.matchMedia('(hover:none)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Custom cursor ---- */
  if (!isTouch) {
    var dot = $('.cursor-dot'), ring = $('.cursor-ring');
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    var hov = 'a,button,.btn,.svc-card,.aud-card,.fw-step,.tst,.play,.handle,input,select,textarea,.eco-node,.cs-card';
    $$(hov).forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('active'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('active'); });
    });
  }

  /* ---- Magnetic buttons ---- */
  if (!isTouch) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.25 + 'px,' +
          (e.clientY - r.top - r.height / 2) * 0.4 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---- Nav scroll state + sticky CTA ---- */
  var nav = $('.nav'), sticky = $('#stickyCta');
  addEventListener('scroll', function () {
    var y = scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (sticky) sticky.classList.toggle('show', y > 700);
  }, { passive: true });

  /* ---- Mobile menu ---- */
  var burger = $('#burger'), mm = $('#mobileMenu');
  if (burger) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open'); mm.classList.toggle('open');
    });
    $$('a', mm).forEach(function (a) {
      a.addEventListener('click', function () { burger.classList.remove('open'); mm.classList.remove('open'); });
    });
  }

  /* ---- Reveal on scroll ---- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.16 });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* ---- Service card spotlight ---- */
  $$('.svc-card').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---- Animated counters ---- */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, target = parseFloat(el.dataset.count), suf = el.dataset.suffix || '';
      var dec = target % 1 !== 0 ? 1 : 0, dur = 1600, t0 = performance.now();
      (function tick(t) {
        var p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---- Parallax (blobs + hero) ---- */
  if (!reduce) {
    var plx = $$('[data-depth]'), ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        var y = scrollY;
        plx.forEach(function (el) { el.style.transform = 'translate3d(0,' + (y * parseFloat(el.dataset.depth)) + 'px,0)'; });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Before / After slider ---- */
  $$('[data-ba]').forEach(function (ba) {
    var before = $('.before', ba), handle = $('.handle', ba), inner = $('.before .inner', ba);
    var dragging = false;
    function set(p) {
      p = Math.max(2, Math.min(98, p));
      before.style.width = p + '%'; handle.style.left = p + '%';
      inner.style.width = (100 / p * 100) + '%';
    }
    function fromEvent(e) {
      var r = ba.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      set(x / r.width * 100);
    }
    handle.addEventListener('mousedown', function () { dragging = true; });
    handle.addEventListener('touchstart', function () { dragging = true; }, { passive: true });
    addEventListener('mouseup', function () { dragging = false; });
    addEventListener('touchend', function () { dragging = false; });
    addEventListener('mousemove', function (e) { if (dragging) fromEvent(e); });
    addEventListener('touchmove', function (e) { if (dragging) fromEvent(e); }, { passive: true });
    ba.addEventListener('click', function (e) { if (e.target.closest('.handle')) return; fromEvent(e); });
    set(50);
  });

  /* ---- Booking form (front-end validation + success state) ---- */
  var submit = $('#bookSubmit'), form = $('#bookForm'), ok = $('#formOk');
  if (submit) {
    submit.addEventListener('click', function () {
      var name = $('[name=name]', form), email = $('[name=email]', form), valid = true;
      [name, email].forEach(function (f) {
        if (!f.value.trim()) { f.style.borderColor = '#ff6b6b'; valid = false; } else f.style.borderColor = '';
      });
      if (email.value && !/^\S+@\S+\.\S+$/.test(email.value)) { email.style.borderColor = '#ff6b6b'; valid = false; }
      if (!valid) return;
      /* TODO: POST these values to your CRM / email endpoint here */
      form.style.display = 'none';
      ok.classList.add('show');
    });
  }

  /* ---- Smooth anchor scroll with nav offset ---- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' });
    });
  });
})();
