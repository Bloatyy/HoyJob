document.addEventListener('DOMContentLoaded', async () => {
  const jobsGrid = document.querySelector('.jobs-grid');
  const user = getUser();
  const userRole = user ? user.role : 'agent';

  // Dynamic Header for Recruiters
  if (userRole === 'recruiter') {
    const headerTitle = document.querySelector('.dash-header h1');
    const headerDesc = document.querySelector('.dash-header p');
    const searchInput = document.getElementById('search-input');

    if (headerTitle) headerTitle.textContent = 'Talent Pool';
    if (headerDesc) headerDesc.textContent = 'Discover and connect with top-tier verified agents and specialists.';
    if (searchInput) searchInput.placeholder = 'Search by name, expertise, or skills...';
  }

  let allData = [];

  async function loadMarketplace() {
    if (!jobsGrid) return;
    jobsGrid.innerHTML = `<div class="loading">Finding ${userRole === 'recruiter' ? 'talent' : 'opportunities'}...</div>`;

    try {
      if (userRole === 'recruiter') {
        const allUsers = await apiFetch('/users');
        allData = allUsers.filter(u => u.role === 'agent');
      } else {
        allData = await apiFetch('/jobs');
      }
      renderGrid(allData);
    } catch (err) {
      jobsGrid.innerHTML = `<div class="error">Error loading data: ${err.message}</div>`;
    }
  }

  function renderGrid(data) {
    if (!jobsGrid) return;
    jobsGrid.innerHTML = '';

    if (data.length === 0) {
      jobsGrid.innerHTML = `<div class="empty">No ${userRole === 'recruiter' ? 'candidates' : 'jobs'} found for your search.</div>`;
      return;
    }

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'job-card';

      if (userRole === 'recruiter') {
        const name = item.name && item.name.toLowerCase() !== 'google' ? item.name : item.email.split('@')[0];
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        // Handle skills (could be array or comma string)
        let skillsArr = [];
        if (Array.isArray(item.skills)) skillsArr = item.skills;
        else if (item.skills) skillsArr = item.skills.split(',').map(s => s.trim());

        const expText = item.experience ? `${item.experience} YOE` : '';
        const orgText = item.organization ? `@ ${item.organization}` : '';

        // Format Bio as bullet points
        const bioText = item.bio || 'Professional Agent specialized in strategic operations and technical implementation.';
        const bioBullets = bioText.split(/[.\n]/).filter(s => s.trim().length > 0).slice(0, 3);

        card.innerHTML = `
          <div class="job-card-header" style="margin-bottom: 1.5rem;">
            <div style="display:flex; align-items:center; gap:1rem;">
              <div style="background:#000; color:#EFFF00; width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size: 1.1rem; flex-shrink:0;">${initials || '?'}</div>
              <div style="min-width: 0;">
                <h3 style="margin-bottom: 0.25rem; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em;">${name}</h3>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                   <span style="font-size: 0.65rem; font-weight: 700; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; color: #666; letter-spacing: 0.02em;">${item.location || 'Remote'}</span>
                   ${expText ? `<span style="font-size: 0.65rem; font-weight: 700; background: #EFFF00; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; color: #000; letter-spacing: 0.02em;">${expText}</span>` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 1.5rem; flex: 1;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${bioBullets.map(bullet => `
                <li style="font-size: 0.8rem; color: #666; margin-bottom: 0.4rem; display: flex; gap: 0.5rem; align-items: flex-start; line-height: 1.4;">
                  <span style="color: #EFFF00; font-weight: 900;">•</span>
                  <span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${bullet.trim()}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div style="margin-top: auto;">
            <div style="margin-bottom: 1.5rem; display:flex; flex-wrap:wrap; gap:0.35rem;">
              ${skillsArr.length > 0
            ? skillsArr.map(s => `<span style="background: rgba(239, 255, 0, 0.1); color: #888800; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; border: 1px solid rgba(239, 255, 0, 0.2);">${s}</span>`).join('')
            : '<span style="font-size:0.7rem; color:#999;">Generalist</span>'}
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; padding-top: 1.25rem; border-top: 1px solid #f5f5f5;">
               <div style="display:flex; align-items:center; gap:0.4rem; color: #22c55e; font-size: 0.75rem; font-weight: 600;">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                 Available
               </div>
               <a href="chat.html?userId=${item._id}" class="btn btn-primary btn-sm" style="padding: 0.5rem 1.25rem; border-radius: 8px; font-weight:700; font-size:0.8rem; box-shadow: 0 4px 12px rgba(239, 255, 0, 0.2);">Connect</a>
            </div>
          </div>`;
      } else {
        const companyName = item.company || 'HoyJob Partner';
        const initials = companyName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

        // Format Description as bullet points
        const descText = item.description || 'Modern role focused on high-impact delivery and innovative problem solving at ' + companyName;
        const descBullets = descText.split(/[.\n]/).filter(s => s.trim().length > 0).slice(0, 3);

        card.innerHTML = `
          <div class="job-card-header" style="margin-bottom: 1.5rem;">
            <div style="display:flex; align-items:center; gap:1rem;">
              <div style="background:#000; color:#EFFF00; width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size: 1.1rem; flex-shrink:0;">${initials || '?'}</div>
              <div style="min-width: 0;">
                <h3 style="margin-bottom: 0.25rem; font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em;">${item.title}</h3>
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                   <span style="font-size: 0.65rem; font-weight: 700; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; color: #666; letter-spacing: 0.02em;">${item.location || 'Remote'}</span>
                   <span style="font-size: 0.65rem; font-weight: 700; background: #EFFF00; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; color: #000; letter-spacing: 0.02em;">${item.salary || 'Competitive'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 1.5rem; flex: 1;">
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${descBullets.map(bullet => `
                <li style="font-size: 0.8rem; color: #666; margin-bottom: 0.4rem; display: flex; gap: 0.5rem; align-items: flex-start; line-height: 1.4;">
                  <span style="color: #EFFF00; font-weight: 900;">•</span>
                  <span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${bullet.trim()}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div style="margin-top: auto;">
            <div style="margin-bottom: 1.5rem; display:flex; flex-wrap:wrap; gap:0.35rem;">
              ${(item.skills || 'Strategy, Delivery').split(',').map(s => `<span style="background: rgba(239, 255, 0, 0.1); color: #888800; padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; border: 1px solid rgba(239, 255, 0, 0.2);">${s.trim()}</span>`).join('')}
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; padding-top: 1.25rem; border-top: 1px solid #f5f5f5;">
               <div style="display:flex; align-items:center; gap:0.4rem; color: #bbb; font-size: 0.75rem; font-weight: 600;">
                 Posted ${new Date(item.createdAt).toLocaleDateString()}
               </div>
               <button class="btn btn-primary btn-sm" onclick="applyJob('${item._id}')" style="padding: 0.5rem 1.25rem; border-radius: 8px; font-weight:700; font-size:0.8rem; box-shadow: 0 4px 12px rgba(239, 255, 0, 0.2);">Apply Now</button>
            </div>
          </div>`;
      }
      jobsGrid.appendChild(card);
    });
  }

  // Filter Logic
  const searchInput = document.getElementById('search-input');
  const filterLocation = document.getElementById('filter-location');

  function applyFilters() {
    const term = searchInput ? searchInput.value.toLowerCase() : '';
    const loc = filterLocation ? filterLocation.value.toLowerCase() : '';

    const filtered = allData.filter(item => {
      const matchSearch = userRole === 'recruiter'
        ? (item.name || '').toLowerCase().includes(term) || (item.email || '').toLowerCase().includes(term) || (item.skills || '').toLowerCase().includes(term)
        : (item.title || '').toLowerCase().includes(term) || (item.company || '').toLowerCase().includes(term) || (item.description || '').toLowerCase().includes(term);

      const matchLoc = !loc || (item.location || '').toLowerCase().includes(loc);

      return matchSearch && matchLoc;
    });

    renderGrid(filtered);
  }

  if (searchInput) searchInput.oninput = applyFilters;
  if (filterLocation) filterLocation.onchange = applyFilters;

  window.applyJob = async (jobId) => {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }

    try {
      await apiFetch(`/applications/apply/${jobId}`, { method: 'POST' });
      alert('Application submitted successfully!');
      // Refresh to update button state (optional)
      location.reload();
    } catch (err) {
      alert(err.message || 'Error applying for job');
    }
  };

  // Handle Post Job Form
  const postJobForm = document.getElementById('post-job-form');
  if (postJobForm) {
    postJobForm.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById('job-title').value;
      const location = document.getElementById('job-location').value;
      const type = document.getElementById('job-type').value;
      const experience = document.getElementById('job-experience').value;
      const salary = document.getElementById('job-salary').value;
      const skills = document.getElementById('job-skills').value;
      const description = document.getElementById('job-description').value;

      const company = user && user.name && user.name.toLowerCase() !== 'google' ? user.name : (user && user.email ? user.email.split('@')[0] : 'HoyJob Partner');

      try {
        await apiFetch('/jobs', {
          method: 'POST',
          body: JSON.stringify({ title, location, type, experience, salary, skills, description, company })
        });
        alert('Job posted successfully!');
        window.location.href = 'recruiter-dashboard.html';
      } catch (err) {
        alert(err.message);
      }
    };
  }

  loadMarketplace();
});
