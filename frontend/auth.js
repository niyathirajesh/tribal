document.addEventListener("DOMContentLoaded", () => {

  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  /* REGISTER */
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      };

      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      alert(result.message || "Registered");
    });
  }

  /* LOGIN */
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message);
        return;
      }

      localStorage.setItem("user", JSON.stringify(result.user));

      window.location.href =
        result.user.role === "king"
          ? "dashboard-king.html"
          : "dashboard-user.html";
    });
  }

});
