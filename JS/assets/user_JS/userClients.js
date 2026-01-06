// CHT-Travel-and-Tours-Web/JS/assets/user_JS/userClients.js

document.addEventListener("DOMContentLoaded", () => {
  // Only run on Clients page
  const tableBody = document.querySelector("#clientsTable tbody");
  if (!tableBody) return;

  const searchInput    = document.getElementById("clientsSearch");
  const addClientBtn   = document.getElementById("addClientBtn");

  // Modal elements
  const modalOverlay   = document.getElementById("clientModalOverlay");
  const modalTitle     = document.getElementById("clientModalTitle");
  const closeModalBtn  = document.getElementById("closeClientModalBtn");
  const form           = document.getElementById("clientForm");
  const idField        = document.getElementById("clientId");
  const nameField      = document.getElementById("clientName");
  const emailField     = document.getElementById("clientEmail");
  const contactField   = document.getElementById("clientContact");
  const addressField   = document.getElementById("clientAddress");
  const typeField      = document.getElementById("clientType");
  const cancelBtn      = document.getElementById("cancelClientBtn");

  let clients = [];

  // Logout functionality
  const logoutBtn = document.getElementById("userLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem('cht_current_username');
      window.location.href = '../log_in.html';
    });
  }

  function formatDate(d) {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  function openModal(title = "Add New Client") {
    modalTitle.textContent = title;
    modalOverlay.classList.remove("hidden");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
    resetForm();
  }

  function resetForm() {
    idField.value = "";
    form.reset();
    typeField.value = "REGULAR";
  }

  function loadClients(query = "") {
    const url = query
      ? `./api/clients_list.php?q=${encodeURIComponent(query)}`
      : "./api/clients_list.php";

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          alert(data.error || "Failed to load clients.");
          return;
        }
        clients = data.clients || [];
        renderClients();
      })
      .catch(err => {
        console.error("Load clients error:", err);
        alert("Server error while loading clients.");
      });
  }

  function renderClients(filterText = "") {
    tableBody.innerHTML = "";
    
    let filtered = clients;
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = clients.filter(c => 
        (c.name && c.name.toLowerCase().includes(lower)) ||
        (c.email && c.email.toLowerCase().includes(lower)) ||
        (c.contact && c.contact.toLowerCase().includes(lower))
      );
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No clients found</td></tr>`;
      return;
    }

    filtered.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.email || "-"}</td>
        <td>${c.contact || "-"}</td>
        <td>${c.address || "-"}</td>
        <td><span class="badge badge-info">${c.type || "REGULAR"}</span></td>
        <td>${formatDate(c.registered)}</td>
        <td>
          <button class="btn btn-primary small" data-action="edit" data-id="${c.id}">Edit</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function setFormEdit(client) {
    idField.value = client.id;
    nameField.value = client.name;
    emailField.value = client.email || "";
    contactField.value = client.contact || "";
    addressField.value = client.address || "";
    typeField.value = client.type || "REGULAR";
    openModal("Edit Client: " + client.name);
  }

  // Table Edit
  tableBody.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action='edit']");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const client = clients.find(c => c.id === id);
    if (!client) return;

    setFormEdit(client);
  });

  // Search - real-time filtering
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderClients(searchInput.value.trim());
    });
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        renderClients(searchInput.value.trim());
      }
    });
  }

  // Add Client button
  if (addClientBtn) {
    addClientBtn.addEventListener("click", () => {
      resetForm();
      openModal("Add New Client");
    });
  }

  // Close modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }
  if (cancelBtn) {
    cancelBtn.addEventListener("click", e => {
      e.preventDefault();
      closeModal();
    });
  }
  // Close modal on overlay click
  if (modalOverlay) {
    modalOverlay.addEventListener("click", e => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Save form
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();

      if (!nameField.value.trim()) {
        alert("Client name is required.");
        return;
      }

      const fd = new FormData();
      fd.append("id", idField.value);
      fd.append("name", nameField.value.trim());
      fd.append("email", emailField.value.trim());
      fd.append("contact", contactField.value.trim());
      fd.append("address", addressField.value.trim());
      fd.append("type", typeField.value);

      fetch("./api/clients_save.php", {
        method: "POST",
        body: fd
      })
        .then(r => r.json())
        .then(res => {
          if (!res.success) {
            alert(res.error || "Failed to save client.");
            return;
          }
          closeModal();
          loadClients();
        })
        .catch(err => {
          console.error("Save client error:", err);
          alert("Server error while saving client.");
        });
    });
  }

  // Initial load
  loadClients();
});