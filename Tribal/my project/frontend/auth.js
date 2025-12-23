document.addEventListener("DOMContentLoaded", function () {
  // Select the forms and radio buttons
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const formChoice = document.getElementsByName("formChoice");

  // Show/hide forms based on radio button selection
  formChoice.forEach(input => {
    input.addEventListener("change", function () {
      if (this.value === "register") {
        registerForm.style.display = "block";
        loginForm.style.display = "none";
      } else if (this.value === "login") {
        registerForm.style.display = "none";
        loginForm.style.display = "block";
      }
    });
  });

  // Default form display (Register form shown initially)
  registerForm.style.display = "block";
  loginForm.style.display = "none";

  // Handle Register Form Submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      role: document.getElementById("role").value
    };

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      alert(result.message);

      if (response.ok) {
        window.location.href = "login.html";  // Redirect to login page after registration
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // Handle Login Form Submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (response.ok) {
        // ✅ Store the full user object instead of separate email/role
        localStorage.setItem("user", JSON.stringify(result.user));

        // Redirect based on role
        if (result.user.role === "king") {
          window.location.href = "dashboard-king.html";
        } else {
          window.location.href = "dashboard-user.html";
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
});
