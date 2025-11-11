# Quick Reference Commands

## Development

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Code Quality

```powershell
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check

# Run all tests
npm run test

# Watch mode for tests
npm run test:watch
```

## Database

1. Create Supabase project at https://supabase.com
2. Run migration:
   ```sql
   -- Copy content from supabase/migrations/001_init_schema.sql
   -- Paste into Supabase SQL Editor and execute
   ```

## Environment Setup

```powershell
# Copy environment template
copy .env.local.example .env.local

# Edit .env.local with your credentials (already configured)
```

## Git Workflow

```powershell
# Husky will automatically run on commit:
# - ESLint fixes
# - Prettier formatting

# Manual checks before committing:
npm run typecheck
npm run lint
npm run test
```

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Troubleshooting

### TypeScript Errors

```powershell
# Clean build
rm -rf .next
npm run build
```

### Dependency Issues

```powershell
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Database Connection

- Verify `.env.local` credentials
- Check Supabase dashboard status
- Ensure migration was executed

## File Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utilities and libraries
│   ├── crypto/      # Encryption utilities
│   └── supabase/    # Database clients
└── styles/          # CSS and themes

supabase/
└── migrations/      # Database schemas
```

## Key Features Checklist

- ✅ Email/password authentication (Supabase)
- ✅ Master password for vault encryption
- ✅ PBKDF2-SHA256 key derivation (200k iterations)
- ✅ AES-256-GCM encryption for all secrets
- ✅ Client-side encryption only
- ✅ Row-Level Security (RLS)
- ✅ Idle auto-lock (15 minutes)
- ✅ Manual lock button
- ✅ Password generator
- ✅ Copy to clipboard
- ✅ Dark/light theme
- ✅ Responsive design
- ✅ Type-safe with TypeScript
- ✅ CSP security headers
- ✅ CI/CD with GitHub Actions

## Security Reminders

⚠️ **Master Password**:

- Never stored or sent to server
- Cannot be recovered if lost
- Write it down securely

⚠️ **Zero-Knowledge**:

- Server only sees encrypted ciphertext
- Decryption happens in browser only

⚠️ **Best Practices**:

- Use strong, unique master password
- Enable 2FA on Supabase account
- Keep dependencies updated
- Review RLS policies regularly
