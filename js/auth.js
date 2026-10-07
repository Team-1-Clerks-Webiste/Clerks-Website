const API_BASE = "http://localhost:8000";

function performLogout() {
  // Save the logged-in cart under this user's key
  const userId = localStorage.getItem("user_id");
  if (userId) {
    localStorage.setItem(
      "clerks_cart_user_" + userId,
      localStorage.getItem("clerks_cart") || "[]",
    );
  }

  // Restore cart to what it was before login
  const preLoginCart = localStorage.getItem("clerks_cart_before_login");
  if (preLoginCart !== null) {
    localStorage.setItem("clerks_cart", preLoginCart);
    localStorage.removeItem("clerks_cart_before_login");
  } else {
    localStorage.removeItem("clerks_cart");
  }
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
  const isInPages = window.location.pathname.includes("/pages/");
  window.location.href = isInPages ? "login.html" : "./pages/login.html";
}

function updateNavAuth() {
  const userId = localStorage.getItem("user_id");
  const username = localStorage.getItem("username");
  if (!userId || !username) return;

  const userImg = document.querySelector('img[src*="user.png"]');
  if (!userImg) return;
  const loginLink = userImg.closest("a");
  if (!loginLink) return;

  loginLink.title = "My account";

  const greeting = document.createElement("span");
  greeting.textContent = "Hi, " + username;
  greeting.style.fontSize = "12px";
  greeting.style.color = "#c9922a";
  greeting.style.marginRight = "4px";
  greeting.style.whiteSpace = "nowrap";

  loginLink.parentNode.insertBefore(greeting, loginLink);
}

function setupLogoutButton() {
  const userId = localStorage.getItem("user_id");
  const username = localStorage.getItem("username");
  if (!userId || !username) return;

  const logoutRow = document.getElementById("logout-row");
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) return;

  if (logoutRow) logoutRow.style.display = "block";
  logoutBtn.style.display = "inline";
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    performLogout();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavAuth();
  setupLogoutButton();

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
  } else if (
    document.getElementById("email") &&
    !document.getElementById("confirm-password")
  ) {
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

      // If already logged in as another user, save their cart first
      const currentUserId = localStorage.getItem("user_id");
      if (currentUserId) {
        localStorage.setItem(
          "clerks_cart_user_" + currentUserId,
          localStorage.getItem("clerks_cart") || "[]",
        );
      } else {
        // Save guest cart so it can be restored on logout
        localStorage.setItem(
          "clerks_cart_before_login",
          localStorage.getItem("clerks_cart") || "[]",
        );
      }

      // Restore this user's saved cart, or start fresh
      const savedUserCart = localStorage.getItem(
        "clerks_cart_user_" + data.user_id,
      );
      localStorage.setItem("clerks_cart", savedUserCart || "[]");
      localStorage.removeItem("clerks_cart_user_" + data.user_id);

      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      window.location.href = "../index.html";
    });
  }
});
