# Zero-Knowledge Password Manager

A secure, user-focused password manager built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**. Features client-side encryption with Argon2id ensuring zero-knowledge security — your plaintext passwords never leave your browser.

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Next.js](https://img.shields.io/badge/Next.js-14.2-black)

---

##  What's New

### Neo Brutalism Design
The entire UI has been redesigned with a **Smooth Neo Brutalism** aesthetic:
- Bold colors (yellow, pink, mint, sky, coral)
- Hard offset shadows (4-8px black)
- Chunky 3px borders
- Playful, bouncy animations using Framer Motion
- Clean, simple English text throughout

###  Dark Mode
Toggle between light and dark themes with smooth transitions. Preference is saved to localStorage.

###  Argon2id Encryption
Upgraded from PBKDF2 to **Argon2id** — the strongest password-based key derivation function available:
- **64 MB memory** (resistant to GPU attacks)
- **4 parallel threads**
- **3 iterations**

### Simplified Authentication
Single password for both login AND encryption — no separate "master password" required. Your vault unlocks automatically when you sign in.

---

##  Security Model

```
Password → Supabase Auth + Argon2id → KEK → Unwrap Vault Key → Decrypt Items
```

| Layer | Technology | Purpose |
|-------|------------|---------|
| Authentication | Supabase Auth | User identity |
| Key Derivation | Argon2id (64MB, 4 threads) | Derive encryption key |
| Key Wrapping | AES-256-GCM | Protect vault key |
| Data Encryption | AES-256-GCM | Encrypt passwords |

**Zero-Knowledge Architecture:**
- Your password is never sent to servers
- Encryption happens entirely in your browser
- We cannot see or recover your data

---

##  Quick Start

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/4shil/Password-Manager/
cd Password-Manager
npm install
```

### 2. Configure Supabase

1. Create a Supabase project
2. Run the migration: `supabase/migrations/001_init_schema.sql`
3. Copy your Project URL and Anon Key from the dashboard

### 3. Set Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials from the dashboard.

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

---

##  Project Structure

```
src/
├── app/                    # Next.js routes
│   ├── page.tsx           # Landing page
│   ├── login/             # Login flow (auto-unlocks vault)
│   ├── signup/            # Account creation
│   └── app/               # Protected vault UI
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── Header.tsx         # App header with theme toggle
│   ├── ThemeToggle.tsx    # Light/dark mode switch
│   ├── UnlockPrompt.tsx   # Re-unlock after timeout
│   └── EncryptionExplainer.tsx  # Scroll-based security section
├── lib/
│   ├── crypto/            # Argon2id, AES-GCM, key management
│   └── supabase/          # Supabase client
└── styles/
    └── theme.css          # Neo-brutalism design tokens
```

---

##  Design System

### Colors
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--background` | #FFFDF5 | #0f0f0f |
| `--surface` | #FFFFFF | #1f1f1f |
| `--text` | #1a1a1a | #ffffff |
| `--yellow` | #FFE156 | #FFE156 |
| `--pink` | #FF6B9D | #FF6B9D |
| `--mint` | #A0F5D3 | #A0F5D3 |
| `--sky` | #7DD3FC | #7DD3FC |

### Animations
- **Framer Motion** for physics-based spring animations
- Button press/ripple effects
- Card hover lift with shadow expansion
- Page transitions with staggered reveals
- Scroll-triggered entrance animations

---

##  Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `NEXT_PUBLIC_IDLE_TIMEOUT_MS` | 900000 | Auto-lock timeout (15 min) |

### Argon2id Parameters
| Parameter | Value | Reasoning |
|-----------|-------|-----------|
| Memory | 64 MB | Resistant to GPU/ASIC attacks |
| Iterations | 3 | OWASP recommended |
| Parallelism | 4 | Multi-core utilization |

---

##  Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint code |
| `npm run format` | Format code |

---

##  Roadmap

### Planned Features
- [ ] Import/Export encrypted backups
- [ ] Tags and folders
- [ ] TOTP / 2FA codes
- [ ] Passkey / WebAuthn unlocks
- [ ] Secure notes
- [ ] Password breach checking (k-anonymity)
- [ ] Browser extension
- [ ] Mobile PWA

---

##  Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes and test
4. Open a PR with description

For crypto changes, include security rationale and tests.

---

##  License

MIT — see `LICENSE` file.

---

## Security Disclaimer

This project demonstrates strong client-side encryption but has not undergone a formal security audit. Do not use for critical production secrets without professional review.

---

**Built by [4shil](https://github.com/4shil)**

📧 **Email:** [ashilklal11@gmail.com](mailto:ashilklal11@gmail.com)  
🐦 **X (Twitter):** [@4sh_il](https://x.com/4sh_il)  
💻 **GitHub:** [github.com/4shil/Password-Manager](https://github.com/4shil/Password-Manager)
