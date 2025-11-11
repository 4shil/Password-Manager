# Deploying to Render (Next.js 14)

This guide sets up a reliable Render deployment for this Next.js app and explains port binding (required on Render) plus common 502 fixes. It also includes local dev steps for Windows.

## Prerequisites
- A GitHub repo connected to Render
- Supabase project with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 1) Create a Web Service on Render
1. New → Web Service → Connect GitHub → choose `4shil/Password-Manager` (or your fork).
2. Name: `Password-Manager` (any name is fine)
3. Environment/Language: `Node`
4. Branch: `main`
5. Root Directory: leave blank (repo root)
6. Region: choose the closest region to your users

### Build & Start commands
- Build Command:
  ```sh
  npm ci && npm run build
  ```
- Start Command:
  ```sh
  npm run start
  ```

### Node version
Set Node to 18.x (Next.js 14 is tested on Node 18):
- Either in the Render UI (Environment → Node Version: `18`) or
- Use the package.json field (already added):
  ```json
  "engines": { "node": "18.x" }
  ```

### Environment variables (Render → Environment)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Note: The Supabase anon key is safe to expose to browsers but still treat it carefully (do not commit secrets).

## 2) Port binding on Render (critical)
Render assigns your service a port via the `PORT` environment variable. Your app must listen on that port and on `0.0.0.0`.

- With Next.js + `next start`, this works automatically — no changes required.
- If you ever use a custom Node server, ensure it binds like:
  ```js
  const port = process.env.PORT || 3000;
  server.listen(port, '0.0.0.0', () => console.log(`Listening on ${port}`));
  ```

If your app binds to a hardcoded port (e.g., 3000) or `localhost` only, Render’s health checks will fail and you’ll see 502 Bad Gateway.

## 3) 502 Bad Gateway — checklist
If you get a 502 after deploy, check these in order:

1) Build step actually installed deps
- Symptom: logs show `sh: 1: next: not found` during `npm run build`.
- Fix: Make Build Command `npm ci && npm run build` so dependencies install before build.

2) Node version is 18
- Set Node to 18.x in Render UI (or keep `"engines": { "node": "18.x" }`).

3) Environment variables present
- Ensure `NEXT_PUBLIC_*` vars exist in Render. Missing env vars can crash the app at startup.

4) Port binding is correct
- For Next.js `next start`, it’s handled. For custom servers, bind to `process.env.PORT` and `0.0.0.0`.

5) Health checks and logs
- Health check path: `/` (default). After deploy, watch logs for a startup message. If the process restarts repeatedly, inspect the stack trace.

## 4) Local development on Windows (PowerShell)
To match the Render environment, use Node 18 locally.

### Option A — nvm-windows (recommended)
1. Install NVM for Windows (one-time):
   - From winget (Admin PowerShell):
     ```powershell
     winget install --id CoreyButler.NVMforWindows -e
     ```
     Or download from https://github.com/coreybutler/nvm-windows/releases
2. Install and use Node 18:
   ```powershell
   nvm install 18.20.4
   nvm use 18.20.4
   node -v   # should print v18.20.4
   ```
3. Install and run:
   ```powershell
   npm ci
   npm run dev
   # open http://localhost:3000
   ```
4. Production-like run:
   ```powershell
   npm ci
   npm run build
   npm run start
   ```

### Option B — keep your Node 24, loosen engines
If you prefer Node 24 locally, either:
- Set Render’s Node version explicitly to 18 in the Render UI and change `package.json` engines locally to a range, e.g. `">=18 <25"`, or
- Add `.npmrc` with `engine-strict=false` (default) to ignore engine warnings.

## 5) Common errors
- `sh: 1: next: not found` during build
  - Dependencies didn’t install before `npm run build`. Use `npm ci && npm run build`.
- `EBADENGINE` warnings locally
  - You’re running Node 24 with `"engines": {"node":"18.x"}`. Either use Node 18 via NVM or loosen the engines range for local dev.
- 502 Bad Gateway after deploy
  - Follow the checklist above. Most often it’s either Node version mismatch, missing env vars, or the build command didn’t install deps.

---

If you want, I can tune the Render settings for your exact repo (build logs + service type) and add a CI/CD note for preview deploys.
