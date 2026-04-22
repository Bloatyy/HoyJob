// Auth JS — Login & Signup logic

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showError('Please fill in all fields.');
    return;
  }

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    setToken(data.token);
    setUser(data.user);

    if (data.user.role === 'agent') {
      window.location.href = 'agent-dashboard.html';
    } else {
      window.location.href = 'recruiter-dashboard.html';
    }
  } catch (err) {
    showError(err.message);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const role = document.querySelector('input[name="role"]:checked')?.value || 'agent';

  if (!name || !email || !password) {
    showError('Please fill in all fields.');
    return;
  }

  try {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });

    setToken(data.token);
    setUser(data.user);

    if (data.user.role === 'agent') {
      window.location.href = 'agent-dashboard.html';
    } else {
      window.location.href = 'recruiter-dashboard.html';
    }
  } catch (err) {
    showError(err.message);
  }
}

function showError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
