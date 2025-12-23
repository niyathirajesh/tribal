const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
  time: String,
  reason: String,
  status: {
    type: String,
    default: "pending"
  }
});

module.exports = mongoose.model("Booking", bookingSchema);
