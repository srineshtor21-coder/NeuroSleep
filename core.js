// NeuroSleep - Core JavaScript
// Created by Mithil Gajula

// ===== NAV =====
const nav = document.querySelector('nav');
const hamburger = document.querySelector('.nav-hamburger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 20) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Set active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== TABS =====
document.querySelectorAll('.tabs').forEach(tabGroup => {
  tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const container = tabGroup.closest('section') || tabGroup.parentElement;
      container.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('active', p.dataset.panel === target);
      });
    });
  });
});

// ===== NOTIFICATION SYSTEM =====
function showNotification(title, message, icon = '✓') {
  let notif = document.getElementById('ns-notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'ns-notification';
    notif.className = 'notification';
    notif.innerHTML = `<span class="notification-icon"></span><div class="notification-text"><strong></strong><span></span></div>`;
    document.body.appendChild(notif);
  }
  notif.querySelector('.notification-icon').textContent = icon;
  notif.querySelector('strong').textContent = title;
  notif.querySelector('span:last-child').textContent = message;
  notif.classList.add('show');
  clearTimeout(notif._timer);
  notif._timer = setTimeout(() => notif.classList.remove('show'), 3500);
}

// ===== LOCAL STORAGE HELPERS =====
const NS = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem('ns_' + key); return v ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('ns_' + key, JSON.stringify(value)); }
    catch(e) {}
  },
  push(key, item) {
    const arr = this.get(key, []);
    arr.push(item);
    this.set(key, arr);
    return arr;
  }
};

// ===== MODAL SYSTEM =====
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.modal-overlay')?.classList.remove('open'));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
});

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration = 1500, suffix = '') {
  const start = performance.now();
  const from = 0;
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(from + (target - from) * eased);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ===== SLEEP UTILS =====
function calcSleepDuration(bedtime, waketime) {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = waketime.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

function formatHours(h) {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sq = arr.map(x => Math.pow(x - mean, 2));
  return Math.sqrt(sq.reduce((a, b) => a + b, 0) / arr.length);
}

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ===== RISK CALCULATOR =====
function calcRiskScore({ sleepConsistency, sleepDuration, screenTime, cogScore }) {
  let score = 0;
  // Sleep consistency (lower SD is better)
  if (sleepConsistency <= 0.5) score += 0;
  else if (sleepConsistency <= 1) score += 10;
  else if (sleepConsistency <= 1.5) score += 20;
  else score += 35;

  // Sleep duration
  if (sleepDuration >= 7 && sleepDuration <= 9) score += 0;
  else if (sleepDuration >= 6 || sleepDuration <= 10) score += 15;
  else score += 30;

  // Screen time before bed (hours)
  if (screenTime <= 0.5) score += 0;
  else if (screenTime <= 1) score += 10;
  else if (screenTime <= 2) score += 20;
  else score += 30;

  // Cognitive score (0-100)
  if (cogScore >= 80) score += 0;
  else if (cogScore >= 60) score += 5;
  else if (cogScore >= 40) score += 15;
  else score += 25;

  return Math.min(score, 100);
}

function riskLabel(score) {
  if (score <= 20) return { label: 'Low Risk', color: 'green', desc: 'Your current habits show strong alignment with brain-healthy behaviors.' };
  if (score <= 45) return { label: 'Moderate Risk', color: 'yellow', desc: 'Some areas of improvement may help reduce long-term cognitive risk.' };
  if (score <= 70) return { label: 'Elevated Risk', color: 'orange', desc: 'Several behavioral patterns warrant attention and lifestyle adjustments.' };
  return { label: 'High Risk', color: 'red', desc: 'Significant changes in sleep and lifestyle habits are strongly recommended.' };
}

// Export globals
window.NS = NS;
window.showNotification = showNotification;
window.openModal = openModal;
window.closeModal = closeModal;
window.calcSleepDuration = calcSleepDuration;
window.formatHours = formatHours;
window.stdDev = stdDev;
window.mean = mean;
window.calcRiskScore = calcRiskScore;
window.riskLabel = riskLabel;
window.animateCounter = animateCounter;
