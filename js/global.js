/* ============================================
   GLOBAL JS — Auth helpers, nav, demo data
   ============================================ */

// --- Demo Data (seeded on first visit) ---
function seedDemoData() {
  if (localStorage.getItem('hj_seeded')) return;

  const jobs = [
    { id: 1, title: 'Sales Agent – Mumbai', company: 'FinServe Inc.', location: 'Mumbai', type: 'Full-time', experience: '1-3 yrs', salary: '₹25k–₹40k/mo', skills: ['Sales', 'Communication', 'CRM'], description: 'Looking for an energetic sales agent to drive customer acquisition in the Mumbai region.', posted: '2026-04-15', recruiter: 'recruiter@demo.com' },
    { id: 2, title: 'Insurance Field Agent', company: 'SafeGuard Life', location: 'Delhi', type: 'Full-time', experience: '2-5 yrs', salary: '₹30k–₹50k/mo', skills: ['Insurance', 'Field Sales', 'Negotiation'], description: 'Join our field team to sell life and health insurance products door-to-door.', posted: '2026-04-16', recruiter: 'recruiter@demo.com' },
    { id: 3, title: 'Freelance Lead Generator', company: 'GrowthBox', location: 'Remote', type: 'Freelance', experience: '0-2 yrs', salary: '₹15k–₹25k/mo', skills: ['Lead Generation', 'Cold Calling', 'Excel'], description: 'Generate qualified leads for our B2B SaaS product. Work from anywhere.', posted: '2026-04-17', recruiter: 'recruiter@demo.com' },
    { id: 4, title: 'Customer Acquisition Agent', company: 'QuickPay', location: 'Bangalore', type: 'Full-time', experience: '1-3 yrs', salary: '₹20k–₹35k/mo', skills: ['Sales', 'Fintech', 'Pitching'], description: 'Help onboard merchants onto our payment platform across Bangalore.', posted: '2026-04-18', recruiter: 'recruiter@demo.com' },
    { id: 5, title: 'Real Estate Agent', company: 'HomeConnect', location: 'Pune', type: 'Contract', experience: '3-5 yrs', salary: '₹35k–₹60k/mo', skills: ['Real Estate', 'Negotiation', 'Networking'], description: 'Connect buyers and sellers in the Pune residential market.', posted: '2026-04-19', recruiter: 'recruiter@demo.com' },
    { id: 6, title: 'Telemarketing Agent', company: 'BrightCall', location: 'Hyderabad', type: 'Part-time', experience: '0-1 yr', salary: '₹10k–₹18k/mo', skills: ['Communication', 'Telemarketing', 'Data Entry'], description: 'Make outbound calls to potential customers and log interactions.', posted: '2026-04-19', recruiter: 'recruiter@demo.com' }
  ];

  const agents = [
    { name: 'Ravi Kumar', email: 'ravi@demo.com', skills: ['Sales', 'CRM', 'Negotiation'], location: 'Mumbai', experience: '3 years', rating: 4.5, verified: true, status: 'active' },
    { name: 'Priya Sharma', email: 'priya@demo.com', skills: ['Insurance', 'Field Sales', 'Communication'], location: 'Delhi', experience: '5 years', rating: 4.8, verified: true, status: 'active' },
    { name: 'Amit Patel', email: 'amit@demo.com', skills: ['Lead Generation', 'Cold Calling', 'Excel'], location: 'Remote', experience: '1 year', rating: 4.0, verified: false, status: 'active' }
  ];

  const messages = [
    { id: 1, from: 'recruiter@demo.com', to: 'agent@demo.com', fromName: 'FinServe Inc.', toName: 'You', text: 'Hi! We liked your profile. Are you available for an interview?', time: '10:30 AM' },
    { id: 2, from: 'agent@demo.com', to: 'recruiter@demo.com', fromName: 'You', toName: 'FinServe Inc.', text: 'Yes, I am available. When works for you?', time: '10:45 AM' },
    { id: 3, from: 'recruiter@demo.com', to: 'agent@demo.com', fromName: 'FinServe Inc.', toName: 'You', text: 'How about tomorrow at 3 PM? We can do a video call.', time: '11:00 AM' },
    { id: 4, from: 'agent@demo.com', to: 'recruiter@demo.com', fromName: 'You', toName: 'FinServe Inc.', text: 'Sounds good! Looking forward to it.', time: '11:05 AM' }
  ];

  const applications = [
    { jobId: 1, agent: 'agent@demo.com', status: 'Shortlisted', date: '2026-04-16' },
    { jobId: 3, agent: 'agent@demo.com', status: 'Applied', date: '2026-04-18' },
    { jobId: 5, agent: 'agent@demo.com', status: 'Interview', date: '2026-04-17' }
  ];

  localStorage.setItem('hj_jobs', JSON.stringify(jobs));
  localStorage.setItem('hj_agents', JSON.stringify(agents));
  localStorage.setItem('hj_messages', JSON.stringify(messages));
  localStorage.setItem('hj_applications', JSON.stringify(applications));
  localStorage.setItem('hj_seeded', 'true');
}

// --- Auth Helpers ---
function getUser() {
  const u = localStorage.getItem('hj_user');
  return u ? JSON.parse(u) : null;
}

function setUser(user) {
  localStorage.setItem('hj_user', JSON.stringify(user));
}

function isLoggedIn() {
  return !!getUser();
}

function logout() {
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
        <div style="background:#000; color:#EFFF00; width:22px; height:22px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.75rem;">H</div>
        HoyJob
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
        <div style="background:#000; color:#EFFF00; width:22px; height:22px; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.75rem;">H</div>
        HoyJob
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
  seedDemoData();
  buildNav();
});
