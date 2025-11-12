<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Password Manager — Quick Start</title>
  <style>
    body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#0f172a; background: #f8fafc; line-height:1.5; }
    .wrap { max-width: 900px; margin: 48px auto; padding: 28px; background: #fff; border-radius: 12px; box-shadow: 0 6px 22px rgba(2,6,23,0.08); }
    h1 { font-size: 28px; margin: 0 0 8px; }
    p.lead { color:#334155; margin-top:0 }
    a { color: #0b5fff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    pre { background:#0f172a; color:#f8fafc; padding:12px; border-radius:8px; overflow:auto }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace; }
    .section { margin-top:20px }
    .muted { color:#475569; font-size:14px }
    .callout { padding:12px 16px; border-left:4px solid #0b5fff; background:#f1f5f9; border-radius:6px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Password Manager — Quick install & deploy</h1>
    <p class="lead">A small zero-knowledge password manager demo built with Next.js (App Router), TypeScript and Supabase. This README contains the complete installation and deployment guide — everything you need to run the project locally or on Render.</p>

    <div class="section">
      <h2>Live preview</h2>
      <p class="muted">A deployed preview of this app is available at:</p>
      <p><a href="https://password-manager-hzui.onrender.com">https://password-manager-hzui.onrender.com</a></p>
    </div>

    <div class="section">
      <h2>Quick prerequisites</h2>
      <ul class="muted">
        <li>Node.js 22 (match the project's <code>.nvmrc</code> / package engines)</li>
        <li>NPM or Yarn</li>
        <li>A Supabase project (Auth + Postgres)</li>
      </ul>
    </div>

    <div class="section">
      <h2>Environment variables</h2>
      <p class="muted">Create a <code>.env.local</code> in the project root with the following variables (replace values with your Supabase project info):</p>
      <pre><code>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BASE_URL=https://password-manager-hzui.onrender.com
</code></pre>
      <p class="muted">The <code>NEXT_PUBLIC_BASE_URL</code> is used so confirmation and reset emails point to the deployed site. For local testing you may also add <code>http://localhost:3000</code> to Supabase Redirect URLs.</p>
    </div>

    <div class="section">
      <h2>Local development</h2>
      <p class="muted">Run the app locally:</p>
      <pre><code># install dependencies
npm install

# run dev server
npm run dev
</code></pre>
      <p class="muted">Open <code>http://localhost:3000</code>. Use the Signup flow to create an account and follow the email confirmation prompt (or configure Supabase to deliver to a test inbox).</p>
    </div>

    <div class="section">
      <h2>Production build</h2>
      <pre><code>npm ci
npm run build
npm run start
</code></pre>
      <p class="muted">The project uses Next.js with an app router. The build above produces an optimized production bundle.</p>
    </div>

    <div class="section">
      <h2>Render deployment (recommended)</h2>
      <p class="muted">This repo includes a <code>render.yaml</code> file to help deploy to Render. Use these settings in the Render service UI if you prefer manual configuration:</p>
      <ul class="muted">
        <li><strong>Build command</strong>: <code>npm install && npm run build</code></li>
        <li><strong>Start command</strong>: <code>npm run start</code></li>
        <li><strong>Node version</strong>: Ensure the service uses Node 22 (matches <code>.nvmrc</code>)</li>
        <li><strong>Environment variables</strong>: Set the three vars in the Environment settings (Supabase URL, anon key, and <code>NEXT_PUBLIC_BASE_URL</code>)</li>
      </ul>
      <div class="callout muted">Troubleshooting: If Render fails to install dependencies because of registry/tarball issues, switching to <code>npm install</code> (instead of <code>npm ci</code>) in the build step usually resolves transient registry problems.</div>
    </div>

    <div class="section">
      <h2>Supabase configuration</h2>
      <ol class="muted">
        <li>Create a Supabase project and copy the Project URL + anon key into your Render env vars.</li>
        <li>Open <strong>Authentication → Settings → Redirect URLs</strong> and add:
          <pre><code>https://password-manager-hzui.onrender.com/confirm-email
https://password-manager-hzui.onrender.com/reset-password
http://localhost:3000/confirm-email
http://localhost:3000/reset-password
</code></pre>
        </li>
        <li>If you enable OAuth (Google/GitHub), register the provider apps and use the Supabase callback URL <code>https://&lt;project-ref&gt;.supabase.co/auth/v1/callback</code> as the provider redirect.
        </li>
      </ol>
    </div>

    <div class="section">
      <h2>Troubleshooting</h2>
      <p class="muted">If you see build or runtime errors on Render, check the deploy logs for the install/build steps. Common fixes:</p>
      <ul class="muted">
        <li>Set correct Node version (22).</li>
        <li>Use <code>npm install</code> to allow resolution of lockfile oddities.</li>
        <li>Ensure Redirect URLs in Supabase include your deployed domain.</li>
      </ul>
    </div>

    <div class="section muted">
      <h2>Security note</h2>
      <p class="muted">This app implements client-side encryption: the master password never leaves the browser. Only store production-ready versions after a security review. Use strong KDF iteration counts and secure email delivery for confirmations.</p>
    </div>

    <p class="muted" style="margin-top:24px">If you want the README simplified further, or prefer a separate INSTALL.md with step-by-step screenshots, tell me which format you prefer and I will update it.</p>
  </div>
</body>
</html>
# Zero-Knowledge Password Manager

A production-ready, secure password manager built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**. Features client-side encryption ensuring zero-knowledge security - your plaintext passwords never leave your browser.
# Zero‑Knowledge Password Manager

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Next.js](https://img.shields.io/badge/Next.js-14.2-black)

A secure, user-focused password manager built with Next.js and client-side cryptography. This project follows a zero‑knowledge model: encryption and decryption happen in the browser and plaintext secrets are never sent to the server.

This README highlights the core ideas, how to run the project locally, and where to look if you want to contribute or audit the crypto code.

## Quick overview

- Tech: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Supabase (Auth + Postgres)
- Crypto: PBKDF2-SHA256 for key derivation, AES-256-GCM for authenticated encryption
- Security model: Master password never leaves the client; a Vault Key (VK) is wrapped with a KEK derived from the master password

## Why this project exists

It’s designed for people who want simple, auditable password storage with strong client-side encryption. The goal is a lean vault app that demonstrates zero‑knowledge primitives while still being usable in daily workflows.

## Security model (short)

- Master password: only used client-side to derive the Key Encryption Key (KEK)
- VK (Vault Key): a random 256‑bit AES key encrypted (wrapped) with the KEK and stored server-side
- Vault items: encrypted with AES‑256‑GCM using the VK
- Titles are plaintext by default (for UX/search); there is a documented path to encrypt titles for a full ZK mode

Summary data flow:

- Signup: client derives KEK from master password → generates VK → wraps VK with KEK → sends wrapped VK to server
- Login/unlock: client fetches wrapped VK → derives KEK from master password → unwraps VK → uses VK in memory to encrypt/decrypt items

Security properties include unique IVs per item, authenticated encryption, idle auto‑lock, and Supabase row‑level security.

## Quick start (local development)

Prerequisites:
- Node.js 18+ and a package manager (npm, yarn, or pnpm)
- A Supabase project (free tier is fine)

1) Clone and install

```powershell
git clone (https://github.com/4shil/Password-Manager/)
cd password-manager
npm install
```

2) Configure Supabase

- Create a Supabase project and run the SQL migration found at `supabase/migrations/001_init_schema.sql`.
- From the Supabase dashboard, copy your Project URL and Anon Key.

3) Configure environment

Copy the example env file and update values:

```powershell
copy .env.local.example .env.local
```

Edit `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your Supabase values.

4) Run locally

```powershell
npm run dev

# Open http://localhost:3000
```

5) Build for production

```powershell
npm run build
npm run start
```

## Project structure (essential parts)

- `src/app/` — Next.js routes + protected app shell
- `src/components/` — UI components and dialogs
- `src/lib/crypto/` — PBKDF2, AES-GCM, key wrapping, in-memory VK cache (review this for security)
- `src/lib/supabase/` — supabase clients and types
- `supabase/migrations/001_init_schema.sql` — DB schema including RLS policies

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start built app
- `npm run test` — unit tests
- `npm run lint` / `npm run lint:fix` — linting
- `npm run format` — code formatting

## Testing and validation

Unit tests exist for core crypto utilities (PBKDF2, AES‑GCM, key wrapping), base64 helpers, and validators. Run `npm run test` to execute the test suite.

If you plan to audit or ship this code, run the tests and add test vectors (NIST/RFC) for PBKDF2/AES functions.

## Deployment

Recommended: Vercel — connect the repo and set the environment variables shown above.

Other options: Netlify, Docker, or any Node host that supports Next.js. For production, ensure HTTPS and secure environment variable handling.

Note: The project will be deployed soon — a public preview/demo is planned and will be shared once available.

## Planned & Wanted Features

These are the features and improvements we plan to implement. They reflect user requests and common vault functionality that will be added in upcoming releases.

### Full Zero‑Knowledge Mode (planned)

To reach a full zero‑knowledge UX (encrypting titles and metadata):

1. Add `enc_title` and `title_iv` columns to the schema and update RLS accordingly.
2. Update `VaultEditorDialog` to encrypt the title client-side before saving.
3. Store the encrypted title server-side and only fetch/decrypt titles in the client when needed.
4. Implement client-side fuzzy search over decrypted titles (or encrypted indexes) if needed.

### Planned features (shortlist)

- Import/Export: Encrypted vault backup and restore (local JSON file, encrypted with VK).
- Tags and folders: Encrypted metadata stored inside each entry's payload.
- TOTP / 2FA codes: Securely store and display rotating codes for accounts.
- Passkey / WebAuthn: Optional faster unlocks using platform authenticators.
- Secure notes: Longer-form encrypted text documents in the vault.
- Password breach checking: k‑anonymity integration with HaveIBeenPwned (local hashing to preserve privacy).
- Password strength meter: Client-side password strength estimation and suggestions.
- Browser extension: Sync and quick-fill features via a WebExtension.
- Mobile apps / PWA: Offline-first mobile experience and native app wrappers.
- Argon2id KDF (WASM): Optional stronger KDF for users who want it, via a WASM implementation.

### Advanced / Nice-to-have

- Encrypted sharing between users (using public-key envelopes).
- Encrypted, searchable indexes for faster client-side search without revealing plaintext to the server.
- Multi-device secure sync improvements and conflict resolution UI.

If you'd like any of these prioritized or expanded into issues, I can open GitHub issues and draft acceptance criteria and tests for each.

## Configuration highlights

- Idle lock timeout: `NEXT_PUBLIC_IDLE_TIMEOUT_MS` (default: 900000 = 15 minutes)
- PBKDF2 iterations: default is 200,000 (adjust for security/performance tradeoffs)

## Notes for reviewers / contributors

- Crypto code is intentionally small and explicit. If you review, pay special attention to:
  - correct derivation (salt handling, iterations)
  - IV uniqueness and storage
  - memory lifetime of the unwrapped VK (it should only live in memory and be cleared on lock)

- For full zero‑knowledge (encrypt titles), see the planned enhancement in the docs and the `Full Zero‑Knowledge Mode` section in the code comments.

## Contributing

Contributions are welcome. Typical flow:

1. Fork the repo
2. Create a branch: `git checkout -b feature/meaningful-name`
3. Open a PR with a clear description and testing notes

If you change crypto behavior, include tests and a short security rationale in the PR description.

## License

MIT — see the `LICENSE` file.

## Security disclaimer

This project demonstrates strong client-side encryption, but it has not undergone a formal security audit. Do not use this code for critical production secrets without appropriate review and testing. If you plan to deploy for sensitive data, consider a professional security audit.

---


