import { useState,useEffect  } from "react";
import { PieChart, Pie, Cell } from "recharts";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";



export default function Dashboard() {
  const navigate = useNavigate();

  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Trip planner states
  const [tripCity, setTripCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activity, setActivity] = useState("hiking");
  const [tripData, setTripData] = useState([]);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState("");
  const [tripSummary, setTripSummary] = useState(null);

  // Activities state
  const [selectedActivity, setSelectedActivity] = useState("");


  
const jwtToken = "PASTE_THE_WHOLE_TOKEN_HERE";

  

// NASA APOD
const [apod, setApod] = useState(null);
const [apodLoading, setApodLoading] = useState(false);
const [apodError, setApodError] = useState("");
const fetchApod = async () => {
  setApodLoading(true);
  setApodError("");
  try {
    const res = await fetch(
      "https://api.nasa.gov/planetary/apod?api_key=8wd6yWHpblrHeLYi6pkitXZrjkAo49HBnin5GS2p"
    );
    const data = await res.json();
    if (data.code) {
      setApodError("API limit reached or error occurred");
    } else {
      setApod(data);
    }
  } catch (err) {
    setApodError("Failed to fetch NASA data");
  } finally {
    setApodLoading(false);
  }
};

useEffect(() => {
  fetchApod();
}, []);


  const apiKey = "b2cdfca52ed6401683963647252209";
  

  // ---- Current weather + hourly forecast ----
  const handleSearch = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
        city
      )}&days=1&aqi=no&alerts=no`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error.message || "API error");
      } else {
        if (data.forecast?.forecastday?.[0]?.hour) {
          data.forecast.forecastday[0].hour = data.forecast.forecastday[0].hour.map(
            (h) => ({
              ...h,
              time_label: h.time.split(" ")[1].slice(0, 5),
            })
          );
        }
        setWeather(data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather — check API key & network");
    } finally {
      setLoading(false);
    }
  };

  // ---- Trip planner with date range ----
  const handleCheckTrip = async () => {
    if (!tripCity.trim() || !startDate || !endDate) return;
    setTripLoading(true);
    setTripError("");
    setTripData([]);
    setTripSummary(null);

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setTripError("End date must be same or after start date");
      setTripLoading(false);
      return;
    }

    const results = [];
    const today = new Date();
    const minDate = new Date("2010-01-01");

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d < minDate) continue;

      const dt = d.toISOString().split("T")[0];
      const isFuture = d >= today;

      const endpoint = isFuture ? "forecast.json" : "history.json";

      try {
        const url = `https://api.weatherapi.com/v1/${endpoint}?key=${apiKey}&q=${encodeURIComponent(
          tripCity
        )}&dt=${dt}&days=1&aqi=no&alerts=no`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
          setTripError(data.error.message || "API returned error");
          break;
        }

        const dayData = data.forecast.forecastday[0];
        const day = dayData.day;
        const hourly = (dayData.hour || []).map((h) => ({
          ...h,
          time_label: h.time.split(" ")[1].slice(0, 5),
        }));

        const cond = (day.condition?.text || "").toLowerCase();
        let suggestion = `Good day for ${activity}. Enjoy your activity!`;
        if (cond.includes("rain") || cond.includes("thunder")) {
          suggestion =
            activity === "hiking"
              ? "Rainy — avoid exposed trails. Consider indoor activities."
              : "Bring waterproof gear; plan indoor activities.";
        } else if (cond.includes("snow")) {
          suggestion =
            activity === "traveling"
              ? "Snowy — travel carefully; check road conditions."
              : "Great for winter activities; wear warm clothes!";
        } else if (day.maxwind_kph > 50) {
          suggestion = "Windy — avoid exposed ridges; secure equipment.";
        } else if (day.maxtemp_c > 35) {
          suggestion = "Very hot — hydrate often; avoid midday activity.";
        } else if (day.maxtemp_c < 5) {
          suggestion = "Cold — wear warm clothes; plan indoor options.";
        }

        results.push({
          date: dt,
          temp_max: day.maxtemp_c,
          temp_min: day.mintemp_c,
          condition: day.condition?.text || "",
          wind: day.maxwind_kph,
          humidity: day.avghumidity,
          chance_of_rain: day.daily_chance_of_rain || 0,
          hourly,
          suggestion,
        });
      } catch (err) {
        console.error(err);
        setTripError("Failed to fetch trip weather (network)");
      }
    }

    setTripData(results);

    if (results.length > 0) {
      const avgMax =
        results.reduce((acc, r) => acc + (r.temp_max || 0), 0) / results.length;
      const hottest = results.reduce((a, b) =>
        (a.temp_max || 0) > (b.temp_max || 0) ? a : b
      );
      const rainiest = results.reduce((a, b) =>
        (a.chance_of_rain || 0) > (b.chance_of_rain || 0) ? a : b
      );
      setTripSummary({
        avgMax: avgMax.toFixed(1),
        hottest: hottest?.date,
        rainiest: rainiest?.date,
      });
    }

    setTripLoading(false);
  };

  const hourlyForChart = (hourlyArray) =>
    hourlyArray?.map((h) => ({ time: h.time_label, temp: h.temp_c })) || [];

  return (
    <div className="dashboard-root">
            {/* --- TOP NAV --- */}
      <nav className="top-nav">
        <ul className="nav-links left-links">
          <li className="nav-item">
            <button className="btn" onClick={() => navigate("/")}>Home</button>
          </li>
          <li className="nav-item">
            <button className="btn" onClick={() => navigate("/about")}>About</button>
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

      <div className="dashboard-inner">
        <h2 className="title">WeatherWise🌤️</h2>

        {/* ----- Search / current weather ----- */}
        <section className="search-section card">
          <div className="search-row">
            <input
              className="city-input"
              placeholder="Enter city (e.g., New York)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button className="primary-btn" onClick={handleSearch}>
              {loading ? "Searching..." : "Get Weather"}
            </button>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {weather && (
            <div className="weather-card">
              <div className="current-left">
                  
  {/* PIE CHART ADDED */}
<div className="pie-chart-container" style={{ textAlign: "center", marginBottom: "10px" }}>
  <PieChart width={150} height={150}>
    <Pie
      data={[
        { name: "", value: weather.current.temp_c },
        { name: "", value: weather.current.humidity },
        { name: "", value: weather.current.wind_kph },
        { name: "", value: weather.current.uv },
      ]}
      dataKey="value"
      outerRadius={50}
      innerRadius={25}
      paddingAngle={5}
   
    >
      {[
        weather.current.temp_c,
        weather.current.humidity,
        weather.current.wind_kph,
        weather.current.uv,
      ].map((_, index) => (
        <Cell
          key={`cell-${index}`}
          fill={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"][index % 4]}
        />
      ))}
    </Pie>
  </PieChart>

  {/* LEGEND BELOW PIE */}
  <div className="pie-legend" style={{ marginTop: "5px", fontSize: "12px" }}>
    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <span style={{ width: "12px", height: "12px", background: "#FF6384", display: "inline-block" }}></span>
        Temp (°C)
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <span style={{ width: "12px", height: "12px", background: "#36A2EB", display: "inline-block" }}></span>
        Humidity (%)
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <span style={{ width: "12px", height: "12px", background: "#FFCE56", display: "inline-block" }}></span>
        Wind (kph)
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <span style={{ width: "12px", height: "12px", background: "#4BC0C0", display: "inline-block" }}></span>
        UV Index
      </span>
    </div>
  </div>
</div>

                <img
                  className="condition-icon"
                  src={weather.current.condition.icon}
                  alt="icon"
                />
                <div className="city-block">
                  <h3>
                    {weather.location.name}, {weather.location.country}
                  </h3>
                  <div className="cond-text">{weather.current.condition.text}</div>
                  <div className="big-temp">{weather.current.temp_c}°C</div>
                </div>
              </div>

              <div className="current-right">
                <div className="stats-row">
                  <div className="badge">
                    <svg viewBox="0 0 24 24" className="badge-icon">
                      <path d="M12 2a4 4 0 00-4 4v2a4 4 0 008 0V6a4 4 0 00-4-4z" />
                    </svg>
                    <div className="badge-label">Feels</div>
                    <div className="badge-value">{weather.current.feelslike_c}°C</div>
                  </div>

                  <div className="badge">
                    <svg viewBox="0 0 24 24" className="badge-icon">
                      <path d="M3 12h18" />
                    </svg>
                    <div className="badge-label">Wind</div>
                    <div className="badge-value">{weather.current.wind_kph} kph</div>
                  </div>

                  <div className="badge">
                    <svg viewBox="0 0 24 24" className="badge-icon">
                      <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
                    </svg>
                    <div className="badge-label">Humidity</div>
                    <div className="badge-value">{weather.current.humidity}%</div>
                  </div>

                  <div className="badge">
                    <svg viewBox="0 0 24 24" className="badge-icon">
                      <path d="M12 3v18" />
                    </svg>
                    <div className="badge-label">UV</div>
                    <div className="badge-value">{weather.current.uv}</div>
                  </div>
                </div>

                {weather.forecast?.forecastday?.[0]?.hour && (
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart
                        data={hourlyForChart(
                          weather.forecast.forecastday[0].hour.slice(0, 24)
                        )}
                        margin={{ top: 6, right: 12, bottom: 6, left: -6 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                        <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          stroke="#ff6f91"
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ----- Trip Planner ----- */}
        <section className="trip-section card">
          <h3>Plan a Trip</h3>
          <div className="trip-controls">
            <input
              className="trip-city-input"
              placeholder="City for trip"
              value={tripCity}
              onChange={(e) => setTripCity(e.target.value)}
            />
            <div className="dates-row">
              <input
                type="date"
                className="trip-date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="trip-date-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <select
              className="trip-activity-select"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              <option value="hiking">Hiking</option>
              <option value="traveling">Traveling</option>
              <option value="exploring">Exploring</option>
              <option value="fishing">Fishing</option>
            </select>

            <button className="primary-btn" onClick={handleCheckTrip}>
              {tripLoading ? "Checking..." : "Check Trip Weather"}
            </button>
          </div>

          {tripError && <div className="error-banner">{tripError}</div>}

          {tripData.length > 0 && (
            <div className="trip-results-wrapper">
              <div className="trip-results">
                <div className="trip-cards">
                  {tripData.map((d) => {
                    let cardClass = "trip-day-card";
                    if (
                      d.chance_of_rain > 50 ||
                      d.wind > 50 ||
                      d.temp_max > 35 ||
                      d.temp_max < 5
                    ) {
                      cardClass += " danger";
                    } else if (d.chance_of_rain > 20 || d.wind > 30) {
                      cardClass += " caution";
                    } else {
                      cardClass += " best";
                    }

                    const maxScore = Math.max(
                      ...tripData.map((t) => 100 - (t.chance_of_rain || 0))
                    );
                    const isBestDay = 100 - (d.chance_of_rain || 0) === maxScore;

                    return (
                      <article key={d.date} className={cardClass}>
                        <div className="trip-day-head">
                          <h4>{d.date}</h4>
                          {isBestDay && <span className="best-badge">Best Day</span>}
                          <div className="cond-small">{d.condition}</div>
                        </div>

                        <div className="trip-stats">
                          <div className="small-stat">
                            <strong>{d.temp_min}°C</strong> - {d.temp_max}°C
                            <div className="small-label">min / max</div>
                          </div>
                          <div className="small-stat">
                            <strong>{d.chance_of_rain}%</strong>
                            <div className="small-label">rain chance</div>
                          </div>
                          <div className="small-stat">
                            <strong>{d.wind} kph</strong>
                            <div className="small-label">wind</div>
                          </div>
                          <div className="small-stat">
                            <strong>{d.humidity}%</strong>
                            <div className="small-label">humidity</div>
                          </div>
                        </div>

                        <p className="advice-text">{d.suggestion}</p>

                        <div className="chart-wrap small">
                          <ResponsiveContainer width="100%" height={90}>
                            <LineChart data={hourlyForChart(d.hourly || []).slice(0, 24)}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.08} />
                              <XAxis dataKey="time" hide />
                              <YAxis hide />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="temp"
                                stroke="#ff6f91"
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <aside className="trip-summary">
                  <h4>Trip Summary</h4>
                  <div className="summary-row">
                    <div>Average Max Temp: {tripSummary?.avgMax}°C</div>
                    <div>Hottest Day: {tripSummary?.hottest}</div>
                    <div>Rainiest Day: {tripSummary?.rainiest}</div>
                  </div>
                </aside>
              </div>
            </div>
          )}
        </section>

        

        {/* ----- NASA APOD Section ----- */}
<section className="card nasa-apod-section" style={{ marginTop: "30px" }}>
  <h3>NASA Astronomy Picture of the Day 🚀</h3>
  
  {apodLoading && <p>Loading NASA data...</p>}
  {apodError && <div className="error-banner">{apodError}</div>}

  {apod && (
    <div className="apod-card">
      <h4>{apod.title}</h4>
      {apod.media_type === "image" ? (
        <img
          src={apod.url}
          alt={apod.title}
          style={{ width: "100%", borderRadius: "12px", marginBottom: "10px" }}
        />
      ) : (
        <iframe
          title={apod.title}
          src={apod.url}
          frameBorder="0"
          allow="encrypted-media"
          allowFullScreen
          style={{ width: "100%", height: "360px", borderRadius: "12px", marginBottom: "10px" }}
        />
      )}
      <p>{apod.explanation}</p>
    </div>
  )}
</section>


        {/* ----- Activities Section (Below Trip Planner) ----- */}
<div className="activities-section">
  <h3>Popular Activities</h3>
  
  {/* Fun description below heading */}
  <div className="activities-intro">
    🌟 Pick an activity and explore something awesome today! Whether it’s hiking in the hills, chilling on the beach, or tasting amazing food, there’s a little adventure waiting for you. 🚀
  </div>

  <div className="activity-cards">
    {[
      { name: "Hiking", icon: "🥾", desc: "Explore the mountains and breathe fresh air!" },
      { name: "Fishing", icon: "🎣", desc: "Relax by the water and catch your dinner!" },
      { name: "Sightseeing", icon: "🏛️", desc: "Discover hidden gems and historic spots!" },
      { name: "Camping", icon: "🏕️", desc: "Sleep under the stars and enjoy the wilderness!" },
      { name: "Food Tours", icon: "🍲", desc: "Taste amazing local cuisines and treats!" },
      { name: "Beach Fun", icon: "🏖️", desc: "Sun, sand, and waves—pure joy!" },
      { name: "Cycling", icon: "🚴", desc: "Pedal around and feel the wind in your hair!" },
    ].map((act) => (
      <div
        key={act.name}
        className={`activity-card ${
          selectedActivity === act.name ? `active-${act.name.toLowerCase().replace(" ", "-")}` : ""
        }`}
        onClick={() => {
          setSelectedActivity(act.name);
          navigate(`/activity/${act.name}`); // <-- API/navigation stays same
        }}
      >
        <span className="activity-icon">{act.icon}</span>
        <div className="activity-name">{act.name}</div>
        {selectedActivity === act.name && (
          <div className="activity-desc">{act.desc}</div>
        )}
      </div>
    ))}
  </div>

  {selectedActivity && (
    <div className="activity-result">
      You selected <strong>{selectedActivity}</strong>!
    </div>
  )}
</div>


{/* ----- Fun Activity Selection + Packing Suggestions ----- */}
<section className="activity-suggestions">
  <h3>Pick an Activity & Get Packing Tips!</h3>
  <div className="activity-buttons">
    {[
      { name: "Hiking", icon: "🥾" },
      { name: "Fishing", icon: "🎣" },
      { name: "Sightseeing", icon: "🏛️" },
      { name: "Camping", icon: "🏕️" },
      { name: "Food Tours", icon: "🍲" },
      { name: "Beach Fun", icon: "🏖️" },
      { name: "Cycling", icon: "🚴" },
    ].map((act) => (
      <button
        key={act.name}
        className={`suggestion-btn ${selectedActivity === act.name ? "active" : ""}`}
        onClick={() => setSelectedActivity(act.name)}
      >
        <span className="emoji">{act.icon}</span> {act.name}
      </button>
    ))}
  </div>

  {selectedActivity && (
    <div className="packing-list">
      <h4>Packing Tips for {selectedActivity}:</h4>
      <p>
  {selectedActivity === "Hiking" &&
    "🥾 Hiking essentials (real talk): Water bottle that actually lasts, snacks that give you life, comfy shoes that won’t kill your feet, sunblock, hat, a map or Google Maps just in case, first-aid kit (band-aids for blisters!), trekking poles if you’re fancy, flashlight/headlamp, maybe a tiny snack for squirrels, a camera to show off your views, and some patience — hills aren’t friendly."}

  {selectedActivity === "Fishing" &&
    "🎣 Fishing gear (raw mode): Rod and bait, check if you need a license, life jacket if you’re not a daredevil, hat and sunscreen to avoid looking like a lobster, snacks and drinks because waiting is long, a chair you actually like sitting on, extra clothes in case you fall in water, sunglasses to avoid glares, a little net if you’re lucky, and most importantly — patience and a good story."}

  {selectedActivity === "Sightseeing" &&
    "🏛️ Sightseeing pack (real stuff): Comfy shoes or you’ll regret it, water bottle, light jacket, hat, camera or phone with a million battery %, some snacks, notebook for random thoughts, portable charger, maybe a guidebook but Google is fine, hand sanitizer because gross, extra cash, and an open mind to get lost in alleys and find hidden gems."}

  {selectedActivity === "Camping" &&
    "🏕️ Camping gear (raw truth): Tent that doesn’t leak, sleeping bag that doesn’t feel like a wet sock, flashlight/headlamp with extra batteries, insect repellent unless you want bug friends, food that actually cooks, water, matches or lighter, multi-tool, trash bags because nature is not your trash can, warm clothes, first-aid kit, some fun stuff like a book or cards, and don’t forget to look at the stars — best therapy ever."}

  {selectedActivity === "Food Tours" &&
    "🍲 Food tour survival pack: Comfy shoes (you’ll walk a lot), backpack, water, napkins/wipes, camera, cash/cards, open stomach and mind, light jacket if weather is weird, guidebook or Google maps, hand sanitizer, maybe a friend to share bites with, notebook for weird food names, and don’t be afraid to try that weird-looking thing — it might be amazing."}

  {selectedActivity === "Beach Fun" &&
    "🏖️ Beach stuff (raw mode): Swimsuit that actually stays on, towel, sunscreen like it’s your religion, sunglasses, hat, water bottle, snacks that survive sand, flip-flops, extra clothes, beach ball or frisbee, small cooler for drinks, waterproof phone case if you care, maybe snorkel gear, trash bag because sand + food = nightmare, and good vibes only."}

  {selectedActivity === "Cycling" &&
    "🚴 Cycling kit (real talk): Helmet, gloves, water bottle, snacks, repair kit for when tires betray you, comfy clothes, sunglasses, bike lock, first-aid kit (just in case), map or GPS, phone charged, reflective stuff if you ride late, energy and patience, camera if you like selfies on bikes, and an attitude that says ‘pedal like you mean it’."}
</p>

    </div>
  )}
</section>






      </div>
    </div>
  );
}


