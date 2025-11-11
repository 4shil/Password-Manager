# Password Reset Troubleshooting Guide

## Issue: "Link Expired" Shows Immediately

If the password reset link shows as expired right away (even though you just received it), this is a **redirect URL configuration issue**, not an actual expiration.

---

## ✅ Solution: Configure Supabase Redirect URLs

### **Step 1: Add Wildcard Redirect URL**

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard/project/vcyheqaywyuzyczjrcfo
2. Navigate to: **Authentication** → **URL Configuration**
3. In **Redirect URLs**, add this line:
   ```
   http://localhost:3000/**
   ```
4. Click **Save**

**Why this is needed:**
- Supabase sends the reset token as a URL hash fragment: `#access_token=...&type=recovery`
- Without the `**` wildcard, Supabase blocks the redirect
- The wildcard allows any path under localhost:3000

---

## 🧪 How to Test

### **1. Check Browser Console**

After clicking the reset link, open browser console (F12) and look for:
```
Reset password - URL hash params: { accessToken: true, refreshToken: true, type: 'recovery' }
```

**If you see `accessToken: false`:**
- The token wasn't passed in the URL
- Check Supabase redirect URL configuration

**If you see the correct values:**
- The reset flow should work
- If still shows expired, check token expiry settings

### **2. Check the URL**

After clicking the email link, the browser URL should look like:
```
http://localhost:3000/reset-password#access_token=eyJhbGc...&type=recovery&refresh_token=...
```

**If the URL doesn't have `#access_token=...`:**
- Redirect URL is not configured correctly
- Add the wildcard as shown above

---

## 📧 Email Template Configuration

### **Verify Reset Password Email Template:**

1. Go to: **Authentication** → **Email Templates** → **Reset Password**
2. The link should use Supabase's variable:
   ```html
   <a href="{{ .ConfirmationURL }}">Reset password</a>
   ```
3. **DO NOT** hardcode the URL like:
   ```html
   <!-- ❌ WRONG -->
   <a href="http://localhost:3000/reset-password">Reset password</a>
   ```

### **Recommended Template:**

```html
<h2>Reset your password</h2>

<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link expires in 1 hour.</p>

<p>If you didn't request this, you can safely ignore this email.</p>
```

---

## ⚙️ Complete Redirect URL List

Add all these to **Authentication** → **URL Configuration** → **Redirect URLs**:

```
http://localhost:3000/**
http://localhost:3000/reset-password
http://localhost:3000/confirm-email
http://localhost:3000/setup-vault
http://localhost:3000/app
```

For production, also add:
```
https://your-domain.com/**
https://your-domain.com/reset-password
https://your-domain.com/confirm-email
https://your-domain.com/setup-vault
https://your-domain.com/app
```

---

## 🔍 Debugging Steps

### **1. Request a fresh reset link:**
```
1. Go to: http://localhost:3000/login
2. Click "Forgot password?"
3. Enter your email
4. Check email inbox
```

### **2. Before clicking the link:**
```
1. Right-click the "Reset password" button in email
2. Copy link address
3. Paste in notepad - should contain "?token=" or similar
```

### **3. After clicking the link:**
```
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for the logged URL parameters
4. Should show access_token: true
```

### **4. If still not working:**
```
1. Clear browser cache and cookies
2. Try in incognito/private window
3. Check Supabase project is active (not paused)
4. Verify API keys in .env.local are correct
```

---

## ✅ Success Criteria

After proper configuration, you should see:

1. **In email:** Link with token parameter
2. **In browser URL:** `#access_token=...` hash fragment
3. **In console:** `{ accessToken: true, refreshToken: true, type: 'recovery' }`
4. **On page:** Password reset form (not "Link Expired" message)

---

## 📞 Still Having Issues?

If after following all steps above it still doesn't work:

1. **Check Supabase service status**: https://status.supabase.com
2. **Verify project is active**: Not paused or deleted
3. **Check email spam folder**: Reset emails might be filtered
4. **Try a different email**: Some providers block auth emails

---

**After configuring the wildcard redirect URL, request a new reset link and try again!** 🎉
