// Jobs JS — browse, search, post

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('jobs-grid');
  if (grid) loadJobs();

  const postForm = document.getElementById('post-job-form');
  if (postForm) postForm.addEventListener('submit', handlePostJob);

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', loadJobs);

  const locationFilter = document.getElementById('filter-location');
  if (locationFilter) locationFilter.addEventListener('change', loadJobs);
});

function loadJobs() {
  const jobs = JSON.parse(localStorage.getItem('hj_jobs') || '[]');
  const grid = document.getElementById('jobs-grid');
  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  const locFilter = document.getElementById('filter-location')?.value || '';

  let filtered = jobs.filter(job => {
    const matchSearch = !search || job.title.toLowerCase().includes(search) || job.company.toLowerCase().includes(search) || job.skills.some(s => s.toLowerCase().includes(search));
    const matchLoc = !locFilter || job.location === locFilter;
    return matchSearch && matchLoc;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results" style="grid-column: 1/-1;">No jobs found. Try a different search.</div>';
    return;
  }

  grid.innerHTML = filtered.map((job, idx) => `
    <div class="job-card" onclick="openJob(${job.id})">
      <div class="job-card-top">
        <div>
          <div style="background:#000; color:#EFFF00; width:32px; height:32px; border-radius:6px; display:flex; align-items:center; justify-content:center; font-weight:700; margin-bottom:0.75rem;">${job.company[0]}</div>
          <h3>${job.title}</h3>
          <div class="job-company">${job.company}</div>
        </div>
      </div>
      <div class="job-meta">
        <span>📍 ${job.location}</span>
        <span>💼 ${job.type}</span>
      </div>
      <div class="job-tags">
        ${job.skills.slice(0,3).map(s => `<span class="job-tag">${s}</span>`).join('')}
        ${job.skills.length > 3 ? `<span class="job-tag">+${job.skills.length - 3}</span>` : ''}
      </div>
    </div>
  `).join('');
}

function openJob(id) {
  const jobs = JSON.parse(localStorage.getItem('hj_jobs') || '[]');
  const job = jobs.find(j => j.id === id);
  if (!job) return;

  const content = document.getElementById('modal-content');
  content.innerHTML = `
    <div style="background:#000; color:#EFFF00; width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.5rem; margin-bottom:1.5rem;">${job.company[0]}</div>
    <h2 style="font-size:1.8rem; margin-bottom:0.5rem; font-weight:700; letter-spacing:-0.03em;">${job.title}</h2>
    <div style="color:var(--gray); font-weight:600; margin-bottom:1.5rem;">${job.company} · ${job.location}</div>
    
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; background:#f9f9f9; padding:1.25rem; border-radius:12px; margin-bottom:2rem; border:1px solid #eee;">
      <div>
        <div style="font-size:0.7rem; color:#999; text-transform:uppercase; font-weight:700; margin-bottom:0.25rem;">Experience</div>
        <div style="font-weight:600; font-size:0.95rem;">${job.experience}</div>
      </div>
      <div>
        <div style="font-size:0.7rem; color:#999; text-transform:uppercase; font-weight:700; margin-bottom:0.25rem;">Type</div>
        <div style="font-weight:600; font-size:0.95rem;">${job.type}</div>
      </div>
      <div>
        <div style="font-size:0.7rem; color:#999; text-transform:uppercase; font-weight:700; margin-bottom:0.25rem;">Location</div>
        <div style="font-weight:600; font-size:0.95rem;">${job.location}</div>
      </div>
      <div>
        <div style="font-size:0.7rem; color:#999; text-transform:uppercase; font-weight:700; margin-bottom:0.25rem;">Salary</div>
        <div style="font-weight:600; font-size:0.95rem;">${job.salary}</div>
      </div>
    </div>

    <div style="margin-bottom:2rem;">
      <h4 style="font-size:0.85rem; font-weight:700; margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">About the Role</h4>
      <p style="color:#555; line-height:1.7; font-size:0.95rem;">${job.description}</p>
    </div>

    <div style="margin-bottom:2.5rem;">
      <h4 style="font-size:0.85rem; font-weight:700; margin-bottom:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Required Skills</h4>
      <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
        ${job.skills.map(s => `<span class="job-tag" style="background:#000; color:#fff; padding:6px 14px;">${s}</span>`).join('')}
      </div>
    </div>

    <button class="btn btn-primary btn-lg" style="width:100%;" onclick="applyJob(event, ${job.id})">Apply for this Position</button>
  `;
  document.getElementById('job-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('job-modal').style.display = 'none';
}

function applyJob(e, jobId) {
  e.stopPropagation();
  const user = getUser();
  if (!user) { window.location.href = 'login.html'; return; }

  const apps = JSON.parse(localStorage.getItem('hj_applications') || '[]');
  if (apps.some(a => a.jobId === jobId && a.agent === user.email)) {
    alert('Already applied!');
    return;
  }

  apps.push({ jobId, agent: user.email, status: 'Applied', date: new Date().toISOString().split('T')[0] });
  localStorage.setItem('hj_applications', JSON.stringify(apps));
  alert('Application sent successfully!');
  closeModal();
}

function handlePostJob(e) {
  e.preventDefault();
  const user = getUser();
  if (!user) { window.location.href = 'login.html'; return; }

  const jobs = JSON.parse(localStorage.getItem('hj_jobs') || '[]');
  const newJob = {
    id: Date.now(),
    title: document.getElementById('job-title').value,
    company: document.getElementById('job-company').value || user.name,
    location: document.getElementById('job-location').value,
    type: document.getElementById('job-type').value,
    experience: document.getElementById('job-experience').value,
    salary: document.getElementById('job-salary').value,
    skills: document.getElementById('job-skills').value.split(',').map(s => s.trim()).filter(Boolean),
    description: document.getElementById('job-description').value,
    posted: new Date().toISOString().split('T')[0],
    recruiter: user.email
  };

  jobs.unshift(newJob);
  localStorage.setItem('hj_jobs', JSON.stringify(jobs));
  alert('Job posted successfully!');
  window.location.href = 'jobs.html';
}
