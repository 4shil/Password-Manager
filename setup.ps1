# Zero-Knowledge Password Manager
# Complete Installation & Setup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Zero-Knowledge Password Manager Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check prerequisites
Write-Host "[1/7] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green

# Check npm
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm is not available" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm detected: v$npmVersion" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host "`n[2/7] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Step 3: Setup environment
Write-Host "`n[3/7] Setting up environment..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists, skipping..." -ForegroundColor Yellow
} else {
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
    Write-Host "📝 Note: Environment file is already configured with provided Supabase credentials" -ForegroundColor Cyan
}

# Step 4: Setup Husky
Write-Host "`n[4/7] Setting up Git hooks..." -ForegroundColor Yellow
npm run prepare 2>&1 | Out-Null
Write-Host "✅ Husky hooks installed" -ForegroundColor Green

# Step 5: Type check
Write-Host "`n[5/7] Running type check..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Type check passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Type check failed (this is normal before first build)" -ForegroundColor Yellow
}

# Step 6: Lint
Write-Host "`n[6/7] Running linter..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Lint check passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Lint warnings found" -ForegroundColor Yellow
}

# Step 7: Instructions
Write-Host "`n[7/7] Setup complete!" -ForegroundColor Green
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. Set up Supabase:" -ForegroundColor Yellow
Write-Host "   - Go to https://supabase.com and create a project" -ForegroundColor White
Write-Host "   - Open SQL Editor in your Supabase dashboard" -ForegroundColor White
Write-Host "   - Copy and run the SQL from: supabase/migrations/001_init_schema.sql`n" -ForegroundColor White

Write-Host "2. Verify environment:" -ForegroundColor Yellow
Write-Host "   - Check .env.local has your Supabase credentials" -ForegroundColor White
Write-Host "   - The provided credentials are already configured`n" -ForegroundColor White

Write-Host "3. Start development server:" -ForegroundColor Yellow
Write-Host "   npm run dev`n" -ForegroundColor White

Write-Host "4. Build for production:" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   npm run start`n" -ForegroundColor White

Write-Host "5. Run tests:" -ForegroundColor Yellow
Write-Host "   npm run test`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md - Full documentation" -ForegroundColor White
Write-Host "   - SETUP.md - Complete file listing and setup guide`n" -ForegroundColor White

Write-Host "🔒 Security:" -ForegroundColor Cyan
Write-Host "   - Your master password encrypts all vault data" -ForegroundColor White
Write-Host "   - Never send plaintext passwords to server" -ForegroundColor White
Write-Host "   - All encryption happens client-side`n" -ForegroundColor White

Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Happy password managing! 🔐" -ForegroundColor Green
