# Job Scamometer — Full Project Plan
**Open Source · Apache 2.0 · Zero Cost Deployment**

> Paste or upload an offer letter. Get an instant red/green flag breakdown
> with a 0–100 legitimacy score.

---

## 1. GitHub Setup

```
Repo name:    job-scamometer
Description:  Detect fake job offer letters using rule-based analysis
Licence:      Apache 2.0  ← select this during repo creation
Topics:       job-scam, offer-letter, fraud-detection, india, python
```

**LICENSE file** — GitHub auto-generates this when you pick Apache 2.0.
Key point for your README: "This tool is for awareness only and does not
constitute legal advice. Always verify directly with the employer."

---

## 2. Folder Structure

```
job-scamometer/
├── backend/
│   ├── main.py            # FastAPI app
│   ├── parser.py          # PDF + text extraction
│   ├── rules.py           # All flag logic lives here
│   ├── scorer.py          # Weighted score + verdict
│   ├── requirements.txt
│   └── Procfile
│
├── frontend/
│   ├── index.html         # Single page app
│   ├── style.css
│   └── app.js             # Fetch API calls, render flags
│
├── sample_letters/        # Add 2-3 fake/real samples for demo
│   ├── genuine_sample.txt
│   └── scam_sample.txt
│
├── LICENSE                # Apache 2.0
├── README.md
└── .github/
    └── ISSUE_TEMPLATE.md  # "Submit a scam pattern you found"
```

---

## 3. Complete Flag Rules  (`backend/rules.py`)

