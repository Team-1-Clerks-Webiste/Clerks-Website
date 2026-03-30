const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".login-form");

  if (!registerForm) return;

  if (document.getElementById("confirm-password")) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("full-name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      window.location.href = "login.html";
    });
  } else if (document.getElementById("email") && !document.getElementById("confirm-password")) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      window.location.href = "../index.html";
    });
  }
});
