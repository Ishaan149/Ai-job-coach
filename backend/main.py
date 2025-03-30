import os
import re
import anthropic
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env vars
load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# Claude client
client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

app = FastAPI()

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev. Replace with actual URL in production.
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

class InterviewRequest(BaseModel):
    resume_text: str
    job_description: str

class IdealAnswerRequest(BaseModel):
    resume_text: str
    job_description: str
    question: str

@app.post("/generate_questions/")
async def generate_questions(request: InterviewRequest):
    if not ANTHROPIC_API_KEY:
        return {"error": "Claude API key is missing!"}

    prompt = f"""
You will be given a resume and a job description. Your task is to generate 5 personalized interview questions based on the information provided in these documents. These questions should be tailored to the candidate's experience and the specific requirements of the job.

First, carefully read and analyze the following resume:

<resume>
{request.resume_text}
</resume>

Now, review the job description:

<job_description>
{request.job_description}
</job_description>

Generate 5 interview questions that are:
- Specific to the candidate's background
- Relevant to the job requirements
- Open-ended to encourage detailed responses
- Designed to assess both technical skills and soft skills

Present your questions in the following format:

<interview_questions>
1. [First question]
2. [Second question]
3. [Third question]
4. [Fourth question]
5. [Fifth question]
</interview_questions>

Do not give any other explanation or information. And each questions should not be longer than 25 words.

Ensure that each question is unique and provides valuable insights into the candidate's qualifications for the specific job.
    """

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=4096,
            temperature=1,
            messages=[{
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
            }]
        )

        response_text = response.content[0].text.strip()
        cleaned_text = re.sub(r"</?interview_questions>", "", response_text).strip()
        questions = [q.strip() for q in cleaned_text.split("\n") if q.strip()]
        return {"questions": [{"question": q} for q in questions]}
    
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate_ideal_answer/")
async def generate_ideal_answer(request: IdealAnswerRequest):
    if not ANTHROPIC_API_KEY:
        return {"error": "Claude API key is missing!"}

    # Fill the prompt with the actual values
    prompt = f"""
You will be given a resume, a job description, and one interview question. Your task is to generate an ideal answer to the question that aligns with both the candidate’s background and the job requirements.

First, carefully read and analyze the following resume:

<resume>
{request.resume_text}
</resume>

Now, review the job description:

<job_description>
{request.job_description}
</job_description>

Here is the interview question:

<interview_question>
{request.question}
</interview_question>

Generate an ideal answer that is:

Based on the candidate’s experience which is internship and first job and skills in the resume

Relevant to the job description

Clear, concise, and professional

No more than 75 words

Present your answer in the following format:

<ideal_answer>
[Ideal answer here]
</ideal_answer>

Do not provide any additional explanation or text outside this format.
"""

    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=4096,
            temperature=1,
            messages=[{
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
            }]
        )

        raw_text = response.content[0].text.strip()
        import re
        match = re.search(r"<ideal_answer>(.*?)</ideal_answer>", raw_text, re.DOTALL | re.IGNORECASE)
        if match:
            ideal_answer = match.group(1).strip()
        else:
            ideal_answer = raw_text  # fallback if tags are missing

        return {"answer": ideal_answer}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