```python
import re

RED_FLAGS = [
    {
        "id": "R01",
        "name": "Free email sender",
        "weight": 25,
        "check": lambda t: bool(re.search(
            r'\b[\w.+-]+@(gmail|yahoo|hotmail|outlook|rediffmail)\.com\b', t, re.I)),
        "message": "Offer sent from a personal email (Gmail/Yahoo). Genuine companies use their own domain."
    },
    {
        "id": "R02",
        "name": "Upfront payment demand",
        "weight": 40,
        "check": lambda t: bool(re.search(
            r'\b(security deposit|registration fee|training fee|pay.*join|'
            r'refundable deposit|courier charge|kit charge)\b', t, re.I)),
        "message": "Letter asks for money before joining. Legitimate companies NEVER charge candidates."
    },
    {
        "id": "R03",
        "name": "No company address",
        "weight": 15,
        "check": lambda t: not bool(re.search(
            r'\b(floor|building|road|street|nagar|layout|phase|sector|'
            r'industrial area|tech park)\b', t, re.I)),
        "message": "No physical office address found. Real offer letters include a registered address."
    },
    {
        "id": "R04",
        "name": "CIN / GST number missing",
        "weight": 15,
        "check": lambda t: not bool(re.search(
            r'\b(CIN|U[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}|'
            r'GSTIN|[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b', t, re.I)),
        "message": "No CIN or GST number found. Registered Indian companies must display their CIN."
    },
    {
        "id": "R05",
        "name": "Unrealistic salary",
        "weight": 20,
        "check": lambda t: bool(re.search(
            r'\b(per day|per hour|[5-9][0-9],000 per month|[1-9][0-9]{2},000 per month)\b', t, re.I)),
        "message": "Salary structure looks unusual — per-day/hour pay or suspiciously high figures for freshers."
    },
    {
        "id": "R06",
        "name": "Work from home with high pay",
        "weight": 15,
        "check": lambda t: bool(re.search(r'\bwork from home\b', t, re.I)) and
                           bool(re.search(r'\b[3-9][0-9],000\b', t)),
        "message": "Combines work-from-home with unusually high salary — a common scam pattern."
    },
    {
        "id": "R07",
        "name": "Urgency / pressure language",
        "weight": 10,
        "check": lambda t: bool(re.search(
            r'\b(respond immediately|within 24 hours|urgent|last chance|'
            r'limited seats|confirm today)\b', t, re.I)),
        "message": "Letter uses high-pressure urgency language to rush your decision."
    },
    {
        "id": "R08",
        "name": "Suspicious attachment request",
        "weight": 20,
        "check": lambda t: bool(re.search(
            r'\b(aadhaar|pan card|bank account|account number|ifsc|'
            r'passport copy|send documents)\b', t, re.I)),
        "message": "Asks for sensitive documents (Aadhaar/PAN/bank details) before formal onboarding."
    },
    {
        "id": "R09",
        "name": "No HR name or designation",
        "weight": 10,
        "check": lambda t: not bool(re.search(
            r'\b(HR|Human Resources|Talent Acquisition|Recruiter|'
            r'Hiring Manager|People Operations)\b', t, re.I)),
        "message": "No HR contact name or designation. Genuine letters are signed by a named person."
    },
    {
        "id": "R10",
        "name": "Excessive spelling / grammar errors",
        "weight": 10,
        "check": lambda t: len(re.findall(
            r'\b(recieve|occured|benifit|accomodation|untill|'
            r'your are|we are pleased to informed)\b', t, re.I)) >= 2,
        "message": "Multiple spelling/grammar errors detected — unusual for a corporate HR document."
    },
]

GREEN_FLAGS = [
    {
        "id": "G01",
        "name": "Corporate domain email",
        "weight": 20,
        "check": lambda t: bool(re.search(
            r'\b[\w.+-]+@(?!gmail|yahoo|hotmail|outlook|rediffmail)'
            r'[a-z0-9-]+\.(com|in|co\.in|org|net)\b', t, re.I)),
        "message": "Email uses a company domain — a strong positive signal."
    },
    {
        "id": "G02",
        "name": "CIN number present",
        "weight": 20,
        "check": lambda t: bool(re.search(
            r'\bU[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}\b', t)),
        "message": "Company Identification Number (CIN) found — verifiable on MCA portal."
    },
    {
        "id": "G03",
        "name": "Joining date specified",
        "weight": 10,
        "check": lambda t: bool(re.search(
            r'\b(joining date|date of joining|report on|commence on)\b', t, re.I)),
        "message": "Specific joining date mentioned — consistent with a genuine offer."
    },
    {
        "id": "G04",
        "name": "Office location specified",
        "weight": 10,
        "check": lambda t: bool(re.search(
            r'\b(bangalore|bengaluru|mumbai|delhi|hyderabad|chennai|pune|'
            r'kolkata|noida|gurugram|gurgaon)\b', t, re.I)),
        "message": "Specific work location city mentioned."
    },
    {
        "id": "G05",
        "name": "Probation / notice period mentioned",
        "weight": 10,
        "check": lambda t: bool(re.search(
            r'\b(probation|notice period|confirmation|appraisal)\b', t, re.I)),
        "message": "Employment terms like probation and notice period — standard in real offers."
    },
    {
        "id": "G06",
        "name": "Designation clearly stated",
        "weight": 10,
        "check": lambda t: bool(re.search(
            r'\b(designation|position|role|post|title)\s*[:\-]', t, re.I)),
        "message": "Job designation clearly labeled in the letter."
    },
    {
        "id": "G07",
        "name": "PF / ESI / benefits mentioned",
        "weight": 10,
        "check": lambda t: bool(re.search(
            r'\b(provident fund|PF|ESI|gratuity|mediclaim|health insurance|'
            r'CTC|cost to company)\b', t, re.I)),
        "message": "Statutory benefits (PF/ESI) or CTC breakdown mentioned — typical of legitimate HR."
    },
    {
        "id": "G08",
        "name": "Signed by named authority",
        "weight": 10,
        "check": lambda t: bool(re.search(
            r'\b(authorized signatory|for and on behalf|director|'
            r'vice president|head of hr)\b', t, re.I)),
        "message": "Letter signed by a named authority — standard corporate practice."
    },
]


def run_rules(text: str) -> dict:
    red   = [f for f in RED_FLAGS   if f["check"](text)]
    green = [f for f in GREEN_FLAGS if f["check"](text)]
    return {"red": red, "green": green}
```

---

## 4. Scorer (`backend/scorer.py`)

