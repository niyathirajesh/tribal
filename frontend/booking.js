document.getElementById("bookingForm").addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    name: name.value,
    email: email.value,
    date: date.value,
    time: time.value,
    reason: reason.value
  };

  await fetch("http://localhost:3000/api/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  alert("Booking request sent");
});
