// CHT-Travel-and-Tours-Web/JS/assets/user_JS/userTrips.js

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#tripsTable tbody");
  if (!tableBody) return;

  const searchInput = document.getElementById("tripsSearch");
  const countLabel = document.getElementById("tripsCountLabel");

  let trips = [];

  // Logout functionality
  const logoutBtn = document.getElementById("userLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem('cht_current_username');
      window.location.href = '../log_in.html';
    });
  }

  function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  function updateCount(count) {
    if (countLabel) {
      countLabel.textContent = `${count} trip${count === 1 ? "" : "s"}`;
    }
  }

  function renderTrips(filterText = "") {
    tableBody.innerHTML = "";
    
    let filtered = trips;
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = trips.filter(t =>
        (t.name && t.name.toLowerCase().includes(lower)) ||
        (t.location && t.location.toLowerCase().includes(lower)) ||
        (t.description && t.description.toLowerCase().includes(lower))
      );
    }
    
    updateCount(filtered.length);

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">No trips found</td></tr>`;
      return;
    }

    filtered.forEach(t => {
      const tr = document.createElement("tr");
      const statusClass = t.isActive ? "badge-success" : "badge-danger";
      tr.innerHTML = `
        <td>${t.id}</td>
        <td>${t.name}</td>
        <td>${t.description || "-"}</td>
        <td>${t.location || "-"}</td>
        <td>${formatDate(t.startDate)}</td>
        <td>${formatDate(t.endDate)}</td>
        <td><span class="badge ${statusClass}">${t.status}</span></td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function loadTrips() {
    fetch("./api/trips_list.php")
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          console.error("Failed to load trips:", data.error);
          alert(data.error || "Failed to load trips.");
          return;
        }
        trips = data.trips || [];
        renderTrips();
      })
      .catch(err => {
        console.error("Trips fetch error:", err);
        alert("Server error while loading trips.");
      });
  }

  // Search - real-time filtering
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderTrips(searchInput.value.trim());
    });
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        renderTrips(searchInput.value.trim());
      }
    });
  }

  // Initial load
  loadTrips();
});