```python
from rules import run_rules

def score(text: str) -> dict:
    flags = run_rules(text)
    red_score   = sum(f["weight"] for f in flags["red"])
    green_score = sum(f["weight"] for f in flags["green"])

    # Normalize to 0-100 (higher = more legitimate)
    raw = green_score - red_score
    normalized = max(0, min(100, 50 + raw))

    if normalized >= 70:
        verdict = "LIKELY GENUINE"
        color   = "green"
    elif normalized >= 40:
        verdict = "SUSPICIOUS"
        color   = "amber"
    else:
        verdict = "HIGH RISK — POSSIBLE SCAM"
        color   = "red"

    return {
        "score":   normalized,
        "verdict": verdict,
        "color":   color,
        "red_flags":   [{"id":f["id"],"name":f["name"],"message":f["message"]} for f in flags["red"]],
        "green_flags": [{"id":f["id"],"name":f["name"],"message":f["message"]} for f in flags["green"]],
    }
```

---

## 5. Backend API (`backend/main.py`)

```python
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
from scorer import score
import io

app = FastAPI(title="Job Scamometer API")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def root():
    return {"status": "ok", "message": "Job Scamometer API running"}

@app.post("/analyse/text")
def analyse_text(text: str = Form(...)):
    return score(text)

@app.post("/analyse/pdf")
async def analyse_pdf(file: UploadFile = File(...)):
    contents = await file.read()
    doc = fitz.open(stream=contents, filetype="pdf")
    text = "\n".join(page.get_text() for page in doc)
    return score(text)
```

**requirements.txt:**
```
fastapi
uvicorn
pymupdf
python-multipart
```

**Procfile:**
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 6. Frontend (Plain HTML — `frontend/index.html`)

Single file, no framework needed. Key sections:
- Tab switcher: "Upload PDF" vs "Paste Text"
- Drag-and-drop PDF zone (FileReader API)
- Textarea for pasting text
- Analyse button → POST to API
- Verdict card: score meter + red/green flag cards

```javascript
// app.js — core fetch logic
async function analyse(formData, endpoint) {
  const res = await fetch(`${API_URL}/analyse/${endpoint}`, {
    method: 'POST', body: formData
  });
  const data = await res.json();
  renderResult(data);
}

function renderResult(data) {
  // Score meter (CSS width: data.score + '%')
  // Verdict badge with color class
  // Red flags: data.red_flags.map → red card with flag name + message
  // Green flags: data.green_flags.map → green card with flag name + message
}
```

---

## 7. Free Stack — Zero Cost Deployment

| Layer       | Service           | Free tier details                        |
|-------------|-------------------|------------------------------------------|
| Frontend    | GitHub Pages      | Free, custom domain, served from /docs   |
| Backend     | Render.com        | 750 hrs/month, spins down after 15 min   |
| PDF parsing | PyMuPDF (local)   | Runs on Render, no external API needed   |
| Domain      | .github.io        | Free subdomain via GitHub Pages          |

**No database needed** — stateless API, everything computed per request.

### Deploy frontend to GitHub Pages
1. Move `frontend/` contents into `/docs` folder in repo root
2. Go to repo Settings → Pages → Source: `main` branch, `/docs` folder
3. Live at: `https://yourusername.github.io/job-scamometer`

### Deploy backend to Render
1. Push repo to GitHub
2. render.com → New Web Service → connect repo → Root: `backend/`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Copy the Render URL → paste into `frontend/app.js` as `API_URL`

### Total monthly cost: ₹0

---

## 8. Extras to Add (All Free)

- **Share result** — generate a shareable URL with score encoded as query param
- **Flag submission form** — Google Form (free) linked from footer, users submit new scam patterns
- **Scam pattern database** — maintain `patterns.json` in the repo, community can PR new rules
- **OG image** — add meta tags so WhatsApp/Twitter preview shows the site nicely when shared
- **PWA** — add `manifest.json` + service worker so it installs like an app on phone (zero cost)
- **Analytics** — Plausible.io has a free open-source tier, or just use Cloudflare Web Analytics (free)

---

## 9. README Badges to Add

```markdown
![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![Made in India](https://img.shields.io/badge/made%20in-India-orange)
![Free to use](https://img.shields.io/badge/cost-₹0-green)
```

---

## 10. Viva / Placement Talking Points

- "Rule-based NLP with regex — fully explainable, unlike black-box ML models"
- "Weighted scoring system: high-risk flags (payment demand = 40pts) outweigh minor ones"
- "Apache 2.0 open source — others can contribute new patterns via GitHub PRs"
- "Stateless REST API — horizontally scalable, no database bottleneck"
- "Real-world impact: India had 65,000+ reported job fraud cases in 2023 (NCRB data)"
