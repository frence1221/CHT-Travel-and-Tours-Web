document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const roleSelect = document.getElementById("role");
    const emailInput = document.getElementById("email");
    const passInput  = document.getElementById("password");

    const chosenRole = roleSelect ? roleSelect.value : "user"; // "admin" or "user"
    const email      = emailInput.value.trim();
    const password   = passInput.value;

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    // Detect correct API path based on current location
    let apiPath = "./HTML/api/login.php"; // Default for index.php at root
    if (window.location.pathname.includes("/HTML/")) {
      apiPath = "../api/login.php"; // For HTML/log_in.html
    }

    fetch(apiPath, {
      method: "POST",
      body: formData
    })
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) {
          alert(res.error || "Login failed.");
          return;
        }

        const dbRole = res.role; // "admin" or "user" from DB

        // Optional: ensure user didn't choose wrong role in the dropdown
        if (dbRole !== chosenRole) {
          alert(`Your account role is "${dbRole}", but you selected "${chosenRole}".`);
          return;
        }

        // Store name for greeting on dashboard
        localStorage.setItem("cht_current_username", res.name || res.email || email);

        // Redirect based on role
        let basePath = window.location.pathname.includes("/HTML/") ? "./" : "./HTML/";
        
        if (dbRole === "admin") {
          window.location.href = basePath + "adminDashboard/dashboard.html";
        } else {
          window.location.href = basePath + "userDashboard/userDashboard.html";
        }
      })
      .catch((err) => {
        console.error("Login error:", err);
        alert("Server error while logging in.");
      });
  });
});