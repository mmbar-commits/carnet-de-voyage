# Carnet de Voyage — Branded Bilingual Supabase Auth Email Templates

These 6 email templates are designed to match **The Ivy Collection** aesthetic (`#FAF8F4` warm ivory, `#FFFFFF` card with `#ECE7DE` hairline border, `#143B2B` Ivy Green crest & CTA, `#B39258` Antique Brass accents, Georgia editorial serif headings) using 100% email-client-safe HTML tables and inline CSS.

## How Bilingual Language Routing Works

The app automatically passes and synchronizes `user_metadata.lang` (`"fr"` or `"en"`) on:
- **Magic Link** (`signInWithOtp` → `options.data.lang`)
- **Sign Up** (`signUp` → `options.data.lang`)
- **Signed-in sessions & language changes** (`updateUser({ data: { lang } })`), ensuring future **Password Reset**, **Change Email**, and **Reauthentication** emails match the user's chosen language.

Every **Subject** and **HTML Body** uses nil-safe Go template syntax:

```gotemplate
{{ if eq (printf "%v" .Data.lang) "en" }}English text{{ else }}Texte français{{ end }}
```

- Renders **English** when `user_metadata.lang == "en"`.
- Falls back cleanly to **French** when `user_metadata.lang` is `"fr"`, empty, or unset (e.g., admin-triggered invites).

---

## Supabase Dashboard Setup

In **Supabase Dashboard → Authentication → Emails (Templates)**, paste the exact **Subject** and HTML **Body** for each of the 6 templates below.

### 1. Magic Link (`magic-link.html`)
- **Subject** (138 chars):
  ```gotemplate
  {{ if eq (printf "%v" .Data.lang) "en" }}Your sign-in link — Carnet de Voyage{{ else }}Votre lien de connexion — Carnet de Voyage{{ end }}
  ```
- **Body**: copy contents of `magic-link.html`

### 2. Confirm Signup (`confirm-signup.html`)
- **Subject** (140 chars):
  ```gotemplate
  {{ if eq (printf "%v" .Data.lang) "en" }}Confirm your account — Carnet de Voyage{{ else }}Confirmez votre compte — Carnet de Voyage{{ end }}
  ```
- **Body**: copy contents of `confirm-signup.html`

### 3. Reset Password (`reset-password.html`)
- **Subject** (149 chars):
  ```gotemplate
  {{ if eq (printf "%v" .Data.lang) "en" }}Reset your password — Carnet de Voyage{{ else }}Réinitialisez votre mot de passe — Carnet de Voyage{{ end }}
  ```
- **Body**: copy contents of `reset-password.html`

### 4. Invite User (`invite-user.html`)
- **Subject** (133 chars):
  ```gotemplate
  {{ if eq (printf "%v" .Data.lang) "en" }}You're invited to Carnet de Voyage{{ else }}Invitation à rejoindre Carnet de Voyage{{ end }}
  ```
- **Body**: copy contents of `invite-user.html`

### 5. Change Email Address (`change-email.html`)
- **Subject** (148 chars):
  ```gotemplate
  {{ if eq (printf "%v" .Data.lang) "en" }}Confirm your new email — Carnet de Voyage{{ else }}Confirmez votre nouvel email — Carnet de Voyage{{ end }}
  ```
- **Body**: copy contents of `change-email.html`

### 6. Reauthentication (`reauthentication.html`)
- **Subject** (146 chars):
  ```gotemplate
  {{ if eq (printf "%v" .Data.lang) "en" }}Your verification code — Carnet de Voyage{{ else }}Votre code de vérification — Carnet de Voyage{{ end }}
  ```
- **Body**: copy contents of `reauthentication.html`

---

## Redirect URL Reminder

In **Supabase Dashboard → Authentication → URL Configuration**, make sure your production URL (`https://mmbar-commits.github.io/carnet-de-voyage/`) is set as **Site URL** and included in **Redirect URLs** so Magic Links, Signup Confirmations, and Password Reset links return directly into the app (triggering the built-in `PASSWORD_RECOVERY` screen for password resets).
