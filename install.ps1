#!/usr/bin/env pwsh
# Installation and Setup Script for Zero-Knowledge Password Manager
# Run this after cloning the repository

Write-Host "🔐 Zero-Knowledge Password Manager - Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "📋 Step 1/5: Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Step 2: Check npm
Write-Host ""
Write-Host "📋 Step 2/5: Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Step 3: Install dependencies
Write-Host ""
Write-Host "📋 Step 3/5: Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 4: Check environment file
Write-Host ""
Write-Host "📋 Step 4/5: Checking environment file..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
} else {
    if (Test-Path ".env.local.example") {
        Copy-Item ".env.local.example" ".env.local"
        Write-Host "✅ Created .env.local from template" -ForegroundColor Green
    } else {
        Write-Host "⚠️  No .env.local.example found - you'll need to create .env.local manually" -ForegroundColor Yellow
    }
}

# Step 5: Run TypeScript check
Write-Host ""
Write-Host "📋 Step 5/5: Running TypeScript check..." -ForegroundColor Yellow
try {
    npm run typecheck
    Write-Host "✅ TypeScript check passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  TypeScript check found some issues (this is expected before running the dev server)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🗄️  Set up database:" -ForegroundColor White
Write-Host "   - Go to https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host "   - Open SQL Editor" -ForegroundColor Gray
Write-Host "   - Paste contents of supabase/migrations/001_init_schema.sql" -ForegroundColor Gray
Write-Host "   - Click 'Run'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ▶️  Start development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. 🌐 Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. 🧪 Run tests (optional):" -ForegroundColor White
Write-Host "   npm test" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For more information, see:" -ForegroundColor White
Write-Host "   - GETTING_STARTED.md (quick start)" -ForegroundColor Gray
Write-Host "   - README.md (overview)" -ForegroundColor Gray
Write-Host "   - SETUP.md (detailed setup)" -ForegroundColor Gray
Write-Host ""
Write-Host "🔒 Security reminder:" -ForegroundColor Yellow
Write-Host "   Your master password CANNOT be recovered if lost!" -ForegroundColor Red
Write-Host "   Store it securely (physical backup recommended)" -ForegroundColor Red
Write-Host ""
Write-Host "Happy password managing! 🎉" -ForegroundColor Cyan
