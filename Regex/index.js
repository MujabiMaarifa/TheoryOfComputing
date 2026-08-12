/**
 * index.js
 * Live validation for the account setup form.
 * Rules and rationale for each pattern are documented in README.md.
 */

// ---------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------

const RULES = {
  name: {
    pattern: /^[A-Za-z][A-Za-z\s]{1,49}$/,
    defaultHint: 'Letters and spaces only, 2–50 characters.',
    invalidHint: 'Letters and spaces only, 2–50 characters.',
    validHint: 'Looks good.'
  },
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    defaultHint: 'Standard format: name@domain.tld',
    invalidHint: 'Standard format: name@domain.tld',
    validHint: 'Looks good.'
  },
  slug: {
    pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    defaultHint: 'Lowercase letters, numbers, single hyphens. No leading/trailing hyphen.',
    invalidHint: 'Lowercase letters, numbers, single hyphens. No leading/trailing hyphen.',
    validHint: 'Looks good.'
  }
};

// Phone is validated in two parts: format, then total length.
const PHONE_PATTERN = /^\+[1-9]\d{6,11}$/;
const PHONE_MIN_LENGTH = 8;
const PHONE_MAX_LENGTH = 13;

// Password strength colors, weakest to strongest.
const PASSWORD_STRENGTH_COLORS = ['#FF7A7A', '#F5D06B', '#7C9CFF', '#5EEAD4'];

// ---------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------

const form = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const statusLine = document.getElementById('statusLine');
const strengthBars = document.querySelectorAll('#strength-bars .strength-seg');

const FIELD_IDS = ['name', 'email', 'phone', 'slug', 'pwd'];

// ---------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------

/**
 * Applies the valid/invalid visual state and updates the hint text
 * for a given field.
 * @param {string} fieldId - e.g. 'name', 'email', 'phone', 'slug', 'pwd'
 * @param {boolean|null} isValid - true, false, or null for "empty / untouched"
 * @param {string} [message] - hint text to display
 */
function setFieldState(fieldId, isValid, message) {
  const fieldEl = document.getElementById('field-' + fieldId);
  const hintEl = document.getElementById('hint-' + fieldId);

  fieldEl.classList.remove('valid', 'invalid');

  if (isValid === null) {
    if (message) hintEl.textContent = message;
    return;
  }

  fieldEl.classList.add(isValid ? 'valid' : 'invalid');
  if (message) hintEl.textContent = message;
}

/**
 * Re-checks every field's current state and enables/disables submit,
 * plus updates the status line with a remaining-fields count.
 */
function evaluateForm() {
  const validCount = FIELD_IDS.filter(function (id) {
    return document.getElementById('field-' + id).classList.contains('valid');
  }).length;

  const allValid = validCount === FIELD_IDS.length;
  submitBtn.disabled = !allValid;

  if (allValid) {
    statusLine.textContent = 'All fields valid — ready to submit';
    statusLine.classList.add('ready');
  } else {
    const remaining = FIELD_IDS.length - validCount;
    statusLine.textContent = remaining + (remaining === 1 ? ' field remaining' : ' fields remaining');
    statusLine.classList.remove('ready');
  }
}

// ---------------------------------------------------------------
// Field-specific validators
// ---------------------------------------------------------------

/**
 * Generic regex-driven validator for name, email, and slug fields.
 */
function validateSimpleField(fieldId) {
  const input = document.getElementById(fieldId);
  const rule = RULES[fieldId];
  const value = input.value.trim();

  if (value.length === 0) {
    setFieldState(fieldId, null, rule.defaultHint);
    evaluateForm();
    return;
  }

  const isValid = rule.pattern.test(value);
  setFieldState(fieldId, isValid, isValid ? rule.validHint : rule.invalidHint);
  evaluateForm();
}

/**
 * Phone validator: checks format (leading +, valid country-code digit,
 * digits only) and total character length (8–13 chars including '+').
 */
function validatePhoneField() {
  const input = document.getElementById('phone');
  const value = input.value.trim();

  if (value.length === 0) {
    setFieldState('phone', null, "Country code + number, starts with '+', max 13 characters total.");
    evaluateForm();
    return;
  }

  const formatOk = PHONE_PATTERN.test(value);
  const lengthOk = value.length >= PHONE_MIN_LENGTH && value.length <= PHONE_MAX_LENGTH;
  const isValid = formatOk && lengthOk;

  let message;
  if (!formatOk) {
    message = "Must start with '+' and country code, digits only.";
  } else if (!lengthOk) {
    message = 'Must be 8–13 characters including the +.';
  } else {
    message = 'Valid number.';
  }

  setFieldState('phone', isValid, message);
  evaluateForm();
}

/**
 * Scores password strength 0–4 based on four independent checks:
 * length, mixed case, digit present, special character present.
 */
function getPasswordScore(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

/**
 * Updates the four-segment strength meter to reflect the current score.
 */
function renderPasswordStrength(score) {
  strengthBars.forEach(function (bar, index) {
    bar.style.background = index < score ? PASSWORD_STRENGTH_COLORS[score - 1] : '#262B33';
  });
}

/**
 * Password validator: requires all four policy checks to pass
 * (see README.md for the full policy). Lists exactly what's missing
 * when invalid.
 */
function validatePasswordField() {
  const input = document.getElementById('pwd');
  const value = input.value;
  const score = getPasswordScore(value);

  renderPasswordStrength(score);

  if (value.length === 0) {
    setFieldState('pwd', null, '8+ chars, upper & lower case, a number, and a special character.');
    evaluateForm();
    return;
  }

  const isValid = score === 4;

  if (isValid) {
    setFieldState('pwd', true, 'Strong password.');
    evaluateForm();
    return;
  }

  const missing = [];
  if (value.length < 8) missing.push('8+ characters');
  if (!(/[A-Z]/.test(value) && /[a-z]/.test(value))) missing.push('upper & lower case');
  if (!/\d/.test(value)) missing.push('a number');
  if (!/[^A-Za-z0-9]/.test(value)) missing.push('a special character');

  setFieldState('pwd', false, 'Missing: ' + missing.join(', ') + '.');
  evaluateForm();
}

// ---------------------------------------------------------------
// Event wiring
// ---------------------------------------------------------------

['name', 'email', 'slug'].forEach(function (fieldId) {
  document.getElementById(fieldId).addEventListener('input', function () {
    validateSimpleField(fieldId);
  });
});

document.getElementById('phone').addEventListener('input', validatePhoneField);
document.getElementById('pwd').addEventListener('input', validatePasswordField);

form.addEventListener('submit', function (event) {
  event.preventDefault();
  // Hook this up to an actual API call / backend submission.
  alert('Form is valid. (Wire this up to your backend / API call.)');
});