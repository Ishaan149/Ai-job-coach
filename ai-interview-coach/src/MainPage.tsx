import React, { useState } from "react";
import "./MainPage.css";

const MainPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [tempJobDescription, setTempJobDescription] = useState("");
    const [resume, setResume] = useState<File | null>(null);


    const handleSave = () => {
        setJobDescription(tempJobDescription); 
        setShowModal(false);
    };

    const openModal = () => {
        setTempJobDescription(jobDescription); 
        setShowModal(true);
    };

    const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        // Ensure the file is a PDF
        if (file.type === "application/pdf") {
            setResume(file);
        } else {
            alert("Please upload a PDF file.");
        }
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

                {/* Job Upload Button */}
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
            </div>
        </div>
    );
};

export default MainPage;
