// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("MongoDB connection error:", err));

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  weatherPref: String,
  timePref: String,
  rarity: String,
  phenomenon: String,
});

const User = mongoose.model("User", userSchema);

// Signup route
app.post("/api/signup", async (req, res) => {
  const { name, email, password, weatherPref, timePref, rarity, phenomenon } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      weatherPref,
      timePref,
      rarity,
      phenomenon,
    });

    await newUser.save();
    res.status(201).json({ message: "Sign up successful 🎉" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Signin route
app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    res.status(200).json({ message: "Signed in successfully ✅" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));

// Update user's city
app.post("/api/setcity", async (req, res) => {
  const { email, city } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    user.city = city;
    await user.save();

    res.status(200).json({ message: "City saved ✅", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});



const axios = require("axios");

app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon, date } = req.query;

    if (!lat || !lon || !date)
      return res.status(400).json({ message: "lat, lon, date required" });

    const parameters = "t_2m:C,wind_speed_10m:kmh,precip_1h:mm,relative_humidity_2m:p";

    const url = `https://${process.env.METEO_USER}:${process.env.METEO_PASS}@api.meteomatics.com/${date}T12:00:00Z/${parameters}/${lat},${lon}/json`;

    const response = await axios.get(url);

    const data = response.data.data;

    // Extract actual numbers
    const temp = data.find(d => d.parameter === "t_2m:C").coordinates[0].dates[0].value;
    const wind = data.find(d => d.parameter === "wind_speed_10m:kmh").coordinates[0].dates[0].value;
    const rain = data.find(d => d.parameter === "precip_1h:mm").coordinates[0].dates[0].value;
    const humidity = data.find(d => d.parameter === "relative_humidity_2m:p").coordinates[0].dates[0].value;

    // Convert to simple conditions
    const hot = temp > 35;
    const cold = temp < 5;
    const windy = wind > 30;
    const wet = rain > 5;
    const uncomfortable = humidity > 70 && temp > 28;

    res.json({ temp, wind, rain, humidity, hot, cold, windy, wet, uncomfortable });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Failed to fetch weather data" });
  }
});

