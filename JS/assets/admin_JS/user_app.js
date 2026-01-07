// Simple front-end behavior for the USER dashboard (no backend)



// DASHBOARD: Fetch and render recent bookings from API
document.addEventListener("DOMContentLoaded", () => {
  // Show username if stored by login
  const userNameSpan = document.getElementById("userNameLabel");
  const storedName = localStorage.getItem("cht_current_username");
  if (userNameSpan && storedName) {
    userNameSpan.textContent = storedName;
  }

  // Populate bookings table from API (recent only)
  const tbody = document.querySelector("#userBookingsTable tbody");
  if (tbody) {
    fetch("api/bookings_list.php?recent=1")
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = "";
        if (data.success && data.bookings && data.bookings.length) {
          data.bookings.slice(0, 5).forEach(b => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${b.id}</td>
              <td>${b.clientName || ""}</td>
              <td>${b.destination || ""}</td>
              <td>${b.packageName || ""}</td>
              <td>${b.startDate || ""}</td>
              <td>${b.endDate || ""}</td>
              <td><span class="status-pill ${b.status === "Completed" ? "status-completed" : "status-upcoming"}">${b.status}</span></td>
            `;
            tbody.appendChild(tr);
          });
        } else {
          tbody.innerHTML = '<tr><td colspan="7">No bookings found.</td></tr>';
        }
      });
  }

  // Logout button
  const logoutBtn = document.getElementById("userLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "../log_in.html";
    });
  }

  // New booking buttons (banner + sidebar)
  document.querySelectorAll(".btn-banner-booking, .btn-new-booking").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = "Bookings/bookings1.html";
    });
  });
});

// ... existing code ...

document.addEventListener("DOMContentLoaded", () => {
  // ... existing username / bookings table code ...

  // New booking buttons (banner + sidebar)
  document.querySelectorAll(".btn-banner-booking, .btn-new-booking").forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = "Bookings/bookings1.html";   // <-- go to step 1 page
    });
  });

  // Logout button
  const logoutBtn = document.getElementById("userLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "../log_in.html";
    });
  }
});

// userBookings.JS

// Bookings list page: reads bookings saved in localStorage by step 6


// USER BOOKINGS PAGE: Fetch and render bookings from API
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#bookingsTable tbody");
  const searchInput = document.getElementById("bookingsSearch");
  const searchBtn = document.getElementById("bookingsSearchBtn");
  const statTotal = document.getElementById("statTotal");
  const statConfirmed = document.getElementById("statConfirmed");
  const statCancelled = document.getElementById("statCancelled");
  const countLabel = document.getElementById("bookingsCountLabel");

  let bookings = [];
  let filteredBookings = [];

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  function renderStats() {
    if (statTotal) statTotal.textContent = bookings.length;
    const confirmed = bookings.filter(b => b.status === "Confirmed").length;
    const cancelled = bookings.filter(b => b.status === "Cancelled").length;
    if (statConfirmed) statConfirmed.textContent = confirmed;
    if (statCancelled) statCancelled.textContent = cancelled;
    if (countLabel) countLabel.textContent = `${bookings.length} booking(s)`;
  }

  function renderTable() {
    if (!tbody) return;
    tbody.innerHTML = "";
    filteredBookings.forEach(b => {
      const statusClass =
        b.status === "Cancelled"
          ? "status-cancelled"
          : b.status === "Completed"
          ? "status-completed"
          : "status-upcoming";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${b.id}</td>
        <td>${b.clientName || ""}</td>
        <td>${b.destination || ""}</td>
        <td>${b.packageName || ""}</td>
        <td>${formatDate(b.startDate)}</td>
        <td>${formatDate(b.endDate)}</td>
        <td>
          <span class="status-pill-booking ${statusClass}">${b.status}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function applySearch() {
    const q = (searchInput.value || "").toLowerCase();
    if (!q) {
      filteredBookings = [...bookings];
    } else {
      filteredBookings = bookings.filter(b =>
        `${b.clientName} ${b.destination} ${b.packageName}`
          .toLowerCase()
          .includes(q)
      );
    }
    renderTable();
  }

  // Fetch bookings from API
  function fetchBookings() {
    fetch("api/bookings_list.php")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.bookings) {
          bookings = data.bookings;
          filteredBookings = [...bookings];
          renderStats();
          renderTable();
        } else {
          bookings = [];
          filteredBookings = [];
          renderStats();
          renderTable();
        }
      });
  }

  // Initial render
  fetchBookings();

  // Search
  if (searchBtn) searchBtn.addEventListener("click", applySearch);
  if (searchInput) searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") applySearch();
  });
});


//render

function renderStats() {
  statTotal.textContent = bookings.length;

  const confirmed = bookings.filter(b => b.status === "Confirmed").length;
  const cancelled = bookings.filter(b => b.status === "Cancelled").length;

  statConfirmed.textContent = confirmed;
  statCancelled.textContent = cancelled;

  const label = document.getElementById("bookingsCountLabel");
  if (label) {
    label.textContent = `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`;
  }
}

//userClients.js

// assets/js/user-clients.js

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#clientsTable tbody");
  const searchInput = document.getElementById("clientsSearch");

  const addClientBtn = document.getElementById("addClientBtn");
  const sidebarNewBookingBtn = document.getElementById("sidebarNewBookingBtn");
  const logoutBtn = document.getElementById("userLogoutBtn");

  // Modal elements
  const modalOverlay = document.getElementById("clientModalOverlay");
  const modalTitle = document.getElementById("clientModalTitle");
  const closeModalBtn = document.getElementById("closeClientModalBtn");
  const cancelClientBtn = document.getElementById("cancelClientBtn");
  const clientForm = document.getElementById("clientForm");

  const idField = document.getElementById("clientId");
  const nameField = document.getElementById("clientName");
  const emailField = document.getElementById("clientEmail");
  const contactField = document.getElementById("clientContact");
  const addressField = document.getElementById("clientAddress");
  const typeField = document.getElementById("clientType");

  // -------- Seed data if none --------
  let clients = JSON.parse(localStorage.getItem("cht_clients") || "[]");

  if (!clients.length) {
    clients = [
      { id: 1, name: "Carlos Ramirez", email: "carlos@example.com", contact: "09180000001", address: "Manila, PH", type: "REGULAR", registered: "2025-01-05" },
      { id: 2, name: "Jenny Villanueva", email: "jenny@example.com", contact: "09180000002", address: "Quezon City, PH", type: "REGULAR", registered: "2025-01-10" },
      { id: 3, name: "Sunrise Corp.", email: "travel@sunrisecorp.com", contact: "09180000003", address: "Makati, PH", type: "CORPORATE", registered: "2025-01-15" },
      { id: 4, name: "Miguel Santos", email: "miguel.s@example.com", contact: "09180000004", address: "Cebu City, PH", type: "REGULAR", registered: "2025-02-01" },
      { id: 5, name: "Andrea Bautista", email: "andrea.b@example.com", contact: "09180000005", address: "Davao City, PH", type: "VIP", registered: "2025-02-10" },
      { id: 6, name: "Frence", email: "frence@gmail.com", contact: "09510986858", address: "Not specified", type: "REGULAR", registered: "2026-01-06" }
    ];
    localStorage.setItem("cht_clients", JSON.stringify(clients));
  }

  let filteredClients = [...clients];

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  function typeBadge(type) {
    const t = (type || "REGULAR").toUpperCase();
    if (t === "CORPORATE") {
      return `<span class="client-type-badge client-type-corporate">CORPORATE</span>`;
    }
    if (t === "VIP") {
      return `<span class="client-type-badge client-type-vip">VIP</span>`;
    }
    return `<span class="client-type-badge client-type-regular">REGULAR</span>`;
  }

  function renderClients() {
    if (!tbody) return;
    tbody.innerHTML = "";
    filteredClients.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.email || ""}</td>
        <td>${c.contact || ""}</td>
        <td>${c.address || ""}</td>
        <td>${typeBadge(c.type)}</td>
        <td>${formatDate(c.registered)}</td>
        <td>
          <button class="client-action-btn" data-action="edit" data-id="${c.id}">✎</button>
          <button class="client-action-btn delete" data-action="delete" data-id="${c.id}">🗑</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderClients();

  // -------- Search --------
  function applySearch() {
    const q = (searchInput.value || "").toLowerCase();
    if (!q) {
      filteredClients = [...clients];
    } else {
      filteredClients = clients.filter(c =>
        `${c.name} ${c.email} ${c.contact}`.toLowerCase().includes(q)
      );
    }
    renderClients();
  }

  searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") applySearch();
  });

  // -------- Modal open/close --------
  function openModal(mode, client) {
    modalOverlay.classList.remove("hidden");
    if (mode === "add") {
      modalTitle.textContent = "Add New Client";
      clientForm.reset();
      idField.value = "";
      typeField.value = "REGULAR";
    } else if (mode === "edit" && client) {
      modalTitle.textContent = "Edit Client";
      idField.value = client.id;
      nameField.value = client.name || "";
      emailField.value = client.email || "";
      contactField.value = client.contact || "";
      addressField.value = client.address || "";
      typeField.value = (client.type || "REGULAR").toUpperCase();
    }
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
  }

  addClientBtn.addEventListener("click", () => openModal("add"));
  closeModalBtn.addEventListener("click", closeModal);
  cancelClientBtn.addEventListener("click", closeModal);

  // Click background to close
  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeModal();
  });

  // -------- Table actions (edit/delete) --------
  tbody.addEventListener("click", e => {
    const btn = e.target.closest(".client-action-btn");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const client = clients.find(c => c.id === id);
    if (!client) return;

    if (btn.dataset.action === "edit") {
      openModal("edit", client);
    } else if (btn.dataset.action === "delete") {
      if (confirm(`Delete client ${client.name}?`)) {
        clients = clients.filter(c => c.id !== id);
        localStorage.setItem("cht_clients", JSON.stringify(clients));
        filteredClients = [...clients];
        renderClients();
      }
    }
  });

  // -------- Save client (add or edit) --------
  clientForm.addEventListener("submit", e => {
    e.preventDefault();

    const idVal = idField.value.trim();
    const data = {
      id: idVal ? parseInt(idVal, 10) : getNextClientId(),
      name: nameField.value.trim(),
      email: emailField.value.trim(),
      contact: contactField.value.trim(),
      address: addressField.value.trim() || "Not specified",
      type: typeField.value || "REGULAR",
      registered: idVal
        ? (clients.find(c => c.id === parseInt(idVal, 10))?.registered || new Date().toISOString().slice(0,10))
        : new Date().toISOString().slice(0, 10)
    };

    if (!data.name) {
      alert("Name is required.");
      return;
    }

    if (idVal) {
      const index = clients.findIndex(c => c.id === data.id);
      if (index > -1) clients[index] = data;
    } else {
      clients.push(data);
    }

    localStorage.setItem("cht_clients", JSON.stringify(clients));
    filteredClients = [...clients];
    renderClients();
    closeModal();
  });

  function getNextClientId() {
    return clients.length ? Math.max(...clients.map(c => c.id)) + 1 : 1;
  }

  // -------- Sidebar New Booking + Logout --------
  if (sidebarNewBookingBtn) {
    sidebarNewBookingBtn.addEventListener("click", () => {
      window.location.href = "Bookings/bookings1.html";
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "../log_in.html";
    });
  }
});

//userTourPackage.js

// assets/js/user-tour-packages.js
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("packagesGrid");
  const searchInput = document.getElementById("packagesSearch");
  const countLabel = document.getElementById("packagesCountLabel");

  const sidebarNewBookingBtn = document.getElementById("sidebarNewBookingBtn");
  const logoutBtn = document.getElementById("userLogoutBtn");

  // Load packages from localStorage
  let packages = JSON.parse(localStorage.getItem("cht_packages") || "[]");

  // Seed demo data if none (optional)
  if (!packages.length) {
    packages = [
      {
        id: 10,
        name: "Hokkaido Icebreaker + Sapporo Snow Festival",
        destination: "Hokkaido, Japan",
        durationDays: 6,
        maxPax: 30,
        price: 2288,
        status: "Active",
        description: "Drift ice cruise, penguins, snow festival in Hokkaido",
        inclusions: "flights, hotel, tours, some meals"
      },
      {
        id: 11,
        name: "Hong Kong & Macau Getaway",
        destination: "Hong Kong & Macau",
        durationDays: 4,
        maxPax: 40,
        price: 449,
        status: "Active",
        description: "City highlights of Hong Kong & Macau with optional Disney",
        inclusions: "hotel, tours, some meals"
      },
      {
        id: 12,
        name: "Bali 4D3N Christmas Tour",
        destination: "Bali, Indonesia",
        durationDays: 4,
        maxPax: 20,
        price: 28888,
        status: "Active",
        description: "Bali Christmas special visiting famous temples and waterfalls",
        inclusions: "flights, hotel, tours, breakfast"
      },
      {
        id: 13,
        name: "Taiwan Taipei + Taichung 4D3N",
        destination: "Taipei & Taichung, Taiwan",
        durationDays: 4,
        maxPax: 35,
        price: 27988,
        status: "Active",
        description: "Taipei and Taichung highlights, flower garden and night mkts",
        inclusions: "flights, hotel, tours, some meals"
      }
    ];
    localStorage.setItem("cht_packages", JSON.stringify(packages));
  }

  let filteredPackages = [...packages];

  function formatPrice(v) {
    return "₱" + Number(v || 0).toLocaleString("en-PH", { minimumFractionDigits: 0 });
  }

  function renderCount() {
    if (!countLabel) return;
    const total = filteredPackages.length;
    countLabel.textContent = `${total} package${total === 1 ? "" : "s"}`;
  }

  function renderPackages() {
    if (!grid) return;
    grid.innerHTML = "";
    filteredPackages.forEach(pkg => {
      const card = document.createElement("article");
      card.className = "user-package-card";

      const duration = pkg.durationDays || 0;
      const maxPax = pkg.maxPax || 0;
      const status = (pkg.status || "Active").toLowerCase();

      card.innerHTML = `
        <div class="user-package-card-header">
          <h3>${pkg.destination || "Destination"}</h3>
        </div>
        <div class="user-package-card-body">
          <div class="user-package-chip">${pkg.destination || "Destination"}</div>
          <div class="user-package-title">${pkg.name || "Untitled Package"}</div>
          <div class="user-package-description">
            ${pkg.description || ""}
          </div>
          <div class="user-package-meta">
            <span>📅 ${duration} Days</span>
            <span>👥 Max ${maxPax} pax</span>
          </div>
          <div class="user-package-inclusions">
            ✓ ${pkg.inclusions || "flights • hotel • tours"}
          </div>
          <div class="user-package-price-row">
            <div class="user-package-price">
              ${formatPrice(pkg.price)} <span class="unit">/ person</span>
            </div>
            <div class="user-package-status">
              ${status === "active" ? "Active" : status}
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    renderCount();
  }

  renderPackages();

  // Search filter
  function applySearch() {
    const q = (searchInput.value || "").toLowerCase();
    if (!q) {
      filteredPackages = [...packages];
    } else {
      filteredPackages = packages.filter(p =>
        `${p.name} ${p.destination}`.toLowerCase().includes(q)
      );
    }
    renderPackages();
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") applySearch();
    });
  }

  // Sidebar / logout
  if (sidebarNewBookingBtn) {
    sidebarNewBookingBtn.addEventListener("click", () => {
      window.location.href = "Bookings/bookings1.html";
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "../log_in.html";
    });
  }
});

