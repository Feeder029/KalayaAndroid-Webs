// ─── Config ───────────────────────────────────────────────────────────────────
const AUTH_API = '/.netlify/functions/api';

// ─── Modal Controls ───────────────────────────────────────────────────────────
function openAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    showSignIn();
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('signInForm').querySelector('form').reset();
    document.getElementById('signUpForm').querySelector('form').reset();
    clearMessages();
}

function showSignIn() {
    document.getElementById('signInForm').style.display = 'block';
    document.getElementById('signUpForm').style.display = 'none';
    clearMessages();
}

function showSignUp(event) {
    if (event) event.preventDefault();
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
    clearMessages();
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
async function handleSignIn(event) {
    event.preventDefault();

    const username   = document.getElementById('signInEmail').value.trim();
    const password   = document.getElementById('signInPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const submitBtn  = event.target.querySelector('button[type="submit"]');

    if (!username || !password) {
        showErrorMessage('Please fill in all fields.');
        return;
    }

    setLoading(submitBtn, true);
    clearMessages();

    try {
        const res  = await fetch(AUTH_API, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ action: 'signin', email: username, password })
        });

        const text = await res.text();         // raw text first
        const data = JSON.parse(text);         // then parse

        if (data.success) {
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('katipunanUser', JSON.stringify({
                ...data.user,
                signedIn:  true,
                timestamp: new Date().toISOString()
            }));
            showSuccessMessage('Sign in successful! Redirecting...');
            setTimeout(() => { closeAuthModal(); openDownloadModal(); }, 1000);
        } else {
            showErrorMessage(data.message || 'Sign in failed. Please try again.');
        }
    } catch (err) {
        showErrorMessage('Server error. Please try again.');
        console.error('Sign in error:', err);
    } finally {
        setLoading(submitBtn, false);
    }
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
async function handleSignUp(event) {
    event.preventDefault();

    const name            = document.getElementById('signUpName').value.trim();
    const username        = document.getElementById('signUpEmail').value.trim();
    const password        = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;
    const submitBtn       = event.target.querySelector('button[type="submit"]');

    if (!name || !username || !password || !confirmPassword) {
        showErrorMessage('Please fill in all fields.');
        return;
    }
    if (password !== confirmPassword) {
        showErrorMessage('Passwords do not match!');
        return;
    }
    if (password.length < 8) {
        showErrorMessage('Password must be at least 8 characters!');
        return;
    }

    setLoading(submitBtn, true);
    clearMessages();

    try {
        const res  = await fetch(AUTH_API, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ action: 'signup', name, email: username, password })
        });

        const text = await res.text();         // raw text first
        const data = JSON.parse(text);         // then parse

        if (data.success) {
            localStorage.setItem('katipunanUser', JSON.stringify({
                ...data.user,
                signedIn:  true,
                timestamp: new Date().toISOString()
            }));
            showSuccessMessage('Account created successfully! Redirecting...');
            setTimeout(() => { closeAuthModal(); openDownloadModal(); }, 1000);
        } else {
            showErrorMessage(data.message || 'Sign up failed. Please try again.');
        }
    } catch (err) {
        showErrorMessage('Server error. Please try again.');
        console.error('Sign up error:', err);
    } finally {
        setLoading(submitBtn, false);
    }
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function getActiveForm() {
    return document.querySelector('.auth-form[style*="block"]') || document.getElementById('signInForm');
}

function showSuccessMessage(message) {
    clearMessages();
    const div = document.createElement('div');
    div.className = 'success-message show';
    div.textContent = message;
    const form = getActiveForm().querySelector('form');
    form.insertBefore(div, form.firstChild);
}

function showErrorMessage(message) {
    clearMessages();
    const div = document.createElement('div');
    div.className = 'error-message show';
    div.textContent = message;
    const form = getActiveForm().querySelector('form');
    form.insertBefore(div, form.firstChild);
}

function clearMessages() {
    document.querySelectorAll('.success-message, .error-message').forEach(el => el.remove());
}

function setLoading(btn, isLoading) {
    btn.classList.toggle('loading', isLoading);
    btn.disabled = isLoading;
}

// ─── Session Helpers ──────────────────────────────────────────────────────────
function checkUserSession() {
    const data = localStorage.getItem('katipunanUser') || sessionStorage.getItem('katipunanUser');
    return data ? JSON.parse(data) : null;
}

function signOut() {
    localStorage.removeItem('katipunanUser');
    sessionStorage.removeItem('katipunanUser');
    window.location.reload();
}

// ─── DOM Ready ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const authModal = document.getElementById('authModal');
    if (!authModal) return;

    authModal.addEventListener('click', function (e) {
        if (e.target === this) closeAuthModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && authModal.classList.contains('active')) {
            closeAuthModal();
        }
    });
});