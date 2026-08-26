(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;

  /* ---------------- Theme toggle ---------------- */
  var themeToggle = document.getElementById('themeToggle');
  var savedTheme = localStorage.getItem('mtmera-theme');
  if (savedTheme) html.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', function () {
    var current = html.getAttribute('data-theme') || 'light';
    var next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mtmera-theme', next);
  });

  /* ---------------- Language toggle ---------------- */
  var langToggle = document.getElementById('langToggle');
  var metaTitle = {
    en: 'MTMERA — Software · Cloud · Hosting',
    ar: 'MTMERA — سوفت وير · سحابة · استضافة'
  };
  var metaDesc = {
    en: 'MTMERA — software development, cloud solutions and hosting services.',
    ar: 'MTMERA — تطوير البرمجيات، الحلول السحابية، وخدمات الاستضافة.'
  };

  function setLang(lang) {
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.title = metaTitle[lang];
    var descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute('content', metaDesc[lang]);
    localStorage.setItem('mtmera-lang', lang);
  }

  var savedLang = localStorage.getItem('mtmera-lang');
  if (savedLang) setLang(savedLang);

  langToggle.addEventListener('click', function () {
    var current = html.getAttribute('lang');
    var next = current === 'ar' ? 'en' : 'ar';
    var body = document.body;
    body.style.transition = 'opacity 160ms ease';
    body.style.opacity = '0.35';
    setTimeout(function () {
      setLang(next);
      body.style.opacity = '1';
    }, 160);
  });

  /* ---------------- Header scroll state ---------------- */
  var header = document.getElementById('siteHeader');
  var backTop = document.getElementById('backTop');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', y > 30);
    backTop.classList.toggle('show', y > 500);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------------- Mobile nav ---------------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');
  var navScrim = document.getElementById('navScrim');

  function closeMenu() {
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    navScrim.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openMenu() {
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    navScrim.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  menuToggle.addEventListener('click', function () {
    if (mobileNav.classList.contains('open')) closeMenu(); else openMenu();
  });
  navScrim.addEventListener('click', closeMenu);
  mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------- Smooth anchor scroll (accounts for fixed header) ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var headerH = header.offsetHeight;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------------- Marquee: duplicate content for seamless loop ---------------- */
  var marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  /* ---------------- Hero canvas particle network ---------------- */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var raf;
    var running = true;

    function resize() {
      var hero = canvas.closest('.hero');
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
      var count = Math.min(60, Math.floor((canvas.width * canvas.height) / 26000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.8
        });
      }
    }

    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var maxDist = 140;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.strokeStyle = 'rgba(46,196,182,' + (0.16 * (1 - dist / maxDist)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (var k = 0; k < particles.length; k++) {
        var pt = particles[k];
        ctx.fillStyle = 'rgba(47,147,194,0.5)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        running = entry.isIntersecting;
        if (running && !raf) tick();
        if (!running && raf) { cancelAnimationFrame(raf); raf = null; }
      });
    }, { threshold: 0.05 });

    resize();
    tick();
    io.observe(canvas);
    window.addEventListener('resize', resize);
  }

  /* ---------------- GSAP scroll reveals ---------------- */
  if (window.gsap && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 26 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' }
        }
      );
    });

    gsap.utils.toArray('.services-grid, .why-grid').forEach(function (grid) {
      gsap.fromTo(grid.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.09,
          scrollTrigger: { trigger: grid, start: 'top 85%' }
        }
      );
    });

    gsap.fromTo('.process-grid .process-step',
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.12,
        scrollTrigger: { trigger: '.process-track', start: 'top 82%' }
      }
    );

    var fill = document.getElementById('processFill');
    if (fill) {
      gsap.to(fill, {
        width: '100%', ease: 'none',
        scrollTrigger: { trigger: '.process-track', start: 'top 70%', end: 'bottom 70%', scrub: 0.6 }
      });
    }

    gsap.fromTo('.hero h1', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.1 });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '1';
    });
  }

  /* ---------------- Contact form (WhatsApp handoff) ---------------- */
  var form = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  var isAr = function () { return html.getAttribute('lang') === 'ar'; };

  var errors = {
    required: { en: 'This field is required.', ar: 'هذا الحقل مطلوب.' },
    email: { en: 'Enter a valid email address.', ar: 'أدخل بريدًا إلكترونيًا صحيحًا.' }
  };

  function validateField(field) {
    var input = field.querySelector('input, textarea');
    var errorEl = field.querySelector('.error-msg');
    var lang = isAr() ? 'ar' : 'en';
    field.classList.remove('has-error');
    errorEl.textContent = '';

    if (!input.value.trim()) {
      field.classList.add('has-error');
      errorEl.textContent = errors.required[lang];
      return false;
    }
    if (input.type === 'email') {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(input.value.trim())) {
        field.classList.add('has-error');
        errorEl.textContent = errors.email[lang];
        return false;
      }
    }
    return true;
  }

  if (form) {
    form.querySelectorAll('.field').forEach(function (field) {
      var input = field.querySelector('input, textarea');
      input.addEventListener('blur', function () { validateField(field); });
      input.addEventListener('input', function () {
        if (field.classList.contains('has-error')) validateField(field);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('.field');
      var valid = true;
      fields.forEach(function (field) { if (!validateField(field)) valid = false; });
      if (!valid) return;

      var name = form.querySelector('#fName').value.trim();
      var email = form.querySelector('#fEmail').value.trim();
      var subject = form.querySelector('#fSubject').value.trim();
      var message = form.querySelector('#fMessage').value.trim();

      var lines = [
        (isAr() ? 'الاسم' : 'Name') + ': ' + name,
        (isAr() ? 'البريد الإلكتروني' : 'Email') + ': ' + email,
        (isAr() ? 'الخدمة/الموضوع' : 'Service / Subject') + ': ' + subject,
        '',
        message
      ];

      var waText = encodeURIComponent(lines.join('\n'));
      window.open('https://wa.me/201142006128?text=' + waText, '_blank', 'noopener');

      formSuccess.classList.add('show');
      setTimeout(function () { formSuccess.classList.remove('show'); }, 6000);
      form.reset();
    });
  }

  /* ---------------- Service cards: request this service via WhatsApp form ---------------- */
  document.querySelectorAll('.service-card[data-service-en]').forEach(function (card) {
    function requestService() {
      var subjectField = document.getElementById('fSubject');
      var messageField = document.getElementById('fMessage');
      if (subjectField) {
        subjectField.value = isAr() ? card.getAttribute('data-service-ar') : card.getAttribute('data-service-en');
      }
      var contactTarget = document.getElementById('contact');
      if (contactTarget) {
        var headerH = header.offsetHeight;
        var top = contactTarget.getBoundingClientRect().top + window.pageYOffset - headerH + 1;
        window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      if (messageField) {
        setTimeout(function () { messageField.focus(); }, reduceMotion ? 0 : 500);
      }
    }
    card.addEventListener('click', requestService);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        requestService();
      }
    });
  });
})();
