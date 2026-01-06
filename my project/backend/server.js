require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- MODELS ---------- */

// User model
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", UserSchema);

// Booking model
const BookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  time: String,
  reason: String,
  status: { type: String, default: "pending" }
});
const Booking = mongoose.model("Booking", BookingSchema);

/* ---------- DATABASE ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Mongo Error:", err));

/* ---------- EMAIL ---------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify(err => {
  if (err) console.error("Email Error:", err);
  else console.log("Email server ready");
});

/* ---------- AUTH ---------- */

// Register
app.post("/api/register", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ message: "Registered successfully", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Email already exists" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne(req.body);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ message: "Login successful", userId: user._id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ---------- BOOKING ---------- */
app.post("/api/booking", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    const acceptLink = `http://localhost:${process.env.PORT}/api/booking/${booking._id}/accept`;
    const rejectLink = `http://localhost:${process.env.PORT}/api/booking/${booking._id}/reject`;

    // Email to King
    try {
      await transporter.sendMail({
        to: process.env.KING_EMAIL,
        subject: "New Appointment Request ",
        html: `
          <h2>New Appointment Request</h2>
          <p><b>Name:</b> ${booking.name}</p>
          <p><b>Email:</b> ${booking.email}</p>
          <p><b>Date:</b> ${booking.date}</p>
          <p><b>Time:</b> ${booking.time}</p>
          <p><b>Reason:</b> ${booking.reason}</p>
          <br>
          <a href="${acceptLink}" style="background:#28a745;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">✅ ACCEPT</a>
          &nbsp;
          <a href="${rejectLink}" style="background:#dc3545;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">❌ REJECT</a>
        `
      });
      console.log("Email sent to King");
    } catch (err) {
      console.error("Failed to send email to King:", err);
    }

    res.json({ message: "Booking request sent to King", bookingId: booking._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed" });
  }
});

/* ---------- ACCEPT ---------- */
app.get("/api/booking/:id/accept", async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.status !== "pending") return res.send("Already processed");

  booking.status = "accepted";
  await booking.save();

  try {
    await transporter.sendMail({
      to: booking.email,
      subject: "Your Appointment is Accepted 👑",
      html: `<h2>Your Appointment is Accepted</h2><p>Date: ${booking.date}</p><p>Time: ${booking.time}</p>`
    });
  } catch (err) {
    console.error("Failed to notify user:", err);
  }

  res.send("Appointment accepted and user notified");
});

/* ---------- REJECT ---------- */
app.get("/api/booking/:id/reject", async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking || booking.status !== "pending") return res.send("Already processed");

  booking.status = "rejected";
  await booking.save();

  try {
    await transporter.sendMail({
      to: booking.email,
      subject: "Your Appointment is Rejected ❌",
      html: `<p>Sorry, your appointment request was rejected.</p>`
    });
  } catch (err) {
    console.error("Failed to notify user:", err);
  }

  res.send("Appointment rejected and user notified");
});

/* ---------- GET BOOKING STATUS ---------- */
app.get("/api/booking/:id", async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  res.json({ status: booking.status });
});

/* ---------- SERVER ---------- */
app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT}`));
