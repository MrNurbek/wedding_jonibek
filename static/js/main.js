'use strict';

/* =============================================
   PARTICLE / YULDUZLAR ANIMATSIYASI
   ============================================= */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], rafId = null, active = true;

  const isMobile = window.innerWidth <= 640;
  const COUNT = isMobile ? 50 : 120;

  function resize() {
    W = canvas.width = canvas.offsetWidth || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }

  function Star() { this.reset(); }
  Star.prototype.reset = function () {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.4 + 0.3;
    this.alpha = Math.random() * 0.6 + 0.1;
    this.speed = Math.random() * 0.25 + 0.05;
    this.pulse = Math.random() * Math.PI * 2;
  };

  function init() {
    resize();
    stars = Array.from({ length: COUNT }, () => new Star());
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, W, H);
    const now = Date.now() / 1000;
    stars.forEach(s => {
      s.pulse += 0.018;
      const a = s.alpha * (0.5 + 0.5 * Math.sin(s.pulse));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${a})`;
      ctx.fill();
      s.y -= s.speed;
      s.x += Math.sin(now + s.pulse) * 0.15;
      if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
    });
    rafId = requestAnimationFrame(draw);
  }

  /* Cover yopilganda animatsiyani to'xtat */
  const observer = new MutationObserver(() => {
    const cover = document.getElementById('cover');
    if (cover && cover.style.display === 'none') {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    }
  });
  const cover = document.getElementById('cover');
  if (cover) observer.observe(cover, { attributes: true, attributeFilter: ['style'] });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      active = false;
      if (rafId) cancelAnimationFrame(rafId);
    } else if (cover && cover.style.display !== 'none') {
      active = true;
      draw();
    }
  });

  window.addEventListener('resize', resize, { passive: true });
  init();
  draw();
})();

/* =============================================
   UNLOCK SLIDER
   ============================================= */
(function () {
  const cover = document.getElementById('cover');
  const flash = document.getElementById('cover-flash');
  const track = document.getElementById('unlock-track');
  const handle = document.getElementById('unlock-handle');
  const fill = document.getElementById('unlock-fill');
  if (!cover || !track || !handle) return;

  let dragging = false;
  let startX = 0;
  let currentX = 0;

  const maxDrag = () => track.offsetWidth - handle.offsetWidth - 8;

  function setPos(x) {
    const max = maxDrag();
    x = Math.max(0, Math.min(x, max));
    handle.style.left = (4 + x) + 'px';
    fill.style.width = (56 + x) + 'px';

    if (x >= max * 0.9) unlock();
  }

  function unlock() {
    if (!cover.classList.contains('unlocking')) {
      cover.classList.add('unlocking');
      startMusic(); /* ochish harakatining o'zida musiqani boshlaymiz */
      flash.classList.add('active');
      setTimeout(() => {
        flash.classList.remove('active');
        cover.style.transition = 'opacity 0.8s ease';
        cover.style.opacity = '0';
        setTimeout(() => {
          cover.style.display = 'none';
          document.querySelectorAll('.locked-hidden').forEach(el => {
            el.classList.remove('locked-hidden');
          });
          startMusic();
          setTimeout(function() {
            if (typeof window.parallaxTick === 'function') window.parallaxTick();
          }, 100);
        }, 800);
      }, 300);
    }
  }

  /* Slayder ushlangan zahoti musiqani boshlashga urinamiz —
     ochish knopkasiga bevosita bog'langan */
  handle.addEventListener('mousedown', e => { dragging = true; startX = e.clientX - currentX; startMusic(); });
  handle.addEventListener('touchstart', e => { dragging = true; startX = e.touches[0].clientX - currentX; startMusic(); }, { passive: true });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    currentX = e.clientX - startX;
    setPos(currentX);
  });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    currentX = e.touches[0].clientX - startX;
    setPos(currentX);
  }, { passive: true });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    /* Slayder ochilgan bo'lsa — musiqani haqiqiy teginish ichida boshlaymiz */
    if (cover.classList.contains('unlocking')) startMusic();
    if (currentX < maxDrag() * 0.9) {
      currentX = 0;
      handle.style.transition = 'left 0.3s ease';
      fill.style.transition = 'width 0.3s ease';
      setPos(0);
      setTimeout(() => {
        handle.style.transition = '';
        fill.style.transition = '';
      }, 300);
    }
  });

  document.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    /* Telefonda: barmoq ko'tarilgan zahoti — teginish ruxsati ichida — musiqa boshlanadi */
    if (cover.classList.contains('unlocking')) startMusic();
    if (currentX < maxDrag() * 0.9) {
      currentX = 0;
      handle.style.transition = 'left 0.3s ease';
      fill.style.transition = 'width 0.3s ease';
      setPos(0);
      setTimeout(() => {
        handle.style.transition = '';
        fill.style.transition = '';
      }, 300);
    }
  });
})();

/* =============================================
   MUSIQA
   ============================================= */
let _audio = null;
let musicPlaying = false;

function updateMusicBtn() {
  const btn = document.getElementById('music-btn');
  if (!btn) return;
  btn.textContent = musicPlaying ? '♫' : '♪';
  btn.classList.toggle('playing', musicPlaying);
}

let _userStopped = false; /* foydalanuvchi tugma orqali o'zi to'xtatgan */

document.addEventListener('DOMContentLoaded', () => {
  _audio = document.getElementById('bg-music');
  if (!_audio) return;
  _audio.loop = true;
  _audio.volume = 0.35;

  const btn = document.getElementById('music-btn');

  function removeGestureListeners() {
    document.removeEventListener('touchstart',  onGesture);
    document.removeEventListener('touchmove',   onGesture);
    document.removeEventListener('touchend',    onGesture);
    document.removeEventListener('pointerdown', onGesture);
    document.removeEventListener('pointerup',   onGesture);
    document.removeEventListener('click',       onGesture);
    window.removeEventListener('scroll',        onGesture);
  }

  /* Har qanday birinchi harakatda (tegish, surish, scroll) musiqani
     ovoz bilan yoqishga urinamiz. Brauzer ba'zi hodisalarda ruxsat
     bermasligi mumkin — shuning uchun ovoz HAQIQATAN chiqqanini
     tekshiramiz; chiqmagan bo'lsa ovozsiz rejimga qaytarib, keyingi
     harakatda yana urinamiz. */
  function onGesture(e) {
    if (_userStopped) { removeGestureListeners(); return; }
    if (musicPlaying) { removeGestureListeners(); return; }
    /* Musiqa tugmasining o'zi bosilsa — uni btn handler boshqaradi */
    if (btn && e && e.target && e.target.nodeType === 1 && btn.contains(e.target)) return;

    _audio.muted = false;
    _audio.volume = 0.35;
    const p = _audio.play();
    if (p && p.then) p.then(() => {}).catch(() => {});

    /* Ovoz chindan ochildimi — biroz kutib tekshiramiz */
    setTimeout(() => {
      if (musicPlaying || _userStopped) return;
      if (!_audio.paused && !_audio.muted) {
        musicPlaying = true;
        updateMusicBtn();
        removeGestureListeners();
      } else {
        /* Brauzer bu hodisada ruxsat bermadi — ovozsiz davom etamiz,
           keyingi teginish/scrollda qayta urinamiz */
        _audio.muted = true;
        _audio.play().catch(() => {});
      }
    }, 250);
  }

  /* Tinglovchilarni DARHOL ulaymiz (autoplay natijasini kutmasdan) —
     har qanday birinchi harakatda musiqa yoqiladi: barmoq tekkanda
     (touchstart/pointerdown), surganda va scrollda (touchmove/scroll),
     ko'tarilganda (touchend/pointerup/click). Qaysi biri brauzerda
     ruxsat etilsa, o'sha ishlaydi. */
  document.addEventListener('touchstart',  onGesture, { passive: true });
  document.addEventListener('touchmove',   onGesture, { passive: true });
  document.addEventListener('touchend',    onGesture, { passive: true });
  document.addEventListener('pointerdown', onGesture);
  document.addEventListener('pointerup',   onGesture);
  document.addEventListener('click',       onGesture);
  window.addEventListener('scroll',        onGesture, { passive: true });

  /* ?noauto=1 — telefon holatini kompyuterda sinash uchun:
     ovozli autoplay o'tkazib yuboriladi */
  const noAuto = /[?&]noauto/.test(location.search);

  function mutedFallback() {
    /* Ovozli autoplay bloklangan — musiqani OVOZSIZ boshlab
       qo'yamiz (bunga brauzerlar ruxsat beradi). Birinchi
       teginishda onGesture faqat ovozini ochadi — eng tez usul. */
    _audio.muted = true;
    _audio.play().catch(() => {});
  }

  if (noAuto) {
    mutedFallback();
  } else {
    /* 1) Ovoz bilan autoplay — kompyuterda ishlaydi */
    _audio.muted = false;
    _audio.play().then(() => {
      musicPlaying = true;
      updateMusicBtn();
      removeGestureListeners();
    }).catch(mutedFallback);
  }

  /* Musiqa tugmasi — play / pause */
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    removeGestureListeners(); /* foydalanuvchi endi o'zi boshqaradi */
    if (_audio.paused || _audio.muted) {
      /* Ovozsiz yoki to'xtagan — yoqamiz */
      _userStopped = false;
      _audio.muted = false;
      if (_audio.paused) {
        _audio.play().then(() => { musicPlaying = true; updateMusicBtn(); }).catch(() => {});
      } else {
        musicPlaying = true;
      }
    } else {
      _audio.pause();
      musicPlaying = false;
      _userStopped = true;
    }
    updateMusicBtn();
  });
});

/* unlock dan keyin ham chaqirilishi uchun export.
   toy-taklifnoma dagi playAudio() bilan bir xil: gesture ichida
   chaqirilganda ovozni ochib, to'g'ridan-to'g'ri play() qiladi. */
function startMusic() {
  if (!_audio || _userStopped) return;
  _audio.muted = false;
  _audio.volume = 0.35;
  if (_audio.paused) {
    _audio.play().then(() => {
      musicPlaying = true;
      updateMusicBtn();
    }).catch(() => {});
  } else {
    /* Ovozsiz chalinayotgan edi — ovozi ochildi */
    musicPlaying = true;
    updateMusicBtn();
  }
}

/* =============================================
   NAV SCROLL
   ============================================= */
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* =============================================
   STICKY CTA
   ============================================= */
(function () {
  const cta = document.getElementById('sticky-cta');
  if (!cta) return;
  window.addEventListener('scroll', () => {
    cta.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
})();

/* =============================================
   COUNTDOWN
   ============================================= */
(function () {
  const isoEl = document.getElementById('wedding-date-iso');
  if (!isoEl) return;
  const target = new Date(isoEl.value);

  const els = {
    d: document.getElementById('cd-days'),
    h: document.getElementById('cd-hours'),
    m: document.getElementById('cd-mins'),
    s: document.getElementById('cd-secs'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      if (els.d) { els.d.textContent = '00'; els.h.textContent = '00'; els.m.textContent = '00'; els.s.textContent = '00'; }
      return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    const secs  = Math.floor((diff % 60000) / 1000);

    if (els.d) els.d.textContent = pad(days);
    if (els.h) els.h.textContent = pad(hours);
    if (els.m) els.m.textContent = pad(mins);
    if (els.s) els.s.textContent = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
})();

/* =============================================
   SCROLL REVEAL
   ============================================= */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .program-item').forEach(el => {
    observer.observe(el);
  });
})();

/* =============================================
   RSVP FORMA
   ============================================= */
(function () {
  let guestCount = 1;
  let rsvpStatus = 'yes';

  const countDisplay = document.getElementById('count-display');
  const btnMinus = document.getElementById('btn-minus');
  const btnPlus  = document.getElementById('btn-plus');

  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      if (guestCount > 1) { guestCount--; countDisplay.textContent = guestCount; }
    });
  }
  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      if (guestCount < 5) { guestCount++; countDisplay.textContent = guestCount; }
    });
  }

  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      rsvpStatus = btn.dataset.value;
      document.querySelectorAll('.status-btn').forEach(b => {
        b.classList.remove('active-yes', 'active-no');
      });
      btn.classList.add(rsvpStatus === 'yes' ? 'active-yes' : 'active-no');
    });
  });

  const form = document.getElementById('rsvp-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value.trim();
    const message = document.getElementById('rsvp-message').value.trim();
    const submitBtn = document.getElementById('rsvp-submit');

    if (!name) { alert("Iltimos, ismingizni kiriting."); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Yuborilmoqda...';

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
      const res = await fetch('/rsvp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf,
        },
        body: JSON.stringify({ name, guest_count: guestCount, status: rsvpStatus, message }),
      });

      const data = await res.json();

      if (data.success) {
        document.getElementById('success-modal').classList.add('show');
        updateStats(data);
        updateTable({ name, guest_count: guestCount, status: rsvpStatus, message });
        form.reset();
        guestCount = 1;
        if (countDisplay) countDisplay.textContent = '1';
        document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active-yes','active-no'));
        document.querySelector('.status-btn[data-value="yes"]')?.classList.add('active-yes');
      } else {
        alert('Xatolik: ' + (data.error || 'Qayta urinib ko\'ring'));
      }
    } catch (err) {
      alert('Tarmoq xatosi. Qayta urinib ko\'ring.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Javobni Yuborish';
    }
  });

  function updateStats(data) {
    const total = document.getElementById('stat-total');
    const yes   = document.getElementById('stat-yes');
    const no    = document.getElementById('stat-no');
    if (total) total.textContent = data.total;
    if (yes)   yes.textContent   = data.yes_count;
    if (no)    no.textContent    = data.no_count;
  }

  function updateTable(row) {
    const tbody = document.getElementById('guests-tbody');
    if (!tbody) return;
    const badge = row.status === 'yes'
      ? '<span class="badge badge-yes">Keladi</span>'
      : '<span class="badge badge-no">Kela olmaydi</span>';

    const safeName = row.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeMsg  = (row.message || '—').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${safeName}</td><td>${row.guest_count}</td><td>${badge}</td><td>${safeMsg}</td>`;
    tbody.prepend(tr);
  }

  document.getElementById('modal-close')?.addEventListener('click', () => {
    document.getElementById('success-modal').classList.remove('show');
  });
})();

