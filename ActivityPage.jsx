import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./ActivityPage.css";

export default function ActivityPage() {
  const { activity } = useParams();
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripData, setTripData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New: random tips per activity
  const activityTips = {
    hiking: [
      "🥾 Hiking is all about exploring nature! Watch for scenic viewpoints.",
      "⛰️ Remember to carry water and enjoy a mini picnic mid-trail!",
      "🌲 Take deep breaths — nature is your stress-buster!",
      "🗺️ Try a new trail today to keep the adventure exciting!"
    ],
    fishing: [
      "🎣 Relax and enjoy the calm — patience is key!",
      "🐟 Check the local regulations before you fish.",
      "🌅 Early morning is usually the best time to catch fish.",
      "🍫 Bring snacks and enjoy the scenery while waiting!"
    ],
    sightseeing: [
      "🏛️ Explore hidden gems and local culture — take photos!",
      "📸 Golden hour is perfect for capturing beautiful memories.",
      "👟 Wear comfy shoes — you’ll walk a lot!",
      "🗺️ Try to talk to locals — they know secret spots!"
    ],
    camping: [
      "🏕️ Sleep under the stars and enjoy a campfire!",
      "🔥 Don’t forget marshmallows for s’mores!",
      "🌌 Watch the night sky — perfect for stargazing.",
      "🌲 Explore nearby trails during the day!"
    ],
    "food tours": [
      "🍲 Taste every flavor — let your taste buds explore!",
      "😋 Ask locals for their favorite hidden spots!",
      "🥖 Try something you’ve never eaten before!",
      "🍹 Don’t forget to sip local drinks along the way!"
    ],
    "beach fun": [
      "🏖️ Sun, sand, and waves — pure relaxation!",
      "🌊 Try building sandcastles — fun for all ages!",
      "☀️ Sunscreen is your best friend!",
      "🦀 Look out for little crabs — they’re adorable!"
    ],
    cycling: [
      "🚴 Ride safely — helmets are mandatory!",
      "🌿 Explore new trails and enjoy the fresh air.",
      "💨 Feel the wind in your hair — pure freedom!",
      "📸 Capture scenic routes along the way!"
    ]
  };

  // Pick a random tip
  const randomTipArray = activityTips[activity.toLowerCase()] || [];
  const randomTip =
    randomTipArray[Math.floor(Math.random() * randomTipArray.length)];

  // Existing API & graph logic unchanged...
  const apiKey = "b2cdfca52ed6401683963647252209";

  const fetchTripData = async () => {
    if (!city || !startDate || !endDate) return;
    setLoading(true);
    setError("");
    setTripData([]);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const results = [];
    const today = new Date();

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dt = d.toISOString().split("T")[0];
      const isFuture = d >= today;
      const endpoint = isFuture ? "forecast.json" : "history.json";

      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/${endpoint}?key=${apiKey}&q=${encodeURIComponent(
            city
          )}&dt=${dt}&days=1&aqi=no&alerts=no`
        );
        const data = await res.json();
        if (data.error) {
          setError(data.error.message || "API error");
          break;
        }
        const day = data.forecast.forecastday[0].day;
        const hourlyRaw = data.forecast.forecastday[0].hour;

        const hourly = hourlyRaw.map((h, i) => ({
          time: h.time.split(" ")[1].slice(0, 5),
          temp: h.temp_c + Math.sin((i / 24) * Math.PI * 2) * 2,
        }));

        const cond = (day.condition?.text || "").toLowerCase();
        const chanceOfRain = day.daily_chance_of_rain || 0;

        let suggestion = `Good day for ${activity}. Enjoy! 🌟`;

        if (chanceOfRain > 30) {
          suggestion =
            activity === "hiking"
              ? "🌧️ Rainy — indoor options advised."
              : activity === "fishing"
              ? "🌧️ Rainy — check indoor plans."
              : "🌧️ Bring waterproof gear; plan indoor activities.";
        } else if (cond.includes("snow")) {
          suggestion =
            activity === "traveling"
              ? "❄️ Snowy — travel carefully."
              : "❄️ Great for winter adventures!";
        } else if (day.maxwind_kph > 50) {
          suggestion = "💨 Windy — avoid exposed areas.";
        } else if (day.maxtemp_c > 35) {
          suggestion = "🔥 Very hot — hydrate well!";
        } else if (day.maxtemp_c < 5) {
          suggestion = "🥶 Cold — wear warm clothes!";
        }

        results.push({
          date: dt,
          max: day.maxtemp_c,
          min: day.mintemp_c,
          condition: day.condition?.text,
          wind: day.maxwind_kph,
          humidity: day.avghumidity,
          suggestion,
          hourly,
        });
      } catch (err) {
        console.error(err);
        setError("Network error");
      }
    }

    setTripData(results);
    setLoading(false);
  };

  return (
    <div className={`activity-page-root ${activity.toLowerCase().replace(" ", "-")}`}>
      <h2>{activity} Planner 🌟</h2>

      <div className="activity-intro">
        {(() => {
          switch (activity.toLowerCase()) {
            case "hiking":
              return (
                <>
                  <p>🥾 Hiking Challenge: Can you reach the highest viewpoint today?</p>
                  <p>🌲 Did you know? Hiking improves mood, creativity, and focus!</p>
                  <p>⛰️ Fun tip: Take a nature selfie with the best scenery you find.</p>
                </>
              );
            case "fishing":
              return (
                <>
                  <p>🎣 Fishing Fun: Patience is key — enjoy the calm!</p>
                  <p>🐟 Did you know? The oldest fishing rod dates back over 8,000 years!</p>
                  <p>🌅 Mini Challenge: Catch a fish (or take a scenic photo if no luck!).</p>
                </>
              );
            case "sightseeing":
              return (
                <>
                  <p>🏛️ Sightseeing Adventure: Explore local culture and history!</p>
                  <p>📸 Did you know? Taking photos increases your memory retention!</p>
                  <p>👟 Mini goal: Walk at least 5,000 steps today while discovering new spots.</p>
                </>
              );
            case "camping":
              return (
                <>
                  <p>🏕️ Camping Tip: Enjoy a campfire and starlit nights.</p>
                  <p>🌌 Did you know? Camping helps reset your circadian rhythm for better sleep.</p>
                  <p>🔥 Mini Challenge: Cook something fun over the campfire.</p>
                </>
              );
            case "food tours":
              return (
                <>
                  <p>🍲 Food Adventure: Taste new flavors like a local!</p>
                  <p>😋 Did you know? Trying new foods boosts creativity and openness.</p>
                  <p>🍹 Mini Challenge: Rate the top 3 dishes you try today!</p>
                </>
              );
            case "beach fun":
              return (
                <>
                  <p>🏖️ Beach Vibes: Sun, sand, and waves!</p>
                  <p>🦀 Did you know? Walking barefoot on sand strengthens foot muscles.</p>
                  <p>🌊 Mini Game: Build the most creative sandcastle!</p>
                </>
              );
            case "cycling":
              return (
                <>
                  <p>🚴 Cycling Adventure: Explore trails with the wind on your face!</p>
                  <p>🌿 Did you know? Cycling regularly improves heart and lung health.</p>
                  <p>💨 Mini Challenge: Try a new trail or increase your speed today!</p>
                </>
              );
            default:
              return <p>🌟 Have fun and enjoy your adventure today!</p>;
          }
        })()}
      </div>

      {/* Unique Random Tip Section */}
      <div className="activity-intro">
        {randomTip && <p>{randomTip}</p>}
      </div>

      {/* Existing inputs */}
      <div className="activity-inputs">
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={fetchTripData}>
          {loading ? "Loading..." : "Check"}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="trip-results">
        {tripData.map((d) => (
          <div key={d.date} className="trip-day-card luxury-card">
            <h4>{d.date} - {d.condition}</h4>
            <p className="suggestion">{d.suggestion}</p>
            <div className="stats-row">
              <div>🌡️ {d.min}°C - {d.max}°C</div>
              <div>💨 {d.wind} kph</div>
              <div>💧 {d.humidity}%</div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={d.hourly}>
                  <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: "#000", fontSize: 14, fontWeight: "bold" }}
                  />
                  <YAxis 
                    tick={{ fill: "#000", fontSize: 14, fontWeight: "bold" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      color: "#000",
                      borderRadius: "8px",
                      border: "none",
                      fontWeight: "bold",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#FFD700"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#FFD700" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

