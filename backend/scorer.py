from rules import run_rules

def score(text: str) -> dict:
    flags = run_rules(text)
    red_score   = sum(f["weight"] for f in flags["red"])
    green_score = sum(f["weight"] for f in flags["green"])

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
        "red_flags":   [{"id": f["id"], "name": f["name"], "message": f["message"]} for f in flags["red"]],
        "green_flags": [{"id": f["id"], "name": f["name"], "message": f["message"]} for f in flags["green"]],
    }
