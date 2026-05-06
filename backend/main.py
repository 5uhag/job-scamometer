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
