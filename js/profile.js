document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const SKILL_POOL = [
    'Sales Strategy', 'Contract Negotiation', 'B2B Networking', 'Field Operations', 'CRM Mastery',
    'Lead Generation', 'Public Speaking', 'Digital Marketing', 'Data Analysis', 'Project Management',
    'Logistics', 'Customer Success', 'Market Research', 'Financial Planning', 'Legal Consulting',
    'Full Stack Dev', 'UI/UX Design', 'Cloud Architecture', 'DevOps', 'Cybersecurity', 'Mobile App Dev'
  ];

  // Display Elements
  const nameDisplay = document.getElementById('user-name');
  const emailDisplay = document.getElementById('user-email');
  const avatarCircle = document.getElementById('avatar-circle');
  const userRoleDisplay = document.getElementById('user-role');
  const dispOrg = document.getElementById('disp-org');
  const dispEmail = document.getElementById('disp-email');
  const dispLoc = document.getElementById('disp-loc');
  const dispExp = document.getElementById('disp-exp');
  const skillsCloud = document.getElementById('skills-cloud');

  // Modal Elements
  const editModal = document.getElementById('edit-modal');
  const openModalBtn = document.getElementById('open-edit-modal');
  const editName = document.getElementById('edit-name');
  const editOrg = document.getElementById('edit-org');
  const editLoc = document.getElementById('edit-loc');
  const editExp = document.getElementById('edit-exp');
  const editBio = document.getElementById('edit-bio');
  
  // Stat Field Containers
  const agentFields = document.getElementById('agent-stats-fields');
  const recruiterFields = document.getElementById('recruiter-stats-fields');
  
  // Individual Stat Inputs
  const editApps = document.getElementById('edit-apps');
  const editInterviews = document.getElementById('edit-interviews');
  const editScore = document.getElementById('edit-score');
  const editActiveRoles = document.getElementById('edit-active-roles');
  const editTotalCandidates = document.getElementById('edit-total-candidates');
  const editInterviewsToday = document.getElementById('edit-interviews-today');

  const skillsSelector = document.getElementById('skills-selector');
  const saveBtn = document.getElementById('save-profile');

  // Document Elements
  const uploadAadhaar = document.getElementById('upload-aadhaar');
  const uploadCert = document.getElementById('upload-cert');
  const viewAadhaar = document.getElementById('view-aadhaar');
  const viewCert = document.getElementById('view-cert');
  const aadhaarStatus = document.getElementById('aadhaar-status');
  const certStatus = document.getElementById('cert-status');

  let currentFullUser = null;
  let selectedSkills = [];

  function renderSkillsSelector() {
    if (!skillsSelector) return;
    skillsSelector.innerHTML = '';
    SKILL_POOL.forEach(skill => {
      const isSelected = selectedSkills.includes(skill);
      const tag = document.createElement('div');
      tag.style.display = 'inline-block';
      tag.style.padding = '8px 12px';
      tag.style.borderRadius = '8px';
      tag.style.fontSize = '0.75rem';
      tag.style.fontWeight = '600';
      tag.style.cursor = 'pointer';
      tag.style.border = '1px solid #ddd';
      tag.style.backgroundColor = isSelected ? '#000' : '#fff';
      tag.style.color = isSelected ? '#EFFF00' : '#333';
      tag.style.margin = '2px';
      tag.textContent = skill;
      tag.onclick = (e) => {
        e.preventDefault();
        if (selectedSkills.includes(skill)) {
          selectedSkills = selectedSkills.filter(s => s !== skill);
        } else {
          selectedSkills.push(skill);
        }
        renderSkillsSelector();
      };
      skillsSelector.appendChild(tag);
    });
  }

  async function loadProfile() {
    try {
      if (openModalBtn) openModalBtn.disabled = true;
      currentFullUser = await apiFetch('/auth/me');
      setUser(currentFullUser);

      const username = currentFullUser.name && currentFullUser.name.toLowerCase() !== 'google' ? currentFullUser.name : currentFullUser.email.split('@')[0];
      if (nameDisplay) nameDisplay.textContent = username;
      if (emailDisplay) emailDisplay.textContent = currentFullUser.email;
      if (avatarCircle) avatarCircle.textContent = username.charAt(0).toUpperCase();
      if (userRoleDisplay) userRoleDisplay.textContent = (currentFullUser.role || 'AGENT').toUpperCase();

      if (dispOrg) dispOrg.textContent = currentFullUser.organization || 'Not set';
      if (dispEmail) dispEmail.textContent = currentFullUser.email;
      if (dispLoc) dispLoc.textContent = currentFullUser.location || 'Not set';
      if (dispExp) dispExp.textContent = currentFullUser.experience ? `${currentFullUser.experience} Years` : 'Not set';

      selectedSkills = currentFullUser.skills || [];
      if (skillsCloud) {
        if (selectedSkills.length > 0) {
          skillsCloud.innerHTML = selectedSkills.map(s => `
            <span class="profile-tag" style="background:#000; color:#EFFF00; padding:6px 14px; border-radius:6px; font-size:0.8rem; font-weight:600; display:inline-block; margin-right:5px; margin-bottom:5px;">
              ${s}
            </span>`).join('');
        } else {
          skillsCloud.innerHTML = '<div style="color:#999; font-size:0.85rem;">No skills added yet.</div>';
        }
      }

      if (currentFullUser.aadhaarDoc) {
        if (aadhaarStatus) { aadhaarStatus.textContent = 'Uploaded ✓'; aadhaarStatus.style.color = '#22c55e'; }
        if (viewAadhaar) { viewAadhaar.style.display = 'block'; viewAadhaar.onclick = () => viewDocument(currentFullUser.aadhaarDoc); }
      }
      if (currentFullUser.certificateDoc) {
        if (certStatus) { certStatus.textContent = 'Uploaded ✓'; certStatus.style.color = '#22c55e'; }
        if (viewCert) { viewCert.style.display = 'block'; viewCert.onclick = () => viewDocument(currentFullUser.certificateDoc); }
      }

      if (typeof buildNav === 'function') buildNav();
      if (openModalBtn) openModalBtn.disabled = false;
    } catch (err) { console.error('Error loading profile:', err); }
  }

  function viewDocument(data) {
    const win = window.open();
    if (win) win.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result); reader.onerror = err => reject(err);
    });
  }

  if (openModalBtn) {
    openModalBtn.onclick = () => {
      if (!currentFullUser) return;
      
      editName.value = currentFullUser.name || '';
      editOrg.value = currentFullUser.organization || '';
      editLoc.value = currentFullUser.location || '';
      editExp.value = currentFullUser.experience || '';
      editBio.value = currentFullUser.bio || '';
      
      // Role-specific field visibility
      const role = (currentFullUser.role || 'agent').toLowerCase();
      if (role === 'recruiter') {
        if (recruiterFields) recruiterFields.style.display = 'grid';
        if (agentFields) agentFields.style.display = 'none';
        if (editActiveRoles) editActiveRoles.value = currentFullUser.activeRoles || 0;
        if (editTotalCandidates) editTotalCandidates.value = currentFullUser.totalCandidates || 0;
        if (editInterviewsToday) editInterviewsToday.value = currentFullUser.interviewsToday || 0;
      } else {
        if (agentFields) agentFields.style.display = 'grid';
        if (recruiterFields) recruiterFields.style.display = 'none';
        if (editApps) editApps.value = currentFullUser.appsSent || 0;
        if (editInterviews) editInterviews.value = currentFullUser.interviewCount || 0;
        if (editScore) editScore.value = currentFullUser.matchingScore || 0;
      }

      selectedSkills = [...(currentFullUser.skills || [])];
      renderSkillsSelector();
      editModal.style.display = 'flex';
    };
  }

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const payload = {
        name: editName.value.trim(),
        organization: editOrg.value.trim(),
        location: editLoc.value.trim(),
        experience: editExp.value.trim(),
        bio: editBio.value.trim(),
        skills: selectedSkills
      };

      if (currentFullUser.role === 'recruiter') {
        payload.activeRoles = parseInt(editActiveRoles.value) || 0;
        payload.totalCandidates = parseInt(editTotalCandidates.value) || 0;
        payload.interviewsToday = parseInt(editInterviewsToday.value) || 0;
      } else {
        payload.appsSent = parseInt(editApps.value) || 0;
        payload.interviewCount = parseInt(editInterviews.value) || 0;
        payload.matchingScore = parseInt(editScore.value) || 0;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
      try {
        await apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(payload) });
        editModal.style.display = 'none';
        await loadProfile();
        alert('Profile saved successfully!');
      } catch (err) { alert(err.message); }
      finally { saveBtn.disabled = false; saveBtn.textContent = 'Save Changes'; }
    };
  }

  [uploadAadhaar, uploadCert].forEach(input => {
    if (!input) return;
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file || file.size > 5 * 1024 * 1024) { alert('File too large or missing'); return; }
      try {
        const field = input.id === 'upload-aadhaar' ? 'aadhaarDoc' : 'certificateDoc';
        const base64 = await toBase64(file);
        await apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify({ [field]: base64 }) });
        alert('Uploaded!'); await loadProfile();
      } catch (err) { alert(err.message); }
    };
  });

  loadProfile();
});
