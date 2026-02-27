# Password Manager

A zero-knowledge password manager. Your plaintext passwords never leave the browser — encryption and decryption happen entirely client-side using Argon2id and AES-256-GCM.

![password manager interface](https://media.giphy.com/media/077i6AULCXc0FKTj9s/giphy.gif)

## Security Model

```
Password --> Supabase Auth + Argon2id --> KEK --> Unwrap Vault Key --> Decrypt Items
```

| Layer           | Technology          | Purpose                     |
|-----------------|---------------------|-----------------------------|
| Authentication  | Supabase Auth       | User identity               |
| Key Derivation  | Argon2id (64MB, 4t) | Derive encryption key       |
| Key Wrapping    | AES-256-GCM         | Protect vault key at rest   |
| Data Encryption | AES-256-GCM         | Encrypt stored passwords    |

Your password is never sent to the server. Supabase holds only encrypted ciphertext. There is no recovery option — if you forget your password, your vault is unrecoverable.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Auth + PostgreSQL)
- Argon2id (via `argon2-browser`)
- Web Crypto API

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### Setup

```bash
git clone https://github.com/4shil/Password-Manager.git
cd Password-Manager
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Run the database migration in your Supabase SQL editor:

```bash
# File: supabase/migrations/001_init_schema.sql
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

The migration at `supabase/migrations/001_init_schema.sql` creates:

- `vault_keys` — encrypted vault key per user
- `vault_items` — encrypted password entries

Row Level Security is enabled on both tables.

## Project Structure

```
Password-Manager/
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # UI components (vault list, item form, etc.)
│   ├── hooks/          # React hooks (useVault, useAuth, etc.)
│   ├── lib/            # Crypto (Argon2id, AES-GCM), Supabase client
│   └── styles/
├── supabase/
│   └── migrations/
└── __tests__/
```

## Environment Variables

| Variable                       | Description                    |
|-------------------------------|--------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | Supabase project URL           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key       |

## License

MIT
