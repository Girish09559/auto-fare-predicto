const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/cabAI");

const User = require("./models/User");

const SECRET = "cabsecretkey";

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "yourgmail@gmail.com",
    pass: "your_app_password"
  }
});

// Register
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashed });
  await user.save();

  await transporter.sendMail({
    from: "yourgmail@gmail.com",
    to: email,
    subject: "Registration Successful",
    text: "Welcome to AI Cab Fare Predictor!"
  });

  res.json({ message: "Registered Successfully" });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.json({ error: "Wrong Password" });

  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token });
});

// AI Fare Calculation
app.post("/fare", (req, res) => {
  const {
    pickup_lat,
    pickup_lng,
    drop_lat,
    drop_lng,
    vehicle,
    sharing,
    hour,
    day
  } = req.body;

  function distance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1*Math.PI/180) *
      Math.cos(lat2*Math.PI/180) *
      Math.sin(dLon/2) *
      Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const dist = distance(
    Number(pickup_lat),
    Number(pickup_lng),
    Number(drop_lat),
    Number(drop_lng)
  );

  let rate = 10;

  if(vehicle === "cab") rate = 12;
  if(vehicle === "auto") rate = 10;
  if(vehicle === "bike") rate = 8;
  if(vehicle === "metro") rate = 5;
  if(vehicle === "bus") rate = 3;

  let surge = 1;

  if(hour >= 18 && hour <= 22) surge += 0.3;
  if(day === "Saturday" || day === "Sunday") surge += 0.2;
  if(sharing) surge -= 0.3;

  const fare = dist * rate * surge;

  res.json({
    distance: dist.toFixed(2),
    fare: fare.toFixed(2)
  });
});

app.listen(5000, () => console.log("Server Running on 5000"));
