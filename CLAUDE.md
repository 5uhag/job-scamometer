# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Run the backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API at http://localhost:8000
```

**Run the frontend:**
Open `frontend/index.html` directly in a browser or use VS Code Live Server. No build step.

**Test the API manually:**
```bash
# Health check
curl http://localhost:8000/

# Text analysis
curl -X POST http://localhost:8000/analyse/text -F "text=your offer letter text here"

# PDF analysis
curl -X POST http://localhost:8000/analyse/pdf -F "file=@sample_letters/scam_sample.txt"
```

## Architecture

Stateless two-tier app — no database, everything computed per request.

**Backend (`backend/`)** — FastAPI (Python)
- `rules.py` — all detection logic as two lists of flag dicts: `RED_FLAGS` and `GREEN_FLAGS`. Each flag has `id`, `name`, `weight`, `check` (lambda over raw text string), and `message`. Adding a rule = appending a dict to one of these lists.
- `scorer.py` — calls `run_rules()`, computes `normalized = max(0, min(100, 50 + green_score - red_score))`, returns verdict + trimmed flag lists. Thresholds: ≥70 = LIKELY GENUINE, ≥40 = SUSPICIOUS, <40 = HIGH RISK.
- `main.py` — two POST endpoints: `/analyse/text` (form field `text`) and `/analyse/pdf` (file upload). PDF text extracted with PyMuPDF (`fitz`) before passing to `scorer.score()`.

**Frontend (`frontend/`)** — vanilla HTML/CSS/JS, no framework
- `app.js:1` — `API_URL` hardcoded to `http://localhost:8000`; change to Render URL for production.
- Two input modes via tabs: PDF drag-and-drop (`/analyse/pdf`) and plain text paste (`/analyse/text`).
- `renderResult(data)` in `app.js` builds the verdict card and flag cards from the API JSON response.
- `style.css` uses CSS custom properties (`--green`, `--amber`, `--red`) matching the API's `color` field.

**Scoring weights:**

| ID  | Red flag                    | Weight |
|-----|-----------------------------|--------|
| R01 | Free email sender           | 25     |
| R02 | Upfront payment demand      | 40     |
| R03 | No company address          | 15     |
| R04 | CIN / GST missing           | 15     |
| R05 | Unrealistic salary          | 20     |
| R06 | WFH + high pay combo        | 15     |
| R07 | Urgency language            | 10     |
| R08 | Sensitive doc request       | 20     |
| R09 | No HR name / designation    | 10     |
| R10 | Spelling / grammar errors   | 10     |

| ID  | Green flag                  | Weight |
|-----|-----------------------------|--------|
| G01 | Corporate domain email      | 20     |
| G02 | CIN number present          | 20     |
| G03 | Joining date specified      | 10     |
| G04 | Office location specified   | 10     |
| G05 | Probation / notice period   | 10     |
| G06 | Designation clearly stated  | 10     |
| G07 | PF / ESI / benefits         | 10     |
| G08 | Signed by named authority   | 10     |

## What's Done vs What's Left

### Done ✅
- **Backend** fully implemented: all 10 red + 8 green flag rules, weighted scorer, FastAPI endpoints for text and PDF
- **Frontend** fully implemented: tab UI, drag-and-drop PDF zone, text paste, verdict card, flag cards with spinner
- **Sample letters**: `genuine_sample.txt` (CIN, PF, corporate email) and `scam_sample.txt` (payment demand, urgency, gmail, grammar errors)
- **README.md** with setup, deployment, and folder structure
- **`.github/ISSUE_TEMPLATE.md`** for community scam pattern submissions

### Not Done Yet ❌
- **LICENSE file** — Apache 2.0 (plan says to add; GitHub can auto-generate it)
- **`/docs` folder** — frontend must be copied here for GitHub Pages (currently in `/frontend`)
- **`API_URL` update** in `app.js:1` — still points to localhost; needs the live Render URL after deploy
- **Share result** — shareable URL with score encoded as query param
- **OG image** — `og:image` meta tag missing from `index.html` (og:title and og:description are there)
- **PWA** — `manifest.json` + service worker (phone install support)
- **Analytics** — Plausible.io or Cloudflare Web Analytics
- **`patterns.json`** — community-contributed pattern database (currently rules are hardcoded in `rules.py`)
- **Flag submission form** — link to Google Form in footer

## Deployment

**Backend (Render.com free tier):**
1. Push repo to GitHub
2. Render → New Web Service → Root: `backend/`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Copy Render URL → paste into `frontend/app.js` line 1 as `API_URL`

**Frontend (GitHub Pages):**
1. Copy `frontend/` contents into `/docs` at repo root
2. Settings → Pages → Source: `main` branch, `/docs` folder
3. Live at `https://5uhag.github.io/job-scamometer`
