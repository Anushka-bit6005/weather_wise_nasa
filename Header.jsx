import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Header.css';
import weatherIcon from './assets/weather_icon.jpeg';

const Header = () => {
  const navigate = useNavigate();
  const [logoPhase, setLogoPhase] = useState("center");
  const [showTagline, setShowTagline] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setLogoPhase("topRight"), 4000);
    const timer2 = setTimeout(() => setShowTagline(false), 5500);
    const timer3 = setTimeout(() => setShowIntro(true), 5600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="header-container">

      {/* --- Top Header Nav --- */}
      <nav className="top-nav">
        <ul className="nav-links left-links">
          <li className="nav-item">
            <button className="btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Home
            </button>
          </li>
          <li className="nav-item">
            <button className="btn" onClick={() => navigate("/about")}>
              About
            </button>
          </li>
          <li className="nav-item">
            <button className="btn login-btn" onClick={() => navigate("/auth", { state: { page: "signin" } })}>
              Sign In
            </button>
          </li>
          <li className="nav-item">
            <button className="btn signup-btn" onClick={() => navigate("/auth", { state: { page: "signup" } })}>
              Sign Up
            </button>
          </li>
        </ul>
      </nav>

      {/* --- Animated Logo & Tagline --- */}
      <div className={`logo-container ${logoPhase}`}>
        <h1 className="logo">
          WeatherWise </h1>
        <p className={`tagline ${showTagline ? "visible" : "hidden"}`}>
          Be wise about your outdoor plans 🌤️
        </p>
      </div>

      {/* --- Intro Text --- */}
      {showIntro && (
        <div className="intro-container">
          <div className="intro-text">
            <h2>Welcome to WeatherWise! </h2>
            <p>
              Discover real-time weather updates, accurate forecasts, and personalized outdoor tips—all in one place. 
            </p>
            <p>
              Plan your day smarter, stay safe in any weather, and never let unexpected rain or heat ruin your plans again. 
            </p>
            <button
              className="get-started-btn"
              onClick={() => navigate("/auth", { state: { page: "signup" } })}
            >
              🚀 Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;


