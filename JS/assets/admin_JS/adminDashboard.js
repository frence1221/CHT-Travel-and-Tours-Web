// CHT-Travel-and-Tours-Web/JS_assets/admin_JS/adminDashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // Only run on admin dashboard
  const titleEl = document.querySelector("h1.content-title");
  if (!titleEl || !titleEl.textContent.includes("Admin Dashboard")) return;

  const totalSalesEl      = document.getElementById("totalSalesValue");
  const totalBookingsEl   = document.getElementById("totalBookingsValue");
  const activePackagesEl  = document.getElementById("activePackagesValue");
  const activeEmployeesEl = document.getElementById("activeEmployeesValue");
  const recentBody        = document.querySelector("#recentBookingsTable tbody");
  const refreshBtn        = document.getElementById("refreshDashboardBtn");

  function formatPHP(v) {
    return "₱" + Number(v || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });
  }

  function loadDashboard() {
    // From HTML/adminDashboard/dashboard.html → ./api/dashboard_summary.php
    fetch("./api/dashboard_summary.php")
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          alert(data.error || "Failed to load dashboard data.");
          return;
        }

        if (totalSalesEl)      totalSalesEl.textContent      = formatPHP(data.totalSales);
        if (totalBookingsEl)   totalBookingsEl.textContent   = data.totalBookings;
        if (activePackagesEl)  activePackagesEl.textContent  = data.activePackages;
        if (activeEmployeesEl) activeEmployeesEl.textContent = data.activeEmployees;

        if (recentBody) {
          recentBody.innerHTML = "";
          (data.recentBookings || []).forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${row.id}</td>
              <td>${row.client || ""}</td>
              <td>${row.package || ""}</td>
              <td>${row.date || ""}</td>
              <td>${row.status || ""}</td>
            `;
            recentBody.appendChild(tr);
          });
        }
      })
      .catch(err => {
        console.error("Dashboard fetch error:", err);
        alert("Server error while loading dashboard.");
      });
  }

  loadDashboard();

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadDashboard);
  }
});