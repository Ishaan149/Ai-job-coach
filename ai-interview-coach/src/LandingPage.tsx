// src/LandingPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; 

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="title-container">
        <h1 className="title">Ace Your Next Job Interview with AI.</h1>
        <p className="tagline">Practice. Improve. Succeed.</p>
        <button className="start-button" onClick={() => navigate("/main")}>
          Start
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
