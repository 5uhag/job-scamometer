# Job Scamometer

![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![Made in India](https://img.shields.io/badge/made%20in-India-orange)
![Free to use](https://img.shields.io/badge/cost-%E2%82%B90-green)

Detect fake job offer letters using rule-based analysis. Paste or upload an offer letter and get an instant **0–100 legitimacy score** with a red/green flag breakdown.

> This tool is for awareness only and does not constitute legal advice. Always verify directly with the employer.

## Features

- 10 red-flag rules (free email, upfront payment, urgency language, etc.)
- 8 green-flag rules (CIN present, corporate domain, PF/ESI mentioned, etc.)
- Weighted scoring — high-risk flags (payment demand = 40 pts) outweigh minor ones
- PDF upload + plain text paste
- Zero-cost deployment (GitHub Pages + Render free tier)

## Folder Structure

```
job-scamometer/
├── backend/          # FastAPI app
│   ├── main.py
│   ├── rules.py
│   ├── scorer.py
│   ├── requirements.txt
│   └── Procfile
├── frontend/         # Single-page app (no framework)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── sample_letters/   # Demo inputs
│   ├── genuine_sample.txt
│   └── scam_sample.txt
└── .github/
    └── ISSUE_TEMPLATE.md
```

## Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API at http://localhost:8000
```

**Frontend:**
Open `frontend/index.html` in your browser (or use Live Server in VS Code).
The `API_URL` in `app.js` defaults to `http://localhost:8000`.

## Deployment (Free)

| Layer    | Service       | Notes                            |
|----------|---------------|----------------------------------|
| Frontend | GitHub Pages  | Serve from `/docs` folder        |
| Backend  | Render.com    | 750 hrs/month free               |

**Deploy backend on Render:**
1. Push repo to GitHub
2. render.com → New Web Service → Root: `backend/`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Copy the Render URL → paste into `frontend/app.js` as `API_URL`

**Deploy frontend on GitHub Pages:**
1. Copy `frontend/` contents into `/docs`
2. Settings → Pages → Source: `main`, `/docs`

## Contributing

Found a new scam pattern? Open an issue using the **Submit a scam pattern** template.

## License

Apache 2.0 — see [LICENSE](LICENSE).
