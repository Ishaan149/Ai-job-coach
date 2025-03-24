from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from pydantic import BaseModel

#import fastapi
app = FastAPI()

# CORS Middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI backend!"}

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        reader = PdfReader(file.file)
        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
        return {"filename": file.filename, "content": text}
    except Exception as e:
        return {"error": str(e)}

# Request model for job description and resume
class InterviewRequest(BaseModel):
    resume_text: str
    job_description: str

@app.post("/generate_questions/")
async def generate_questions(request: InterviewRequest):
    """Returns default interview questions for testing."""
    default_questions = [
        {"question": "Tell me about yourself."},
        {"question": "What are your strengths and weaknesses?"},
        {"question": "Why do you want this job?"},
        {"question": "Where do you see yourself in five years?"},
        {"question": "Describe a challenging project you worked on."},
    ]
    return {"questions": default_questions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
