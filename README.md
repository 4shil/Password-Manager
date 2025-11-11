# Zero-Knowledge Password Manager

A production-ready, secure password manager built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase**. Features client-side encryption ensuring zero-knowledge security - your plaintext passwords never leave your browser.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)

## 🔒 Security Model

### Zero-Knowledge Architecture

1. **Master Password**: Never sent to server, never stored anywhere
2. **Key Encryption Key (KEK)**: Derived from master password using PBKDF2-SHA256 (200,000 iterations)
3. **Vault Key (VK)**: Random 256-bit AES key, encrypted with KEK
4. **Vault Items**: Each encrypted with AES-256-GCM using VK

**Data Flow:**

- **Signup**: Master Password → PBKDF2 → KEK → Wraps VK → Store wrapped VK on server
- **Login**: Fetch wrapped VK → Master Password → PBKDF2 → KEK → Unwrap VK → Cache in memory
- **Encrypt Item**: Plaintext → AES-GCM(VK) → Ciphertext → Send to server
- **Decrypt Item**: Fetch ciphertext → AES-GCM-Decrypt(VK) → Plaintext (browser only)

### What's Encrypted

- ✅ Password (always)
- ✅ Username
- ✅ URL
- ✅ Notes
- ✅ Custom fields
- ⚠️ Title (plaintext for search/UX - see "Full ZK Mode" below)

### Security Features

- **PBKDF2-SHA256** with 200,000+ iterations for key derivation
- **AES-256-GCM** authenticated encryption
- **Unique IV** for every encryption operation
- **Idle auto-lock** after 15 minutes (configurable)
- **Manual lock** button
- **CSP headers** restricting connections
- **Row-Level Security** in Supabase
- **No console logs** of sensitive data in production

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Supabase** account (free tier works)

### 1. Clone and Install

```powershell
git clone <your-repo-url> zero-knowledge-password-manager
cd zero-knowledge-password-manager
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```sql
   # Copy content from supabase/migrations/001_init_schema.sql
   ```
3. Note your **Project URL** and **Anon Key** from Settings → API

### 3. Configure Environment

Copy `.env.local.example` to `.env.local`:

```powershell
copy .env.local.example .env.local
```

**The file already contains your provided credentials:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://vcyheqaywyuzyczjrcfo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```powershell
npm run build
npm run start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Landing page
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup with master password setup
│   └── app/                    # Protected vault application
│       ├── layout.tsx          # App shell (header, sidebar)
│       ├── page.tsx            # Vault item list
│       └── unlock/page.tsx     # Master password unlock prompt
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── ThemeProvider.tsx       # next-themes wrapper
│   ├── ThemeToggle.tsx         # Light/dark mode toggle
│   ├── Header.tsx              # App header with search & lock
│   ├── VaultList.tsx           # List of vault items
│   ├── VaultItemCard.tsx       # Individual item display
│   ├── VaultEditorDialog.tsx   # Create/edit vault item dialog
│   ├── PasswordGenerator.tsx   # Secure password generator
│   └── CopyButton.tsx          # Copy to clipboard button
├── lib/
│   ├── crypto/
│   │   ├── derive.ts           # PBKDF2 key derivation
│   │   ├── aes.ts              # AES-GCM encryption/decryption
│   │   ├── keys.ts             # Vault key generation & wrapping
│   │   └── memory.ts           # In-memory VK cache with timeout
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   └── database.types.ts   # Generated types
│   ├── utils.ts                # Base64, safe JSON helpers
│   ├── validators.ts           # Zod schemas
│   └── cn.ts                   # Tailwind merge utility
├── styles/
│   └── theme.css               # OKLCH color tokens
└── supabase/
    └── migrations/
        └── 001_init_schema.sql # Database schema with RLS
```

## 🎨 Theme & Design

The app uses **OKLCH color space** for consistent, accessible colors across light and dark modes.

- **Light Mode**: High contrast, clean whites
- **Dark Mode**: True dark theme with reduced eye strain
- **System-aware**: Automatically follows OS preference
- **Persistent**: Theme choice saved to localStorage

All colors defined in `src/styles/theme.css` using CSS custom properties.

## 🧪 Testing

```powershell
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

### Test Coverage

- ✅ Crypto utilities (PBKDF2, AES-GCM, key wrapping)
- ✅ Base64 encoding/decoding
- ✅ Password generation
- ✅ Form validation schemas

## 🔐 Usage Workflow

### First Time Setup

1. **Sign Up** with email/password (Supabase auth)
2. **Create Master Password** (distinct from login password)
   - Minimum 12 characters
   - Used to derive encryption keys
   - **Never** recoverable - write it down safely!
3. System generates Vault Key (VK) and encrypts it with your master password

### Daily Use

1. **Log In** with email/password
2. **Unlock Vault** with master password
3. **Add/Edit/Delete** password entries
4. **Copy** passwords with one click
5. **Lock** manually or wait for auto-lock (15 min)

