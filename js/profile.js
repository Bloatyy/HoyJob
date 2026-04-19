// Profile JS — renders user profile from localStorage

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  const user = getUser();
  renderProfile(user);
});

function renderProfile(user) {
  // Avatar
  const avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) avatarEl.textContent = user.name ? user.name[0].toUpperCase() : '?';

  // Name & email
  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = user.name || 'User';

  const emailEl = document.getElementById('profile-email');
  if (emailEl) emailEl.textContent = user.email || '';

  const roleEl = document.getElementById('profile-role');
  if (roleEl) {
    roleEl.textContent = user.role === 'agent' ? 'Agent' : 'Recruiter';
    roleEl.className = 'badge ' + (user.role === 'agent' ? 'badge-yellow' : 'badge-blue');
  }

  const verifiedEl = document.getElementById('profile-verified');
  if (verifiedEl) {
    verifiedEl.textContent = user.verified ? '✓ Verified' : 'Not Verified';
    verifiedEl.className = 'badge ' + (user.verified ? 'badge-green' : 'badge-gray');
  }

  // Fill form fields
  const fields = ['profile-display-name', 'profile-display-email', 'profile-location', 'profile-experience', 'profile-phone'];
  const vals = { 'profile-display-name': user.name, 'profile-display-email': user.email, 'profile-location': user.location || 'Not set', 'profile-experience': user.experience || 'Not set', 'profile-phone': user.phone || 'Not set' };
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = vals[id] || 'Not set';
  });
}