//userTrips.js

// assets/js/user-trips.js

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#tripsTable tbody");
  const searchInput = document.getElementById("tripsSearch");
  const countLabel = document.getElementById("tripsCountLabel");

  const sidebarNewBookingBtn = document.getElementById("sidebarNewBookingBtn");
  const logoutBtn = document.getElementById("userLogoutBtn");

  // Load trips from localStorage
  let trips = JSON.parse(localStorage.getItem("cht_trips") || "[]");

  // Seed demo data if none yet
  if (!trips.length) {
    trips = [
      { id: 51, name: "Arrival & City Intro", description: "Arrival in Bali, short city tour", location: "Bali", startDate: "2025-12-25", endDate: "2025-12-25", status: "Active" },
      { id: 52, name: "Ulun Danu & Beratan", description: "Ulun Danu Temple & Beratan Lake", location: "Bali", startDate: "2025-12-26", endDate: "2025-12-26", status: "Active" },
      { id: 53, name: "Tanah Lot & Waterfalls", description: "Tanah Lot & Tukad Waterfall", location: "Bali", startDate: "2025-12-27", endDate: "2025-12-27", status: "Active" },
      { id: 54, name: "Free Time & Departure", description: "Free time then airport transfer", location: "Bali", startDate: "2025-12-28", endDate: "2025-12-28", status: "Active" },
      { id: 31, name: "Arrival & Bibai Snowland", description: "Arrival in Hokkaido + Bibai Snowland", location: "Hokkaido", startDate: "2026-02-02", endDate: "2026-02-02", status: "Active" }
      // ...you can add more demo records if desired
    ];
    localStorage.setItem("cht_trips", JSON.stringify(trips));
  }

  let filteredTrips = [...trips];

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  function renderCount() {
    const total = filteredTrips.length;
    if (countLabel) {
      countLabel.textContent = `${total} trip${total === 1 ? "" : "s"}`;
    }
  }

  function renderTrips() {
    if (!tbody) return;
    tbody.innerHTML = "";
    filteredTrips.forEach(t => {
      const tr = document.createElement("tr");
      const statusClass =
        (t.status || "Active").toLowerCase() === "active"
          ? "trip-status-active"
          : "trip-status-inactive";

      tr.innerHTML = `
        <td>${t.id}</td>
        <td>${t.name}</td>
        <td>${t.description || ""}</td>
        <td>${t.location || ""}</td>
        <td>${formatDate(t.startDate)}</td>
        <td>${formatDate(t.endDate)}</td>
        <td>
          <span class="trip-status-pill ${statusClass}">
            ${t.status || "Active"}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
    renderCount();
  }

  renderTrips();

  // Search by name or location
  function applySearch() {
    const q = (searchInput.value || "").toLowerCase();
    if (!q) {
      filteredTrips = [...trips];
    } else {
      filteredTrips = trips.filter(t =>
        `${t.name} ${t.location}`.toLowerCase().includes(q)
      );
    }
    renderTrips();
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") applySearch();
    });
  }

  // New booking shortcut from sidebar
  if (sidebarNewBookingBtn) {
    sidebarNewBookingBtn.addEventListener("click", () => {
      window.location.href = "Bookings/bookings1.html";
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "log_in.html";
    });
  }
});

// userHotel.js

// assets/js/user-hotel.js

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("hotelsGrid");
  const searchInput = document.getElementById("hotelsSearch");
  const countLabel = document.getElementById("hotelsCountLabel");

  const sidebarNewBookingBtn = document.getElementById("sidebarNewBookingBtn");
  const logoutBtn = document.getElementById("userLogoutBtn");

  // Load from localStorage
  let hotels = JSON.parse(localStorage.getItem("cht_hotels") || "[]");

  // Seed demo data if none
  if (!hotels.length) {
    hotels = [
      {
        id: 1,
        name: "Bali Beach Resort",
        location: "Kuta, Bali",
        phone: "+62-361-000003",
        roomType: "Deluxe Room",
        roomsAvailable: 60,
        facilities: "Pool, Beachfront, WiFi"
      },
      {
        id: 2,
        name: "Hong Kong City Hotel",
        location: "Kowloon, Hong Kong",
        phone: "+852-0000002",
        roomType: "Standard Room",
        roomsAvailable: 120,
        facilities: "WiFi, Breakfast"
      },
      {
        id: 3,
        name: "Sapporo Snow Hotel",
        location: "Sapporo, Hokkaido",
        phone: "+81-11-000001",
        roomType: "Standard Room",
        roomsAvailable: 80,
        facilities: "WiFi, Breakfast, Heater"
      },
      {
        id: 4,
        name: "Taichung Garden Hotel",
        location: "Taichung",
        phone: "+886-4-000005",
        roomType: "Standard Room",
        roomsAvailable: 70,
        facilities: "WiFi, Breakfast"
      },
      {
        id: 5,
        name: "Taipei Downtown Hotel",
        location: "Taipei",
        phone: "+886-2-000004",
        roomType: "Standard Room",
        roomsAvailable: 100,
        facilities: "WiFi, Breakfast"
      }
    ];
    localStorage.setItem("cht_hotels", JSON.stringify(hotels));
  }

  let filteredHotels = [...hotels];

  function renderCount() {
    const total = filteredHotels.length;
    if (countLabel) {
      countLabel.textContent = `${total} accommodation${total === 1 ? "" : "s"}`;
    }
  }

  function renderHotels() {
    if (!grid) return;
    grid.innerHTML = "";
    filteredHotels.forEach(h => {
      const card = document.createElement("article");
      card.className = "hotel-card";

      card.innerHTML = `
        <div class="hotel-card-header">
          <div class="hotel-card-icon">▢</div>
          <div class="hotel-card-name">${h.name || "Hotel"}</div>
        </div>
        <div class="hotel-card-meta">${h.location || ""}</div>
        <div class="hotel-card-meta">${h.phone || ""}</div>
        <div class="hotel-card-room-type">${h.roomType || "Standard Room"}</div>
        <div class="hotel-card-availability">
          ${h.roomsAvailable || 0} rooms available
        </div>
        <div class="hotel-card-facilities">
          ✓ ${h.facilities || ""}
        </div>
      `;
      grid.appendChild(card);
    });
    renderCount();
  }

  renderHotels();

  // Search filter
  function applySearch() {
    const q = (searchInput.value || "").toLowerCase();
    if (!q) {
      filteredHotels = [...hotels];
    } else {
      filteredHotels = hotels.filter(h =>
        `${h.name} ${h.location}`.toLowerCase().includes(q)
      );
    }
    renderHotels();
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") applySearch();
    });
  }

  // Sidebar New Booking
  if (sidebarNewBookingBtn) {
    sidebarNewBookingBtn.addEventListener("click", () => {
      window.location.href = "Bookings/bookings1.html";
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "../log_in.html";
    });
  }
});

// userTransportation.js

// assets/js/user-transportation.js

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#transportTable tbody");
  const searchInput = document.getElementById("transportSearch");
  const countLabel = document.getElementById("transportCountLabel");

  const sidebarNewBookingBtn = document.getElementById("sidebarNewBookingBtn");
  const logoutBtn = document.getElementById("userLogoutBtn");

  // Load from localStorage
  let vehicles = JSON.parse(localStorage.getItem("cht_transport") || "[]");

  // Seed demo data if none
  if (!vehicles.length) {
    vehicles = [
      {
        id: 1,
        type: "Bus",
        capacity: "40 seats",
        plate: "HOK-1234",
        provider: "Hokkaido Tours Co.",
        pricePerDay: 5000
      },
      {
        id: 2,
        type: "Bus",
        capacity: "45 seats",
        plate: "HK-5678",
        provider: "Hong Kong Coaches",
        pricePerDay: 5000
      },
      {
        id: 3,
        type: "Bus",
        capacity: "35 seats",
        plate: "BALI-009",
        provider: "Bali Transport",
        pricePerDay: 5000
      },
      {
        id: 4,
        type: "Bus",
        capacity: "40 seats",
        plate: "TPE-2026",
        provider: "Taiwan Coaches",
        pricePerDay: 5000
      }
    ];
    localStorage.setItem("cht_transport", JSON.stringify(vehicles));
  }

  let filteredVehicles = [...vehicles];

  function formatPHP(n) {
    return "₱" + Number(n || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 0
    });
  }

  function renderCount() {
    const total = filteredVehicles.length;
    if (countLabel) {
      countLabel.textContent = `${total} vehicle${total === 1 ? "" : "s"}`;
    }
  }

  function renderVehicles() {
    if (!tbody) return;
    tbody.innerHTML = "";
    filteredVehicles.forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.id}</td>
        <td>${v.type}</td>
        <td>${v.capacity}</td>
        <td>${v.plate}</td>
        <td>${v.provider}</td>
        <td class="transport-price">${formatPHP(v.pricePerDay)}</td>
      `;
      tbody.appendChild(tr);
    });
    renderCount();
  }

  renderVehicles();

  function applySearch() {
    const q = (searchInput.value || "").toLowerCase();
    if (!q) {
      filteredVehicles = [...vehicles];
    } else {
      filteredVehicles = vehicles.filter(v =>
        `${v.type} ${v.provider}`.toLowerCase().includes(q)
      );
    }
    renderVehicles();
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") applySearch();
    });
  }

  // New booking from sidebar
  if (sidebarNewBookingBtn) {
    sidebarNewBookingBtn.addEventListener("click", () => {
      window.location.href = "Bookings/bookings1.html";
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "../log_in.html";
    });
  }
});

