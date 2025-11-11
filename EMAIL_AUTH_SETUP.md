# Email Authentication Setup Guide

## ✅ Features Added

1. **Forgot Password** - Users can reset their account password via email
2. **Email Confirmation** - Users must confirm their email before setting up vault
3. **Separate Vault Setup** - Master password setup happens after email confirmation

---

## 🔧 Supabase Configuration Required

### **Step 1: Enable Email Confirmation**

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard/project/vcyheqaywyuzyczjrcfo
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider
4. **Enable** "Confirm email" toggle
5. Click **Save**

### **Step 2: Configure Email Templates**

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**

2. **For "Confirm signup" template**, update the confirmation URL:
   ```
   {{ .ConfirmationURL }}
   ```
   Should redirect to:
   ```
   http://localhost:3000/confirm-email
   ```
   Or for production:
   ```
   https://your-domain.com/confirm-email
   ```

3. **For "Reset Password" template**, update the reset URL:
   ```
   {{ .ConfirmationURL }}
   ```
   Should redirect to:
   ```
   http://localhost:3000/reset-password
   ```
   Or for production:
   ```
   https://your-domain.com/reset-password
   ```

### **Step 3: Configure Site URL**

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs** (IMPORTANT - add wildcard):
   - `http://localhost:3000/**`
   - `http://localhost:3000/reset-password`
   - `http://localhost:3000/confirm-email`
   - `http://localhost:3000/setup-vault`
   - (Add production URLs when deploying)

**Important:** The `**` wildcard is required to allow Supabase to redirect with hash parameters (like `#access_token=...`).
   - (Add production URLs when deploying)

---

## 📧 Email Templates (Recommended)

### Confirm Signup Template

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
```

### Reset Password Template

```html
<h2>Reset your password</h2>

<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't request this, you can safely ignore this email.</p>
```

---

## 🔄 New User Flow

### With Email Confirmation Enabled:

1. **User signs up** with email + account password
2. **Email sent** with confirmation link
3. **User clicks link** → redirected to `/confirm-email`
4. **User sets master password** at `/setup-vault`
5. **Vault created** → user can log in

### Login Flow:

1. **User enters** email + account password
2. **If forgot password** → Click "Forgot password?" link
3. **Email sent** with reset link
4. **User clicks link** → redirected to `/reset-password`
5. **User sets new password** → can log in again

---

## 📁 Files Created

### Components:
- `src/components/ForgotPasswordDialog.tsx` - Forgot password modal

### Pages:
- `src/app/reset-password/page.tsx` - Reset password form
- `src/app/confirm-email/page.tsx` - Email confirmation handler
- `src/app/setup-vault/page.tsx` - Master password setup (post-confirmation)

### Updates:
- `src/app/login/page.tsx` - Added "Forgot password?" link
- `src/app/signup/page.tsx` - Updated to handle email confirmation

---

## 🧪 Testing the Flow

### Test Signup with Email Confirmation:

1. **Start dev server**: `npm run dev`
2. **Go to**: http://localhost:3000/signup
3. **Fill form** with:
   - Email
   - Account password (8+ chars)
   - Confirm password
   - Master password (12+ chars)
   - Confirm master password
4. **Click "Create vault"**
5. **Check email** for confirmation link
6. **Click link** → redirected to confirm-email page
7. **Automatically redirected** to setup-vault
8. **Master password already saved** → redirected to /app

### Test Forgot Password:

1. **Go to**: http://localhost:3000/login
2. **Click** "Forgot password?" link
3. **Enter email** and click "Send Reset Link"
4. **Check email** for reset link
5. **Click link** → redirected to reset-password page
6. **Enter new password** and confirm
7. **Click "Reset Password"**
8. **Redirected to login** → can log in with new password

---

## ⚠️ Important Notes

### Account Password vs Master Password:

- **Account Password**: Used for Supabase authentication (can be reset via email)
- **Master Password**: Encrypts your vault (CANNOT be reset - if lost, data is gone)

### Email Provider:

- **Development**: Supabase uses their SMTP server (limited emails/hour)
- **Production**: Configure custom SMTP in **Settings** → **Auth** → **SMTP Settings**

### Security:

- Email confirmation prevents spam signups
- Password reset only resets **account password**, not master password
- Master password is never sent to server or stored anywhere
- **Password reset tokens expire after 1 hour** (configurable in Supabase)

---

## ⏰ Token Expiration Settings

### Configure Token Expiration in Supabase:

1. Go to **Authentication** → **Providers** → **Email**
2. Set **Password Recovery Token Expiry**: Default is 3600 seconds (1 hour)
3. Can be increased up to 86400 seconds (24 hours)
4. Recommended: Keep at 1 hour for security

### If Reset Link Expired:

1. User can request a new reset link
2. Click "Forgot password?" again on login page
3. New email will be sent with fresh token

---

## 🚀 Quick Start

After configuring Supabase (Steps 1-3 above):

```powershell
# Restart dev server to apply changes
npm run dev
```

Then test the complete flow!

---

## 📝 Production Deployment Checklist

- [ ] Configure custom SMTP provider
- [ ] Update email templates with production URLs
- [ ] Add production domain to Redirect URLs
- [ ] Set Site URL to production domain
- [ ] Test email delivery
- [ ] Monitor email sending limits

---

**Everything is now set up for email confirmation and password reset!** 🎉
