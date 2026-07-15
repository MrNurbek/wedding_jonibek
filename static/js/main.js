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
      confirmUnlockMusic();
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
          setTimeout(function() {
            if (typeof window.parallaxTick === 'function') window.parallaxTick();
          }, 100);
        }, 800);
      }, 300);
    }
  }

  function beginDrag(clientX) {
    if (dragging) return;
    dragging = true;
    startX = clientX - currentX;
    startMusic(); /* audio.play() aynan foydalanuvchi hodisasi ichida */
  }

  function moveDrag(clientX) {
    if (!dragging) return;
    currentX = clientX - startX;
    setPos(currentX);
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (currentX >= maxDrag() * 0.9) {
      /* pointerup/touchend ham real gesture: kerak bo'lsa shu zahoti qayta urinadi. */
      confirmUnlockMusic();
      return;
    }

    currentX = 0;
    handle.style.transition = 'left 0.3s ease';
    fill.style.transition = 'width 0.3s ease';
    setPos(0);
    setTimeout(() => {
      handle.style.transition = '';
      fill.style.transition = '';
    }, 300);
  }

  /* Mavjud document-level drag oqimi desktop va mobilda barqaror ishlaydi. */
  handle.addEventListener('mousedown', (e) => beginDrag(e.clientX));
  handle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    beginDrag(e.touches[0].clientX);
  }, { passive: false });

  document.addEventListener('mousemove', (e) => moveDrag(e.clientX));
  document.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    e.preventDefault();
    moveDrag(e.touches[0].clientX);
  }, { passive: false });

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', (e) => {
    if (dragging && e.changedTouches.length) {
      moveDrag(e.changedTouches[0].clientX);
    }
    endDrag();
  });
  document.addEventListener('touchcancel', endDrag);
})();

/* =============================================
   MUSIQA
   ============================================= */
let _audio = document.getElementById('bg-music');
let musicPlaying = false;
let _musicPlayPromise = null;
let _unlockConfirmed = false;
let _musicRetryArmed = false;

function updateMusicBtn() {
  const btn = document.getElementById('music-btn');
  if (!btn) return;
  btn.textContent = musicPlaying ? '♫' : '♪';
  btn.classList.toggle('playing', musicPlaying);
}

let _userStopped = false; /* foydalanuvchi tugma orqali o'zi to'xtatgan */

function initMusicControls() {
  if (!_audio) return;
  _audio.loop = true;
  _audio.volume = 0.35;

  const btn = document.getElementById('music-btn');

  /* Musiqa tugmasi — play / pause */
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (_audio.paused || _audio.muted) {
      /* Ovozsiz yoki to'xtagan — yoqamiz */
      _userStopped = false;
      _audio.muted = false;
      if (_audio.paused) {
        const playPromise = _audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => { musicPlaying = true; updateMusicBtn(); }).catch((error) => {
            console.warn("Musiqani ishga tushirish imkoni bo'lmadi:", error);
          });
        }
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
}

initMusicControls();

/* unlock dan keyin ham chaqirilishi uchun export.
   toy-taklifnoma dagi playAudio() bilan bir xil: gesture ichida
   chaqirilganda ovozni ochib, to'g'ridan-to'g'ri play() qiladi. */
function startMusic() {
  if (!_audio || _userStopped) return;
  if (_musicPlayPromise || !_audio.paused) return;
  _audio.currentTime = 0;
  _audio.muted = false;
  _audio.volume = 0.35;
  const playPromise = _audio.play();
  if (playPromise !== undefined) {
    _musicPlayPromise = playPromise;
    playPromise.then(() => {
      musicPlaying = true;
      updateMusicBtn();
    }).catch((error) => {
      console.warn("Mobil qurilmada musiqa ishga tushmadi:", error);
      armMusicRetry();
    }).finally(() => {
      _musicPlayPromise = null;
    });
  }
}

function confirmUnlockMusic() {
  _unlockConfirmed = true;
  if (!_audio || _userStopped) return;
  if (_audio.paused) startMusic();
}

function armMusicRetry() {
  if (_musicRetryArmed || !_audio || _userStopped) return;
  _musicRetryArmed = true;

  const retryFromGesture = (event) => {
    const musicBtn = document.getElementById('music-btn');
    if (musicBtn && event?.target && musicBtn.contains(event.target)) return;
    document.removeEventListener('pointerdown', retryFromGesture, true);
    document.removeEventListener('touchstart', retryFromGesture, true);
    document.removeEventListener('click', retryFromGesture, true);
    _musicRetryArmed = false;
    startMusic();
  };

  document.addEventListener('pointerdown', retryFromGesture, true);
  document.addEventListener('touchstart', retryFromGesture, { capture: true, passive: true });
  document.addEventListener('click', retryFromGesture, true);
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
