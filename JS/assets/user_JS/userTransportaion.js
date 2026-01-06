// CHT-Travel-and-Tours-Web/JS/assets/user_JS/userTransportation.js

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#transportTable tbody");
  if (!tableBody) return;

  const searchInput = document.getElementById("transportSearch");
  const countLabel = document.getElementById("transportCountLabel");

  let vehicles = [];

  // Logout functionality
  const logoutBtn = document.getElementById("userLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem('cht_current_username');
      window.location.href = '../log_in.html';
    });
  }

  function updateCount(count) {
    if (countLabel) {
      countLabel.textContent = `${count} vehicle${count === 1 ? "" : "s"}`;
    }
  }

  function renderVehicles(filterText = "") {
    tableBody.innerHTML = "";
    
    let filtered = vehicles;
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = vehicles.filter(v =>
        (v.type && v.type.toLowerCase().includes(lower)) ||
        (v.provider && v.provider.toLowerCase().includes(lower)) ||
        (v.plateNumber && v.plateNumber.toLowerCase().includes(lower))
      );
    }
    
    updateCount(filtered.length);

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">No vehicles found</td></tr>`;
      return;
    }

    filtered.forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.id}</td>
        <td>${v.type || "-"}</td>
        <td>${v.capacity}</td>
        <td>${v.plateNumber || "-"}</td>
        <td>${v.provider || "-"}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function loadVehicles() {
    fetch("./api/transportation_list.php")
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          console.error("Failed to load vehicles:", data.error);
          alert(data.error || "Failed to load vehicles.");
          return;
        }
        vehicles = data.vehicles || [];
        renderVehicles();
      })
      .catch(err => {
        console.error("Vehicles fetch error:", err);
        alert("Server error while loading vehicles.");
      });
  }

  // Search - real-time filtering
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderVehicles(searchInput.value.trim());
    });
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        renderVehicles(searchInput.value.trim());
      }
    });
  }

  // Initial load
  loadVehicles();
});