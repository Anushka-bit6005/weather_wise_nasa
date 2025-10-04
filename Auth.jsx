import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Auth.css";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [page, setPage] = useState(location.state?.page || "welcome"); 
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [signupSuccess, setSignupSuccess] = useState(false);
  const [fade, setFade] = useState(true);

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    weatherPref: "",
    timePref: "",
    rarity: "",
    phenomenon: "",
  });

  const handleNextStep = (newStep) => {
    setFade(false);
    setTimeout(() => {
      setStep(newStep);
      setFade(true);
    }, 300);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("http://localhost:5000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else {
        setError("");
        alert(data.message);
        // REDIRECT TO DASHBOARD AND PASS USERNAME
        navigate("/dashboard", { state: { userName: email.split("@")[0] } });
      }
    } catch (err) {
      console.log(err);
      setError("Server error");
    }
  };

  const handleSignUpStep1 = (e) => {
    e.preventDefault();
    setSignupData(prev => ({
      ...prev,
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
    }));
    handleNextStep(2);
  };

  const handleSignUpStep2 = (e) => {
    e.preventDefault();
    setSignupData(prev => ({
      ...prev,
      weatherPref: e.target.weather.value,
      timePref: e.target.time.value,
    }));
    handleNextStep(3);
  };

  const handleSignUpStep3 = async (e) => {
    e.preventDefault();
    setSignupData(prev => ({
      ...prev,
      rarity: e.target.rarity.value,
      phenomenon: e.target.phenomenon.value,
    }));

    const finalData = {
      ...signupData,
      rarity: e.target.rarity.value,
      phenomenon: e.target.phenomenon.value,
    };

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
      } else {
        setError("");
        setSignupSuccess(true);
        // REDIRECT TO DASHBOARD WITH USERNAME AFTER SUCCESS
        setTimeout(() => navigate("/dashboard", { state: { userName: finalData.name } }), 2500);
      }
    } catch (err) {
      console.log(err);
      setError("Server error");
    }
  };

  if (page === "welcome") {
    return (
      <div className="auth-container">
        <h2 className="auth-welcome">Preparing Auth page...</h2>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {signupSuccess && (
        <div className="signup-success">
          🎉 Account created successfully! Welcome to WeatherWise! 🌞🌧️❄️
        </div>
      )}

      {page === "signin" ? (
        <form className={`auth-box ${fade ? "fade-in" : "fade-out"}`} onSubmit={handleSignIn}>
          <h2 className="auth-title">Sign In</h2>
          <input type="email" name="email" placeholder="Email Address" required />
          <input type="password" name="password" placeholder="Password" required />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="auth-btn">Sign In</button>
          <p className="switch-text">
            Not signed up?{" "}
            <span onClick={() => { setPage("signup"); setStep(1); setError(""); }}>Sign Up</span>
          </p>
        </form>
      ) : step === 1 ? (
        <form className={`auth-box ${fade ? "fade-in" : "fade-out"}`} onSubmit={handleSignUpStep1}>
          <h2 className="auth-title">Sign Up - Step 1</h2>
          <input type="text" name="name" placeholder="Full Name" required />
          <input type="email" name="email" placeholder="Email Address" required />
          <input type="password" name="password" placeholder="Set Password" required />
          <button type="submit" className="auth-btn">Next</button>
          <p className="switch-text">
            Already have an account? <span onClick={() => setPage("signin")}>Sign In</span>
          </p>
        </form>
      ) : step === 2 ? (
        <form className={`auth-box ${fade ? "fade-in" : "fade-out"}`} onSubmit={handleSignUpStep2}>
          <h2 className="auth-title">Step 2: Your Weather Personality</h2>
          <p className="question">Which weather inspires you most?</p>
          <select name="weather" required>
            <option value="">Select...</option>
            <option value="sunny">Sunny & Mountains 🌞🏔️</option>
            <option value="rainy">Rainy & Cozy 🌧️🛋️</option>
            <option value="snowy">Snow & Adventure ❄️🗻</option>
            <option value="stormy">Stormy & Dramatic 🌩️⚡</option>
          </select>
          <p className="question">Morning person or night owl?</p>
          <select name="time" required>
            <option value="">Select...</option>
            <option value="morning">Morning 🌅</option>
            <option value="night">Night 🌙</option>
          </select>
          <button type="submit" className="auth-btn">Next</button>
        </form>
      ) : (
        <form className={`auth-box ${fade ? "fade-in" : "fade-out"}`} onSubmit={handleSignUpStep3}>
          <h2 className="auth-title">Step 3: Fun Questions</h2>
          <p className="question">Do you consider yourself Rare or Epic?</p>
          <select name="rarity" required>
            <option value="">Select...</option>
            <option value="rare">Rare 🦄</option>
            <option value="epic">Epic ✨</option>
          </select>
          <p className="question">If you were a weather phenomenon, which one?</p>
          <select name="phenomenon" required>
            <option value="">Select...</option>
            <option value="breeze">Gentle Breeze 🌬️</option>
            <option value="lightning">Lightning ⚡</option>
            <option value="sun">Blazing Sun ☀️</option>
            <option value="snowstorm">Snowstorm ❄️</option>
          </select>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="auth-btn">Finish Sign Up</button>
          <p className="switch-text">
            Already have an account?{" "}
            <span onClick={() => { setPage("signin"); setStep(1); }}>Sign In</span>
          </p>
        </form>
      )}
    </div>
  );
};

export default Auth;

