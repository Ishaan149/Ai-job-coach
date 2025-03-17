import React, { useState } from "react";
import "./MainPage.css";

const MainPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [tempJobDescription, setTempJobDescription] = useState(""); 

  const handleSave = () => {
    setJobDescription(tempJobDescription); 
    setShowModal(false);
  };

  const openModal = () => {
    setTempJobDescription(jobDescription); 
    setShowModal(true);
  };

  return (
    <div className="main-container">
      <h1>Welcome to the Interview Practice</h1>
      <p>Upload your resume and job description to get started.</p>

      <button className="resume-button" id="upload-button">Upload Resume</button>

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
  );
};

export default MainPage;
