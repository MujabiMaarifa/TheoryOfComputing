# Account Setup Form — Validation Policy

This document describes the validation rules enforced by `index.js` for each
field in `index.html`, and the reasoning behind them.

## Files

| File | Purpose |
|---|---|
| `index.html` | Form markup and structure |
| `style.css` | Visual styling, layout, and validation state colors |
| `index.js` | All validation logic, live flagging, and submit handling |
| `README.md` | This document |

Validation runs live on every keystroke (`input` event) — fields are flagged
as soon as they become invalid, not just on blur or submit. The submit
button stays disabled until all five fields pass.

---

## Field policies

### 1. Full name

**Pattern:** `^[A-Za-z][A-Za-z\s]{1,49}$`

- Must start with a letter (no leading space or digit)
- Letters and spaces only — no numbers, no special characters
- 2–50 characters total

**Rationale:** Names don't contain digits or symbols in standard use. A
minimum of 2 characters filters accidental single-keystroke entries; 50
covers legitimate long names without allowing unbounded input.

---

### 2. Email

**Pattern:** `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

- Local part: letters, digits, and `. _ % + -`
- Single `@`
- Domain: letters, digits, hyphens, and at least one dot
- Top-level domain: 2+ letters

**Rationale:** This covers the standard `name@domain.tld` shape used by the
overwhelming majority of real addresses without implementing the full RFC
5322 grammar, which is deliberately permissive to the point of allowing
addresses that are technically valid but practically never seen (e.g.
quoted strings, comments). A pragmatic subset is the accepted trade-off for
client-side checks — the authoritative check is still a verification email.

---

### 3. Phone number

**Pattern:** `^\+[1-9]\d{6,11}$`
**Length constraint:** 8–13 characters total, including the leading `+`

- Must start with `+` (E.164 international format)
- First digit after `+` cannot be `0` (no valid country code starts with 0)
- Followed by 6–11 more digits
- Total string length capped at 13 characters

**Rationale:** Requiring the `+` and country code avoids ambiguous
local-format numbers. Capping total length at 13 characters matches the
longest real-world E.164 numbers (country code + subscriber number) while
rejecting obviously malformed or excessively long input.

**Examples:**
- `+254712345678` (13 chars) — valid
- `+14155552671` (12 chars) — valid
- `+123` — invalid (too short)
- `+12345678901234` — invalid (exceeds 13 characters)

---

### 4. Profile slug

**Pattern:** `^[a-z0-9]+(-[a-z0-9]+)*$`

- Lowercase letters and digits only
- Single hyphens allowed *between* segments
- No leading or trailing hyphen, no consecutive hyphens, no spaces or
  uppercase letters

**Rationale:** Slugs are typically used in URLs (`/profile/jane-wanjiru`),
where uppercase letters, spaces, and repeated/edge hyphens cause either
broken links or duplicate routes that differ only in casing/formatting.

---

### 5. Password

No single regex — validated against four independent conditions, all of
which must pass:

| Requirement | Check |
|---|---|
| Minimum length | 8+ characters |
| Mixed case | at least one uppercase and one lowercase letter |
| Digit | at least one number |
| Special character | at least one non-alphanumeric character |

**Rationale:** This is the standard baseline composition policy (length +
three character classes) used by most modern authentication systems — it
resists common dictionary and brute-force attacks without imposing
unusual, hard-to-remember constraints. Live feedback lists exactly which
condition(s) are unmet rather than only marking the field invalid, and a
4-segment strength meter reflects how many conditions currently pass.

---

## Extending this form

To change a rule, edit the corresponding pattern/constants at the top of
`index.js` (`RULES`, `PHONE_PATTERN`, `PHONE_MIN_LENGTH`,
`PHONE_MAX_LENGTH`, or the checks inside `getPasswordScore`). Hint text
strings live alongside each rule so the displayed message stays in sync
with the logic.
