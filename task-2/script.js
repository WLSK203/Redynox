/* ================================================================
   REDYNOX — Task 2 · script.js
   JavaScript Form Validation & Submission

   Features:
   - Client-side field validation (name, email, message)
   - Real-time error clearing while user types
   - Blur-triggered validation for each field
   - Character counter with over-limit warning
   - Simulated async POST submission (1.2s delay)
   - Dynamic success panel rendering submitted data
   - Shake animation on failed submit attempt
   - Full console logging of the payload
   ================================================================ */

'use strict';

// ── ELEMENT REFS ────────────────────────────────────────────────
const form     = document.getElementById('contact-form');
const btnSub   = document.getElementById('btn-submit');
const btnReset = document.getElementById('btn-reset');
const overlay  = document.getElementById('success-overlay');
const sName    = document.getElementById('s-name');
const sData    = document.getElementById('s-data');
const msgArea  = document.getElementById('message');
const charNow  = document.getElementById('char-now');

const MAX_CHARS = 500;

// ── VALIDATION RULES ────────────────────────────────────────────
const rules = {
  name(v) {
    if (!v.trim())              return 'Full name is required.';
    if (v.trim().length < 2)   return 'Name must be at least 2 characters.';
    if (!/^[a-zA-Z\s'\-]+$/.test(v.trim()))
                                return 'Name may only contain letters, spaces, hyphens, and apostrophes.';
    return null;
  },

  email(v) {
    if (!v.trim())              return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()))
                                return 'Please enter a valid email address.';
    return null;
  },

  message(v) {
    if (!v.trim())              return 'Message is required.';
    if (v.trim().length < 10)  return 'Message must be at least 10 characters.';
    if (v.length > MAX_CHARS)  return `Message must be under ${MAX_CHARS} characters.`;
    return null;
  }
};

// ── HELPERS ─────────────────────────────────────────────────────

/**
 * Show or clear an error on a field.
 * @param {string} fieldId  - The input's id
 * @param {string|null} msg - Error message, or null to clear
 */
function setError(fieldId, msg) {
  const input   = document.getElementById(fieldId);
  const errEl   = document.getElementById(`${fieldId}-error`);
  const iconEl  = document.getElementById(`s-${fieldId}-icon`);

  if (!input) return;

  if (msg) {
    input.classList.add('err');
    input.classList.remove('ok');
    if (errEl)  errEl.textContent  = msg;
    if (iconEl) iconEl.textContent = '✕';
  } else {
    input.classList.remove('err');
    if (input.value.trim()) {
      input.classList.add('ok');
      if (iconEl) iconEl.textContent = '✓';
    } else {
      input.classList.remove('ok');
      if (iconEl) iconEl.textContent = '';
    }
    if (errEl) errEl.textContent = '';
  }
}

/**
 * Validate a single field.
 * @returns {boolean} true = valid
 */
function validateField(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input || !rules[fieldId]) return true;
  const error = rules[fieldId](input.value);
  setError(fieldId, error);
  return !error;
}

// ── REAL-TIME VALIDATION ─────────────────────────────────────────
// Validate on blur; clear the error live while user types to fix it.
['name', 'email', 'message'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener('blur', () => validateField(id));

  el.addEventListener('input', () => {
    // Only clear errors live — don't add them while typing
    if (el.classList.contains('err')) validateField(id);
  });
});

// ── CHARACTER COUNTER ────────────────────────────────────────────
if (msgArea && charNow) {
  msgArea.addEventListener('input', () => {
    const len = msgArea.value.length;
    charNow.textContent = len;
    charNow.classList.toggle('over', len > MAX_CHARS);
  });
}

// ── FORM SUBMISSION ──────────────────────────────────────────────
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all required fields
    const nameOk    = validateField('name');
    const emailOk   = validateField('email');
    const messageOk = validateField('message');

    if (!nameOk || !emailOk || !messageOk) {
      // Shake the button to signal failure
      btnSub.classList.remove('shake');
      void btnSub.offsetWidth;   // force reflow to restart animation
      btnSub.classList.add('shake');
      btnSub.addEventListener('animationend', () => btnSub.classList.remove('shake'), { once: true });
      return;
    }

    // ── Collect payload ────────────────────────────────────────
    const payload = {
      name:      document.getElementById('name').value.trim(),
      email:     document.getElementById('email').value.trim(),
      subject:   document.getElementById('subject').value || 'Not specified',
      message:   document.getElementById('message').value.trim(),
      method:    'POST',
      endpoint:  '/api/contact',
      sentAt:    new Date().toLocaleString()
    };

    // ── Loading state ──────────────────────────────────────────
    btnSub.querySelector('.btn-text').classList.add('hidden');
    btnSub.querySelector('.btn-loading').classList.remove('hidden');
    btnSub.disabled = true;

    // ── Console: demonstrate POST payload ──────────────────────
    console.group('%c📬 Redynox Form — POST Payload', 'color:#00e5ff; font-weight:bold;');
    console.log('%cMethod:   POST → /api/contact', 'color:#30ff90');
    console.log('%cStatus:   Client-side validation ✅ PASSED', 'color:#30ff90');
    console.log('%cPayload:', 'color:#00e5ff');
    console.table(payload);
    console.log(
      '%cGET vs POST reminder:\n' +
      '%c  GET  → data appended to URL  (?name=value)\n' +
      '%c  POST → data in request body  (hidden from URL)',
      'color:#ffb800; font-weight:bold',
      'color:#30ff90',
      'color:#00e5ff'
    );
    console.groupEnd();

    // ── Simulate network delay (1.2 s) ─────────────────────────
    await new Promise(resolve => setTimeout(resolve, 1200));

    // ── Show success overlay ────────────────────────────────────
    if (sName) sName.textContent = payload.name.split(' ')[0];

    if (sData) {
      const preview = payload.message.length > 60
        ? payload.message.slice(0, 60) + '…'
        : payload.message;

      sData.innerHTML = `
        <strong>name:</strong>      "${escHtml(payload.name)}"<br>
        <strong>email:</strong>     "${escHtml(payload.email)}"<br>
        <strong>subject:</strong>   "${escHtml(payload.subject)}"<br>
        <strong>message:</strong>   "${escHtml(preview)}"<br>
        <strong>sent_at:</strong>   ${escHtml(payload.sentAt)}
      `;
    }

    // Re-enable button before showing overlay
    btnSub.disabled = false;
    btnSub.querySelector('.btn-text').classList.remove('hidden');
    btnSub.querySelector('.btn-loading').classList.add('hidden');

    overlay.classList.remove('hidden');
  });
}

// ── RESET ────────────────────────────────────────────────────────
if (btnReset) {
  btnReset.addEventListener('click', () => {
    form.reset();
    overlay.classList.add('hidden');
    charNow.textContent = '0';

    ['name', 'email', 'message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('ok', 'err');
        setError(id, null);
      }
      const icon = document.getElementById(`s-${id}-icon`);
      if (icon) icon.textContent = '';
    });
  });
}

// ── UTILITY ─────────────────────────────────────────────────────
/**
 * Escape user-supplied strings for safe innerHTML insertion.
 */
function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

// ── INIT LOG ────────────────────────────────────────────────────
console.log('%c🚀 Redynox · Task 2 — Form Validation loaded', 'color:#00e5ff; font-size:13px; font-weight:bold;');
console.log('%cOpen the form, fill it in, and watch this console for the POST payload.', 'color:#6060a0; font-size:12px;');
