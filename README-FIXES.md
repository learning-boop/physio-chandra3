# Physio Chandra — Pain Mapper fixes

Three issues were fixed. Drop these files into your existing project
(same folder structure), then follow "How to run" below.

## ⚠️ SECURITY — do this first
A real Anthropic API key was committed inside `server/.env.example`
(a template file that normally goes into git). Treat it as **public/leaked**:

1. Go to https://console.anthropic.com/settings/keys and **revoke** that key.
2. Create a **new** key.
3. Put the new key in `server/.env` (NOT `.env.example`):
   `ANTHROPIC_API_KEY=sk-ant-...your-new-key...`

A `.gitignore` is now included so `.env` files are never committed again.

---

## 1. "Failed to fetch" / AI analysis doesn't load
**Cause:** "Failed to fetch" is a network error — the browser never reached the
backend. The backend is a **separate Node server** in `/server` that must be
running. Two extra problems made it worse:
- `server/.env.example` was malformed: `ANTHROPIC_API_KEY=VITE_API_URL=sk-ant-...`
  (two variables on one line → the key was invalid → every call would 500).
- In production the frontend called `http://localhost:4000`, which points at the
  *visitor's* own machine and is blocked as mixed content on an HTTPS site.

**Fixed:**
- Frontend now calls the relative path `/api/pain-analysis`; `vite.config.js`
  proxies that to the backend in dev (no CORS, no mixed-content).
- `.env` files corrected to a clean, single-value format.
- Backend now validates the key on startup and, if the AI is unreachable,
  returns safe general content instead of an error, so the panel always works.
- Clearer error message in the panel when the backend really is down.

## 2. Body shows only half / want full body
**Cause:** the camera couldn't fit the model. The body is ~4 units tall, but at
the old field-of-view and max zoom the visible area was shorter, so the legs were
always clipped.

**Fixed:** reframed the camera (fov 36, distance 7.2, target at the body's
centre, higher max-zoom) so the whole figure is visible on load.

## 3. Pain points don't sit on the body
**Cause:** the marker coordinates were hand-eyeballed and asymmetric, so they
floated off this Tripo-generated mesh; clipped framing hid the lower ones too.

**Fixed:** markers are now derived from the model's real measured proportions
(symmetric left/right) and **snapped onto the actual mesh surface** by raycasting,
with a safe fallback. If the model ever loads facing away, flip `FRONT_Z_SIGN`
to `-1` at the top of `Body3D.jsx`.

---

## How to run (local)
Open **two terminals**.

Terminal 1 — backend:
```
cd server
npm install
npm start            # runs on http://localhost:4000
```

Terminal 2 — frontend:
```
npm install
npm run dev          # Vite proxies /api -> :4000 automatically
```

## Production notes (your AWS EC2 + Nginx setup)
Easiest: keep the frontend calling `/api` and reverse-proxy it to Node:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
}
```
Then leave `VITE_API_URL` blank. (Alternatively, if the backend is on a
different domain, set `VITE_API_URL=https://api.your-domain.com` and enable CORS
for that origin in `server/index.js`.) Run the Node server under PM2 like your
other services.