// userPayments.js

// assets/js/user-payments.js

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#paymentsTable tbody");
  const searchInput = document.getElementById("paymentsSearch");

  const statTotalReceived = document.getElementById("statTotalReceived");
  const statPendingAmount = document.getElementById("statPendingAmount");
  const statTransactions = document.getElementById("statTransactions");

  const addPaymentBtn = document.getElementById("addPaymentBtn");
  const modalOverlay = document.getElementById("paymentModalOverlay");
  const closeModalBtn = document.getElementById("closePaymentModalBtn");
  const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");
  const paymentForm = document.getElementById("paymentForm");

  const bookingField = document.getElementById("payBookingId");
  const clientField = document.getElementById("payClientName");
  const packageField = document.getElementById("payPackageName");
  const amountField = document.getElementById("payAmount");
  const dateField = document.getElementById("payDate");
  const methodField = document.getElementById("payMethod");
  const statusField = document.getElementById("payStatus");
  const refField = document.getElementById("payReference");

  const sidebarNewBookingBtn = document.getElementById("sidebarNewBookingBtn");
  const logoutBtn = document.getElementById("userLogoutBtn");

  // -------- Load / seed data --------
  let payments = JSON.parse(localStorage.getItem("cht_payments") || "[]");

  if (!payments.length) {
    payments = [
      {
        id: 2,
        bookingId: 1,
        client: "Carlos Ramirez",
        package: "Hokkaido Icebreaker + Sapporo Snow Festival",
        amount: 150000,
        date: "2025-12-20",
        method: "Bank Transfer",
        status: "PAID",
        reference: "BANK-DEP-1001"
      },
      {
        id: 5,
        bookingId: 5,
        client: "Andrea Bautista",
        package: "Hokkaido Icebreaker + Sapporo Snow Festival",
        amount: 228800,
        date: "2025-12-10",
        method: "Bank Transfer",
        status: "PAID",
        reference: "BANK-DEP-2002"
      },
      {
        id: 3,
        bookingId: 2,
        client: "Jenny Villanueva",
        package: "Hong Kong & Macau Getaway",
        amount: 2000,
        date: "2025-12-05",
        method: "Credit/Debit Card",
        status: "PENDING",
        reference: "CARD-APP-8899"
      }
    ];
    localStorage.setItem("cht_payments", JSON.stringify(payments));
  }

  let filteredPayments = [...payments];

  // -------- Helpers --------
  function formatPHP(n) {
    return "₱" + Number(n || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2
    });
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  // -------- Stats --------
  function renderStats() {
    const totalReceived = payments
      .filter(p => p.status === "PAID")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingTotal = payments
      .filter(p => p.status === "PENDING")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    statTotalReceived.textContent = formatPHP(totalReceived);
    statPendingAmount.textContent = formatPHP(pendingTotal);
    statTransactions.textContent = payments.length;
  }

  // -------- Table --------
  function renderPayments() {
    if (!tbody) return;
    tbody.innerHTML = "";
    filteredPayments.forEach(p => {
      const statusClass =
        p.status === "PAID"
          ? "payment-status-paid"
          : p.status === "PENDING"
          ? "payment-status-pending"
          : "payment-status-failed";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.bookingId}</td>
        <td>${p.client}</td>
        <td>${p.package}</td>
        <td class="payment-amount">${formatPHP(p.amount)}</td>
        <td>${formatDate(p.date)}</td>
        <td>${p.method}</td>
        <td>
          <span class="payment-status-pill ${statusClass}">
            ${p.status}
          </span>
        </td>
        <td>${p.reference}</td>
      `;
      tbody.appendChild(tr);
    });
    renderStats();
  }

  renderPayments();

  // -------- Search --------
  function applySearch() {
    const q = (searchInput.value || "").toLowerCase();
    if (!q) {
      filteredPayments = [...payments];
    } else {
      filteredPayments = payments.filter(p =>
        `${p.client} ${p.reference} ${p.bookingId}`
          .toLowerCase()
          .includes(q)
      );
    }
    renderPayments();
  }

  if (searchInput) {
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") applySearch();
    });
  }

  // -------- Modal open/close --------
  function openModal() {
    paymentForm.reset();
    const today = new Date().toISOString().slice(0, 10);
    dateField.value = today;
    statusField.value = "PAID";
    modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
  }

  addPaymentBtn.addEventListener("click", openModal);
  closeModalBtn.addEventListener("click", closeModal);
  cancelPaymentBtn.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeModal();
  });

  // -------- Save payment --------
  paymentForm.addEventListener("submit", e => {
    e.preventDefault();

    const amount = Number(amountField.value || 0);
    if (!amount || amount <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    const nextId =
      payments.length ? Math.max(...payments.map(p => p.id)) + 1 : 1;

    const newPayment = {
      id: nextId,
      bookingId: Number(bookingField.value || 0),
      client: clientField.value.trim(),
      package: packageField.value.trim(),
      amount,
      date: dateField.value,
      method: methodField.value,
      status: statusField.value,
      reference: refField.value.trim()
    };

    payments.push(newPayment);
    localStorage.setItem("cht_payments", JSON.stringify(payments));

    filteredPayments = [...payments];
    renderPayments();
    closeModal();
  });

  // -------- Sidebar / logout --------
  if (sidebarNewBookingBtn) {
    sidebarNewBookingBtn.addEventListener("click", () => {
      window.location.href = "Bookings/bookings1.html";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "../log_in.html";
    });
  }
});
