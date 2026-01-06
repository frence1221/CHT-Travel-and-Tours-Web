// CHT-Travel-and-Tours-Web/JS/assets/user_JS/userHotel.js

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#hotelsTable tbody");
  if (!tableBody) return;

  const searchInput = document.getElementById("hotelsSearch");
  const countLabel = document.getElementById("hotelsCountLabel");

  let hotels = [];

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
      countLabel.textContent = `${count} accommodation${count === 1 ? "" : "s"}`;
    }
  }

  function formatAmenities(amenities) {
    if (!amenities) return "-";
    // Convert semicolon-separated to badges
    return amenities.split(";").map(a => 
      `<span class="amenity-tag">${a.trim()}</span>`
    ).join(" ");
  }

  function renderHotels(filterText = "") {
    tableBody.innerHTML = "";
    
    let filtered = hotels;
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = hotels.filter(h =>
        (h.name && h.name.toLowerCase().includes(lower)) ||
        (h.address && h.address.toLowerCase().includes(lower))
      );
    }
    
    updateCount(filtered.length);

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No accommodations found</td></tr>`;
      return;
    }

    filtered.forEach(h => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${h.id}</td>
        <td>${h.name}</td>
        <td>${h.address || "-"}</td>
        <td>${h.contact || "-"}</td>
        <td>${h.numberOfRooms}</td>
        <td>${h.roomType || "-"}</td>
        <td>${formatAmenities(h.amenities)}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function loadHotels() {
    fetch("./api/hotels_list.php")
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          console.error("Failed to load accommodations:", data.error);
          alert(data.error || "Failed to load accommodations.");
          return;
        }
        hotels = data.hotels || [];
        renderHotels();
      })
      .catch(err => {
        console.error("Hotels fetch error:", err);
        alert("Server error while loading accommodations.");
      });
  }

  // Search - real-time filtering
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderHotels(searchInput.value.trim());
    });
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        renderHotels(searchInput.value.trim());
      }
    });
  }

  // Initial load
  loadHotels();
});