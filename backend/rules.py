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
