// src/LandingPage.tsx
import React from "react";
import "./LandingPage.css"; // Import the CSS file

const LandingPage: React.FC = () => {
  return (
    <div className="landing-container">
        <div className="title-container">
            <h1 className="title">Ace Your Next Job Interview with AI.</h1>
            <p className="tagline">Practice. Improve. Succeed.</p>
            <button className="start-button">Start</button>
        </div>
    </div>
  );
};

export default LandingPage;
