import React from "react";
import { useNavigate } from "react-router-dom";
import "./About.css";

const About = () => {
  const navigate = useNavigate();

  const goToHeader = () => {
    navigate("/"); // ✅ go back to Header page
  };

  return (
    <div className="about-page">
      <div className="about-content">
        <h2>About WeatherWise 🌟</h2>
        <p>
          WeatherWise was created to make your day-to-day planning smarter and safer.  
          With our real-time weather data, accurate forecasts, and personalized tips,  
          you can enjoy every day to its fullest without unexpected weather surprises. ☀️🌦️🌙
        </p>
        <p>
          Our mission is to empower people to stay informed, plan confidently, and embrace the outdoors safely.  
          Join our community and start being weather-wise today! 💧🌞
        </p>

        {/* ✅ Return to Header page */}
        <button className="return-home-btn" onClick={goToHeader}>
          ⬆️ Return to Home
        </button>
      </div>
    </div>
  );
};

export default About;






