// Dashboard JS — shared logic for agent & recruiter dashboards

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  const user = getUser();
  const page = window.location.pathname;

  // Availability toggle (agent)
  const toggle = document.getElementById('avail-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const label = document.getElementById('avail-label');
      if (label) label.textContent = toggle.classList.contains('active') ? 'Active' : 'Not Looking';
    });
  }

  // Populate agent dashboard
  if (page.includes('agent-dashboard')) {
    loadAgentDashboard();
  }

  // Populate recruiter dashboard
  if (page.includes('recruiter-dashboard')) {
    loadRecruiterDashboard();
  }
});

function loadAgentDashboard() {
  const apps = JSON.parse(localStorage.getItem('hj_applications') || '[]');
  const jobs = JSON.parse(localStorage.getItem('hj_jobs') || '[]');
  const tbody = document.getElementById('apps-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  apps.forEach((app, idx) => {
    const job = jobs.find(j => j.id === app.jobId);
    if (!job) return;
    const statusClass = app.status === 'Shortlisted' ? 'badge-hot' : 'badge-new';
    tbody.innerHTML += `
      <tr>
        <td style="font-weight:600; color:#000;">${job.title}</td>
        <td style="color:#666;">${job.company}</td>
        <td><span class="badge-pill ${statusClass}">${app.status}</span></td>
        <td style="color:#999; font-size:0.75rem;">${app.date}</td>
      </tr>`;
  });

  // Recommended jobs
  const recEl = document.getElementById('rec-jobs');
  if (!recEl) return;
  recEl.innerHTML = '';
  jobs.slice(0, 4).forEach((job, idx) => {
    const status = idx === 0 ? '<span class="badge-pill badge-hot" style="margin-left:auto;">Hot</span>' : '';
    recEl.innerHTML += `
      <div class="stat-card" style="display:flex; align-items:center; gap:1rem; padding:1rem;">
        <div style="background:#000; color:#EFFF00; width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:700; flex-shrink:0;">${job.company[0]}</div>
        <div style="min-width:0;">
          <h4 style="font-size:0.9rem; margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${job.title}</h4>
          <p style="font-size:0.75rem; color:#666;">${job.company} · ${job.location}</p>
        </div>
        ${status}
      </div>`;
  });
}

function loadRecruiterDashboard() {
  const jobs = JSON.parse(localStorage.getItem('hj_jobs') || '[]');
  const agents = JSON.parse(localStorage.getItem('hj_agents') || '[]');

  // Recent jobs
  const jobsEl = document.getElementById('recent-jobs');
  if (jobsEl) {
    jobsEl.innerHTML = '';
    jobs.slice(0, 4).forEach((job, idx) => {
      const statusBadge = idx < 2 ? '<span class="badge-pill badge-hot">Active</span>' : '<span class="badge-pill badge-new">Draft</span>';
      jobsEl.innerHTML += `
        <div class="stat-card" style="padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
            <div style="background:#000; color:#EFFF00; width:32px; height:32px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:700;">${job.title[0]}</div>
            ${statusBadge}
          </div>
          <h4 style="font-size:1rem; margin-bottom:0.25rem;">${job.title}</h4>
          <p style="font-size:0.75rem; color:#666;">${job.location} · ${job.type}</p>
        </div>`;
    });
  }

  // Top candidates
  const candEl = document.getElementById('top-candidates');
  if (candEl) {
    candEl.innerHTML = '';
    agents.forEach(agent => {
      candEl.innerHTML += `
        <div class="stat-card" style="display:flex; align-items:center; gap:1.25rem; padding:1.25rem;">
          <div style="width:40px; height:40px; border-radius:50%; background:#f0f0f0; display:flex; align-items:center; justify-content:center; font-weight:700; border:1px solid #ddd;">${agent.name[0]}</div>
          <div style="flex:1;">
            <h4 style="font-size:0.95rem; margin-bottom:2px;">${agent.name} ${agent.verified ? '<span style="color:#22c55e; font-size:0.8rem;">✓</span>' : ''}</h4>
            <p style="font-size:0.75rem; color:#666;">${agent.location} · ${agent.skills.slice(0, 2).join(', ')}</p>
          </div>
          <div style="text-align:right;">
             <div style="font-weight:700; font-size:0.9rem;">⭐ ${agent.rating}</div>
             <div style="font-size:0.65rem; color:#999;">Top Choice</div>
          </div>
        </div>`;
    });
  }
}
