
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


