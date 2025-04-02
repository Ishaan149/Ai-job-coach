import React, { useState } from "react";
import axios from "axios";
import "./MainPage.css";

const MainPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [tempJobDescription, setTempJobDescription] = useState("");
    const [resume, setResume] = useState<File | null>(null);
    const [pdfContent, setPdfContent] = useState<string>("");
    const [jobDescriptionContent, setJobDescriptionContent] = useState<string>("");

    const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showFlashcard, setShowFlashcard] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [loadingAnswer, setLoadingAnswer] = useState(false);
    const [loadingInterview, setLoadingInterview] = useState(false);
    const [answers, setAnswers] = useState<(string | null)[]>([]);
    const [flashcardKey, setFlashcardKey] = useState(0);



    const handleSave = () => {
        setJobDescription(tempJobDescription);
        setJobDescriptionContent(tempJobDescription);
        setShowModal(false);
    };

    const openModal = () => {
        setTempJobDescription(jobDescription);
        setShowModal(true);
    };

    const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            if (file.type === "application/pdf") {
                setResume(file);
                await uploadResume(file);
            } else {
                alert("Please upload a PDF file.");
            }
        }
    };

    const uploadResume = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("https://ai-job-coach.onrender.com/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.content) {
                setPdfContent(response.data.content);
            } else {
                alert("Failed to extract text from the PDF.");
            }
        } catch (error) {
            console.error("Error uploading resume:", error);
            alert("Error uploading resume.");
        }
    };

    const fetchInterviewQuestions = async () => {
        setLoadingInterview(true);
        try {
            const response = await axios.post("https://ai-job-coach.onrender.com/generate_questions/", {
                resume_text: pdfContent,
                job_description: jobDescriptionContent,
            });
    
            if (response.data.questions) {
                const extractedQuestions = response.data.questions.map((q: { question: string }) => q.question);
                setInterviewQuestions(extractedQuestions);
                setCurrentQuestionIndex(0);
                setAnswers(Array(extractedQuestions.length).fill(null));
                setShowFlashcard(true);
            } else {
                alert("Failed to generate interview questions.");
            }
        } catch (error) {
            console.error("Error fetching interview questions:", error);
            alert("Error fetching interview questions.");
        } finally {
            setLoadingInterview(false);
        }
    };
    

    const startInterview = () => {
        fetchInterviewQuestions();
    };


    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
            setFlashcardKey((prevKey) => prevKey + 1);
        }
        setShowAnswer(false);
        setCurrentAnswer("");
    };
    
    const nextQuestion = () => {
        if (currentQuestionIndex < interviewQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setFlashcardKey((prevKey) => prevKey + 1);
        } else {
            setShowFlashcard(false);
            setCurrentQuestionIndex(0);
            setInterviewQuestions([]);
        }
        setShowAnswer(false);
        setCurrentAnswer("");
    };

    const fetchIdealAnswer = async () => {
        const questionIndex = currentQuestionIndex;
        const cachedAnswer = answers[questionIndex];
    
        // If already showing, hide it
        if (showAnswer) {
            setShowAnswer(false);
            return;
        }
    
        // If cached, show it without API call
        if (cachedAnswer) {
            setCurrentAnswer(cachedAnswer);
            setShowAnswer(true);
            return;
        }
    
        // Else fetch from API
        const question = interviewQuestions[questionIndex];
        if (!question || !pdfContent || !jobDescriptionContent) return;
    
        setLoadingAnswer(true);
        try {
            const response = await axios.post("https://ai-job-coach.onrender.com/generate_ideal_answer/", {
                resume_text: pdfContent,
                job_description: jobDescriptionContent,
                question,
            });
    
            if (response.data.answer) {
                const updatedAnswers = [...answers];
                updatedAnswers[questionIndex] = response.data.answer;
                setAnswers(updatedAnswers);
    
                setCurrentAnswer(response.data.answer);
                setShowAnswer(true);
            }
        } catch (error) {
            console.error("Error fetching ideal answer:", error);
            alert("Failed to fetch ideal answer.");
        } finally {
            setLoadingAnswer(false);
        }
    };
    
    
    
    

    return (
        <div className="main-container">
            <div className="main-title-container">
                <h1>Welcome to the Interview Practice</h1>
                <p>Upload your resume and job description to get started.</p>

                {/* Resume Upload Button */}
                <input
                    type="file"
                    accept=".pdf"
                    id="resume-upload"
                    style={{ display: "none" }}
                    onChange={handleResumeUpload}
                />
                <button
                    className={`resume-button ${resume ? "resume-added" : ""}`}
                    onClick={() => document.getElementById("resume-upload")?.click()}
                >
                    {resume ? `Uploaded: ${resume.name}` : "Upload Resume"}
                </button>

                {/* Job Description Upload Button */}
                <button
                    className={`job-button ${jobDescription ? "job-added" : ""}`}
                    id="upload-button"
                    onClick={openModal}
                >
                    {jobDescription ? "Update Job Description" : "Upload Job Description"}
                </button>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Enter Job Description</h2>
                            <textarea
                                placeholder="Paste your job description here..."
                                value={tempJobDescription}
                                onChange={(e) => setTempJobDescription(e.target.value)}
                                className="job-textarea"
                            />
                            <div className="modal-buttons">
                                <button className="close-button" onClick={() => setShowModal(false)}>Close</button>
                                <button className="save-button" onClick={handleSave}>Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Start Interview Button */}
                <button
                    className={`start-interview-button ${(resume && jobDescription && !loadingInterview) ? "enabled" : "disabled"}`}
                    onClick={startInterview}
                    disabled={!resume || !jobDescription || loadingInterview}
                >
                    {loadingInterview ? "Loading..." : "Start Interview"}
                </button>


                {/* Flashcard Overlay for Interview Questions */}
                {showFlashcard && interviewQuestions.length > 0 && (
                    <div className="flashcard-overlay">
                        <div className="flashcard-content">
                            {/* Wrap the animated section with a key to trigger animation */}
                            <div key={flashcardKey} className="flashcard-slide">
                                <h2>Interview Question</h2>
                                <p className="question-text">{interviewQuestions[currentQuestionIndex]}</p>

                                <div className="ideal-answer-container">
                                    {showAnswer && (
                                        <div className="ideal-answer-box">
                                            <h3>Ideal Answer:</h3>
                                            <p>{currentAnswer}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flashcard-buttons">
                                    <button 
                                        className="prev-question-button" 
                                        onClick={prevQuestion}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        Previous
                                    </button>

                                    <button 
                                        className="show-answer-button"
                                        onClick={fetchIdealAnswer}
                                        disabled={loadingAnswer}
                                    >
                                        {loadingAnswer ? "Loading..." : showAnswer ? "Hide Ideal Answer" : "Show Ideal Answer"}
                                    </button>

                                    <button 
                                        className="next-question-button" 
                                        onClick={nextQuestion}
                                    >
                                        {currentQuestionIndex < interviewQuestions.length - 1 ? "Next" : "Finish"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainPage;

