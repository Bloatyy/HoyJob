// Auth JS — Login & Signup logic

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showError('Please fill in all fields.');
    return;
  }

  // Simple simulation — accept any login
  const role = document.querySelector('input[name="role"]:checked')?.value || 'agent';
  const user = { email, name: email.split('@')[0], role, verified: true };
  setUser(user);

  if (role === 'agent') {
    window.location.href = 'agent-dashboard.html';
  } else {
    window.location.href = 'recruiter-dashboard.html';
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const role = document.querySelector('input[name="role"]:checked')?.value || 'agent';

  if (!name || !email || !password) {
    showError('Please fill in all fields.');
    return;
  }

  const user = { name, email, role, verified: false };
  setUser(user);

  if (role === 'agent') {
    window.location.href = 'agent-dashboard.html';
  } else {
    window.location.href = 'recruiter-dashboard.html';
  }
}

function showError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
