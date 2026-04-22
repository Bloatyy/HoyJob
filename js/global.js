/* ============================================
   GLOBAL JS — Auth helpers, api helpers, nav
   ============================================ */

const API_BASE = 'http://localhost:5000/api';

// --- Auth Helpers ---
function getToken() {
  return localStorage.getItem('hj_token');
}

function setToken(token) {
  localStorage.setItem('hj_token', token);
}

function getUser() {
  const u = localStorage.getItem('hj_user');
  return u ? JSON.parse(u) : null;
}

function setUser(user) {
  localStorage.setItem('hj_user', JSON.stringify(user));
}

function isLoggedIn() {
  return !!getToken();
}

function logout() {
  localStorage.removeItem('hj_token');
  localStorage.removeItem('hj_user');
  window.location.href = getBasePath() + 'index.html';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = getBasePath() + 'pages/login.html';
    return false;
  }
  return true;
}

// --- API Helpers ---
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.msg || data.error || 'Something went wrong');
  }

  return data;
}

// --- Path helpers ---
function getBasePath() {
  return window.location.pathname.includes('/pages/') ? '../' : './';
}

function pagePath(page) {
  return getBasePath() + 'pages/' + page;
}

// --- Nav Builder ---
function buildNav() {
  const user = getUser();
  const base = getBasePath();
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const path = window.location.pathname;

  if (!user) {
    nav.innerHTML = `
      <a href="${base}index.html" class="logo">
        <div class="logo-oval">
          <div class="logo-h">H</div>
          <span>HoyJob</span>
        </div>
      </a>
      <div class="nav-links">
        <a href="${base}index.html#about" class="${path.includes('index.html') ? 'active' : ''}">About</a>
        <a href="${base}index.html#how">How it Works</a>
        <a href="${base}pages/jobs.html" class="${path.includes('jobs.html') ? 'active' : ''}">Marketplace</a>
      </div>
      <div class="nav-actions">
        <a href="${base}pages/login.html" style="font-size:0.85rem; font-weight:500; color:#666;">Log In</a>
        <a href="${base}pages/signup.html" class="btn btn-primary btn-sm">Join HoyJob</a>
      </div>`;
  } else {
    const dashboardLink = user.role === 'recruiter' ? 'recruiter-dashboard.html' : 'agent-dashboard.html';
    const initials = user.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U';
    
    nav.innerHTML = `
      <a href="${base}pages/${dashboardLink}" class="logo">
        <div class="logo-oval">
          <div class="logo-h">H</div>
          <span>HoyJob</span>
        </div>
      </a>
      <div class="nav-links">
        <a href="${base}pages/${dashboardLink}" class="${path.includes('dashboard.html') ? 'active' : ''}">Console</a>
        <a href="${base}pages/jobs.html" class="${path.includes('jobs.html') ? 'active' : ''}">${user.role === 'recruiter' ? 'Candidates' : 'Marketplace'}</a>
        <a href="${base}pages/chat.html" class="${path.includes('chat.html') ? 'active' : ''}">Inbox</a>
      </div>
      <div class="nav-actions">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <a href="${base}pages/profile.html" class="avatar">${initials}</a>
          <button onclick="logout()" class="btn btn-ghost btn-sm">Log Out</button>
        </div>
      </div>`;
  }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
});