### Password Generator

- Length: 8-128 characters
- Options: lowercase, uppercase, digits, symbols
- Cryptographically secure (`crypto.getRandomValues`)
- Live preview and copy

## 📊 Database Schema

### `user_keys` Table

Stores wrapped vault key per user:

| Column              | Type | Description                             |
| ------------------- | ---- | --------------------------------------- |
| `user_id`           | UUID | FK to auth.users                        |
| `kdf`               | TEXT | Key derivation function (pbkdf2-sha256) |
| `kdf_iterations`    | INT  | Iteration count (200,000+)              |
| `salt`              | TEXT | Base64 salt for KEK derivation          |
| `vault_key_wrapped` | TEXT | AES-GCM encrypted VK                    |
| `vk_iv`             | TEXT | IV for VK wrapping                      |

### `vault_items` Table

Stores encrypted password entries:

| Column        | Type      | Description                    |
| ------------- | --------- | ------------------------------ |
| `id`          | UUID      | Primary key                    |
| `user_id`     | UUID      | FK to auth.users               |
| `title`       | TEXT      | Plaintext title (for search)   |
| `enc_payload` | TEXT      | AES-GCM encrypted JSON payload |
| `iv`          | TEXT      | Unique IV for this item        |
| `deleted_at`  | TIMESTAMP | Soft delete timestamp          |

**RLS Policies**: Users can only access their own data.

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
   ```
4. Deploy!

### Other Platforms

- **Netlify**: Works with Next.js adapter
- **Self-hosted**: Use `npm run build && npm run start`
- **Docker**: Create Dockerfile with Node 18+ base image

## 🔧 Configuration

### Idle Timeout

Default: 15 minutes (900,000 ms)

Change in `.env.local`:

```env
NEXT_PUBLIC_IDLE_TIMEOUT_MS=600000  # 10 minutes
```

### PBKDF2 Iterations

Default: 200,000 iterations

Increase for more security (slower):

```typescript
// src/lib/crypto/derive.ts
const DEFAULT_ITERATIONS = 300000;
```

## 🔮 Future Enhancements

### Full Zero-Knowledge Mode

Encrypt `title` field client-side:

1. Modify schema to add `enc_title` and `title_iv` columns
2. Update `VaultEditorDialog` to encrypt title before saving
3. Decrypt titles client-side when loading vault
4. Implement client-side fuzzy search over decrypted titles

### Advanced Features

- [ ] **Import/Export** encrypted vault backup (JSON file)
- [ ] **Tags/Folders** (stored in encrypted payload)
- [ ] **TOTP/2FA codes** with timer
- [ ] **Passkey/WebAuthn** support for quick unlock
- [ ] **Secure notes** (encrypted text documents)
- [ ] **Password breach check** (via HaveIBeenPwned API, k-anonymity)
- [ ] **Password strength meter**
- [ ] **Browser extension** (WebExtension API)
- [ ] **Mobile apps** (React Native or PWA)
- [ ] **Argon2id** key derivation (via WASM)

## 🛡️ Security Best Practices

### For Users

- ✅ Use a **strong, unique** master password
- ✅ **Write down** your master password securely (paper, safe)
- ✅ Enable **2FA** on your Supabase auth email
- ✅ **Lock** the vault when stepping away
- ❌ **Never** share your master password
- ❌ **Don't** reuse your login password as master password

### For Developers

- ✅ **Audit** crypto code carefully
- ✅ **Test** with known test vectors (NIST, RFC examples)
- ✅ **Never log** plaintext secrets (even in dev mode)
- ✅ **Use HTTPS** everywhere (Vercel provides automatically)
- ✅ **Keep dependencies updated** (run `npm audit`)
- ✅ **Review** Supabase RLS policies regularly
- ❌ **Don't** disable CSP headers
- ❌ **Don't** store VK in localStorage (only memory)

## 🐛 Troubleshooting

### "Failed to unwrap vault key"

- **Cause**: Incorrect master password
- **Fix**: Re-enter correct master password

### "Vault is locked"

- **Cause**: Idle timeout or manual lock
- **Fix**: Click "Unlock" and re-enter master password

### TypeScript errors after install

- **Cause**: Missing `@types` packages
- **Fix**: Run `npm install` again, ensure `@types/node` is installed

### Supabase connection errors

- **Cause**: Incorrect env variables or network issues
- **Fix**: Verify `.env.local` credentials, check Supabase dashboard status

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/zk-password-manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/zk-password-manager/discussions)

## ✨ Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Auth and database by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)
- Inspired by zero-knowledge principles from [Bitwarden](https://bitwarden.com/) and [1Password](https://1password.com/)

---

**⚠️ Security Disclaimer**: This is a demonstration project. While it implements strong cryptographic principles, it has not undergone professional security audit. Use at your own risk for production data. Always maintain backups of critical passwords.

**Made with 🔐 for privacy-conscious users**
