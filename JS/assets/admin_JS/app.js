// Simple front-end demo logic only (NO real authentication/storage)

// Detect which page we are on by checking body classes or element IDs
document.addEventListener("DOMContentLoaded", () => {
  /* -------- LOGIN PAGE -------- */
  // Login is now handled by log_in.js with proper database authentication
  // Do NOT add any login handlers here

  /* -------- COMMON LOGOUT BUTTONS -------- */
  const logoutButtons = [
    document.getElementById("logoutBtnDash"),
    document.getElementById("logoutBtnPackages"),
    document.getElementById("logoutBtnEmployees")
  ].filter(Boolean);

  logoutButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      localStorage.removeItem("cht_current_username");
      window.location.href = "../../HTML/log_in.html";
    });
  });

  /* -------- TOUR PACKAGES PAGE -------- */
  if (document.getElementById("packagesTable")) {
    initPackagesPage();
  }

  /* -------- EMPLOYEES PAGE -------- */
  if (document.getElementById("employeesTable")) {
    initEmployeesPage();
  }
});


/* ========== TOUR PACKAGES PAGE (DETAILED) ========== */
function initPackagesPage() {
  const tableBody = document.querySelector("#packagesTable tbody");
  const searchInput = document.getElementById("packageSearch");
  const searchBtn = document.getElementById("searchPackagesBtn");
  const refreshBtn = document.getElementById("refreshPackagesBtn");
  const scrollToFormBtn = document.getElementById("scrollToFormBtn");

  // Form / accordion elements
  const packageFormSection = document.getElementById("packageFormSection");
  const packageFormBody = document.getElementById("packageFormBody");
  const accordionTitle = document.getElementById("toggleFormAccordion");
  const packageForm = document.getElementById("packageForm");
  const formTitleSpan = accordionTitle; // we will change text when editing

  const idField = document.getElementById("packageId");
  const nameField = document.getElementById("packageName");
  const destField = document.getElementById("destination");
  const durationField = document.getElementById("duration");
  const maxPaxField = document.getElementById("maxPax");
  const priceField = document.getElementById("price");
  const statusField = document.getElementById("status");
  const descField = document.getElementById("description");
  const inclField = document.getElementById("inclusions");
  const cancelBtn = document.getElementById("cancelPackageBtn");

  // Image drag & drop
  const imageDropArea = document.getElementById("imageDropArea");
  const imagePreview = document.getElementById("imagePreview");
  const browseImageBtn = document.getElementById("browseImageBtn");
  const imageInput = document.getElementById("packageImageInput");

  // Sample data (front-end only)
  let packages = [
    {
      id: 10,
      name: "Hokkaido Icebreaker + Sapporo Snow Festival",
      destination: "Hokkaido, Japan",
      duration: "6 days",
      maxPax: 30,
      price: "₱2,288",
      status: "Active"
    },
    {
      id: 11,
      name: "Hong Kong & Macau Getaway",
      destination: "Hong Kong & Macau",
      duration: "4 days",
      maxPax: 40,
      price: "₱4,449",
      status: "Active"
    },
    {
      id: 12,
      name: "Bali 4D3N Christmas Tour",
      destination: "Bali, Indonesia",
      duration: "4 days",
      maxPax: 20,
      price: "₱28,888",
      status: "Active"
    },
    {
      id: 13,
      name: "Taiwan Taipei + Taichung 4D3N",
      destination: "Taipei & Taichung, Taiwan",
      duration: "4 days",
      maxPax: 35,
      price: "₱27,988",
      status: "Active"
    }
  ];

  let filteredPackages = [...packages];

  /* ---- RENDER TABLE ---- */
  function renderPackages(list = filteredPackages) {
    tableBody.innerHTML = "";
    list.forEach(pkg => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pkg.id}</td>
        <td>${pkg.name}</td>
        <td>${pkg.destination}</td>
        <td>${pkg.duration}</td>
        <td>${pkg.maxPax}</td>
        <td>${pkg.price}</td>
        <td><span class="badge ${pkg.status === "Active" ? "badge-success" : "badge-danger"}">${pkg.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-primary small" data-action="edit" data-id="${pkg.id}">Edit</button>
            <button class="btn btn-danger small" data-action="delete" data-id="${pkg.id}">Delete</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }
  renderPackages();

  /* ---- SEARCH ---- */
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

  searchBtn.addEventListener("click", applySearch);
  searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") applySearch();
  });
  refreshBtn.addEventListener("click", () => {
    searchInput.value = "";
    filteredPackages = [...packages];
    renderPackages();
  });

  /* ---- SCROLL TO FORM BUTTON ---- */
  scrollToFormBtn.addEventListener("click", () => {
    packageFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---- ACCORDION (expand/collapse) ---- */
  let isCollapsed = false;

  accordionTitle.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    if (isCollapsed) {
      packageFormBody.style.display = "none";
      accordionTitle.textContent = "▸ Add New Package";
    } else {
      packageFormBody.style.display = "block";
      accordionTitle.textContent = idField.value
        ? "▾ Edit Package"
        : "▾ Add New Package";
    }
  });

  /* ---- IMAGE DRAG & DROP + PREVIEW ---- */
  browseImageBtn.addEventListener("click", () => imageInput.click());

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) showImagePreview(file);
  });

  ;["dragenter", "dragover"].forEach(evtName => {
    imageDropArea.addEventListener(evtName, e => {
      e.preventDefault();
      e.stopPropagation();
      imageDropArea.classList.add("drag-over");
    });
  });

  ;["dragleave", "drop"].forEach(evtName => {
    imageDropArea.addEventListener(evtName, e => {
      e.preventDefault();
      e.stopPropagation();
      imageDropArea.classList.remove("drag-over");
    });
  });

  imageDropArea.addEventListener("drop", e => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      imageInput.files = e.dataTransfer.files;
      showImagePreview(file);
    }
  });

  // Click inside drag area triggers file input
  imageDropArea.addEventListener("click", () => imageInput.click());

  function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview.classList.remove("empty");
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Package image">`;
    };
    reader.readAsDataURL(file);
  }

  // Reset image to empty state
  function resetImagePreview() {
    imagePreview.classList.add("empty");
    imagePreview.innerHTML = `
      <span class="image-icon">☁</span>
      <p>Drag &amp; Drop<br><small>or click to browse</small></p>
    `;
    imageInput.value = "";
  }

  /* ---- ADD / EDIT FORM ---- */
  function setFormModeToAdd() {
    idField.value = "";
    formTitleSpan.textContent = "▾ Add New Package";
    packageForm.reset();
    statusField.checked = true;
    durationField.value = 4;
    maxPaxField.value = 20;
    resetImagePreview();
    if (isCollapsed) {
      // expand if currently collapsed
      isCollapsed = false;
      packageFormBody.style.display = "block";
    }
  }

  function setFormModeToEdit(pkg) {
    idField.value = pkg.id;
    formTitleSpan.textContent = "▾ Edit Package";

    nameField.value = pkg.name;
    destField.value = pkg.destination;
    durationField.value = parseInt(pkg.duration) || 4;
    maxPaxField.value = pkg.maxPax;
    priceField.value = parseFloat(pkg.price.replace(/[₱,]/g, "")) || 0;
    statusField.checked = pkg.status === "Active";
    descField.value = pkg.description || "";
    inclField.value = pkg.inclusions || "";

    resetImagePreview();
    if (isCollapsed) {
      isCollapsed = false;
      packageFormBody.style.display = "block";
    }
  }

  // Clicking Cancel: clear form and return to "Add New Package" mode
  cancelBtn.addEventListener("click", () => {
    setFormModeToAdd();
  });

  // Handle Edit/Delete buttons via event delegation
  tableBody.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;

    if (btn.dataset.action === "edit") {
      setFormModeToEdit(pkg);
      packageFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (btn.dataset.action === "delete") {
      if (confirm("Delete this package?")) {
        packages = packages.filter(p => p.id !== id);
        filteredPackages = [...packages];
        renderPackages();
      }
    }
  });

  // Save (Add or Update)
  packageForm.addEventListener("submit", e => {
    e.preventDefault();

    const idVal = idField.value.trim();
    const data = {
      id: idVal ? parseInt(idVal, 10) : getNextPackageId(),
      name: nameField.value || "Untitled Package",
      destination: destField.value || "",
      duration: `${durationField.value || 1} days`,
      maxPax: parseInt(maxPaxField.value, 10) || 0,
      price: "₱" + Number(priceField.value || 0).toLocaleString(),
      status: statusField.checked ? "Active" : "Inactive",
      description: descField.value,
      inclusions: inclField.value
    };

    if (idVal) {
      // Update existing
      const idx = packages.findIndex(p => p.id === data.id);
      if (idx > -1) packages[idx] = data;
    } else {
      // Add new
      packages.push(data);
    }

    filteredPackages = [...packages];
    renderPackages();
    setFormModeToAdd();
  });

  function getNextPackageId() {
    return packages.length ? Math.max(...packages.map(p => p.id)) + 1 : 1;
  }

  // Initialize form in "Add" mode
  setFormModeToAdd();
}

/* ========== EMPLOYEES PAGE (same as earlier) ========== */
/* (keep your existing initEmployeesPage from the previous answer) */

/* -------- EMPLOYEES PAGE -------- */
if (document.getElementById("employeesTable")) {
  initEmployeesPage();
}


/* ================== TOUR PACKAGES ================== */
function initPackagesPage() {
  const tableBody = document.querySelector("#packagesTable tbody");
  const packageFormSection = document.getElementById("packageFormSection");
  const showFormBtn = document.getElementById("showAddPackageBtn");
  const hideFormBtn = document.getElementById("hidePackageFormBtn");
  const cancelBtn = document.getElementById("cancelPackageBtn");
  const packageForm = document.getElementById("packageForm");
  const formTitle = document.getElementById("packageFormTitle");

  const idField = document.getElementById("packageId");
  const nameField = document.getElementById("packageName");
  const destField = document.getElementById("destination");
  const durationField = document.getElementById("duration");
  const maxPaxField = document.getElementById("maxPax");
  const priceField = document.getElementById("price");
  const statusField = document.getElementById("status");
  const descField = document.getElementById("description");
  const inclField = document.getElementById("inclusions");

  // Sample data
  let packages = [
    { id: 10, name: "Hokkaido Icebreaker + Sapporo Snow Festival", destination: "Hokkaido, Japan", duration: "6 days", maxPax: 30, price: "₱2,288", status: "Active" },
    { id: 11, name: "Hong Kong & Macau Getaway", destination: "Hong Kong & Macau", duration: "4 days", maxPax: 40, price: "₱4,449", status: "Active" },
    { id: 12, name: "Bali 4D3N Christmas Tour", destination: "Bali, Indonesia", duration: "4 days", maxPax: 20, price: "₱28,888", status: "Active" },
    { id: 13, name: "Taiwan Taipei + Taichung 4D3N", destination: "Taipei & Taichung, Taiwan", duration: "4 days", maxPax: 35, price: "₱27,988", status: "Active" }
  ];

  function renderPackages() {
    tableBody.innerHTML = "";
    packages.forEach(pkg => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pkg.id}</td>
        <td>${pkg.name}</td>
        <td>${pkg.destination}</td>
        <td>${pkg.duration}</td>
        <td>${pkg.maxPax}</td>
        <td>${pkg.price}</td>
        <td><span class="badge ${pkg.status === "Active" ? "badge-success" : "badge-danger"}">${pkg.status}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-primary small" data-action="edit" data-id="${pkg.id}">Edit</button>
            <button class="btn btn-danger small" data-action="delete" data-id="${pkg.id}">Delete</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }
  renderPackages();

  // Show form (add mode)
  showFormBtn.addEventListener("click", () => {
    formTitle.textContent = "Add New Package";
    packageForm.reset();
    statusField.checked = true;
    idField.value = "";
    packageFormSection.classList.remove("hidden");
  });

  hideFormBtn.addEventListener("click", () => {
    packageFormSection.classList.add("hidden");
  });
  cancelBtn.addEventListener("click", () => {
    packageFormSection.classList.add("hidden");
  });

  // Edit/Delete listeners (event delegation)
  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const action = btn.dataset.action;
    const pkg = packages.find(p => p.id === id);

    if (action === "edit") {
      if (!pkg) return;
      formTitle.textContent = "Edit Package";
      packageFormSection.classList.remove("hidden");
      idField.value = pkg.id;
      nameField.value = pkg.name;
      destField.value = pkg.destination;
      durationField.value = parseInt(pkg.duration) || 4;
      maxPaxField.value = pkg.maxPax;
      priceField.value = parseFloat(pkg.price.replace(/[₱,]/g, "")) || 0;
      statusField.checked = pkg.status === "Active";
      descField.value = pkg.description || "";
      inclField.value = pkg.inclusions || "";
    }

    if (action === "delete") {
      if (confirm("Delete this package?")) {
        packages = packages.filter(p => p.id !== id);
        renderPackages();
      }
    }
  });

  // Save (Add or Edit)
  packageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const idVal = idField.value;
    const data = {
      id: idVal ? parseInt(idVal, 10) : getNextPackageId(),
      name: nameField.value || "Untitled Package",
      destination: destField.value || "",
      duration: `${durationField.value || 1} days`,
      maxPax: parseInt(maxPaxField.value, 10) || 0,
      price: "₱" + Number(priceField.value || 0).toLocaleString(),
      status: statusField.checked ? "Active" : "Inactive",
      description: descField.value,
      inclusions: inclField.value
    };

    if (idVal) {
      // update
      const index = packages.findIndex(p => p.id === data.id);
      if (index > -1) packages[index] = data;
    } else {
      packages.push(data);
    }

    renderPackages();
    packageFormSection.classList.add("hidden");
  });

  function getNextPackageId() {
    return packages.length ? Math.max(...packages.map(p => p.id)) + 1 : 1;
  }
}

/* ================== EMPLOYEES ================== */
function initEmployeesPage() {
  const tableBody = document.querySelector("#employeesTable tbody");
  const formSection = document.getElementById("employeeFormSection");
  const addBtn = document.getElementById("addEmployeeBtn");
  const hideBtn = document.getElementById("hideEmployeeFormBtn");
  const cancelBtn = document.getElementById("cancelEmployeeBtn");
  const form = document.getElementById("employeeForm");
  const formTitle = document.getElementById("employeeFormTitle");

  const idField = document.getElementById("employeeId");
  const nameField = document.getElementById("empName");
  const posField = document.getElementById("empPosition");
  const emailField = document.getElementById("empEmail");
  const activeField = document.getElementById("empActive");

  let employees = [
    { id: 1, name: "Anna Reyes", position: "Senior Travel Consultant", email: "anna@cht.com", active: true },
    { id: 2, name: "Mark Santos", position: "Sales Executive", email: "mark@cht.com", active: true },
    { id: 3, name: "John Cruz", position: "Travel Consultant", email: "john@cht.com", active: true },
    { id: 4, name: "Maria Gomez", position: "Operations Assistant", email: "maria@cht.com", active: true }
  ];

  function renderEmployees() {
    tableBody.innerHTML = "";
    employees.forEach(emp => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.name}</td>
        <td>${emp.position}</td>
        <td>${emp.email}</td>
        <td><span class="badge ${emp.active ? "badge-success" : "badge-danger"}">${emp.active ? "Active" : "Inactive"}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-primary small" data-action="edit" data-id="${emp.id}">Edit</button>
            <button class="btn btn-danger small" data-action="delete" data-id="${emp.id}">Delete</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }
  renderEmployees();

  addBtn.addEventListener("click", () => {
    formTitle.textContent = "Add Employee";
    form.reset();
    activeField.checked = true;
    idField.value = "";
    formSection.classList.remove("hidden");
  });

  hideBtn.addEventListener("click", () => formSection.classList.add("hidden"));
  cancelBtn.addEventListener("click", () => formSection.classList.add("hidden"));

  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    if (btn.dataset.action === "edit") {
      formTitle.textContent = "Edit Employee";
      formSection.classList.remove("hidden");
      idField.value = emp.id;
      nameField.value = emp.name;
      posField.value = emp.position;
      emailField.value = emp.email;
      activeField.checked = emp.active;
    } else if (btn.dataset.action === "delete") {
      if (confirm("Delete this employee?")) {
        employees = employees.filter(e => e.id !== id);
        renderEmployees();
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const idVal = idField.value;
    const data = {
      id: idVal ? parseInt(idVal, 10) : getNextEmployeeId(),
      name: nameField.value,
      position: posField.value,
      email: emailField.value,
      active: activeField.checked
    };

    if (idVal) {
      const index = employees.findIndex(e => e.id === data.id);
      if (index > -1) employees[index] = data;
    } else {
      employees.push(data);
    }
    renderEmployees();
    formSection.classList.add("hidden");
  });

  function getNextEmployeeId() {
    return employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
  }
}

// ... keep your existing login + logout + initPackagesPage code above

/* ========== EMPLOYEES PAGE (DETAILED) ========== */
function initEmployeesPage() {
  const tableBody = document.querySelector("#employeesTable tbody");

  const searchInput = document.getElementById("employeeSearch");
  const searchBtn = document.getElementById("searchEmployeeBtn");
  const refreshBtn = document.getElementById("refreshEmployeeBtn");
  const showInactiveCheckbox = document.getElementById("showInactiveCheckbox");
  const scrollToFormBtn = document.getElementById("scrollToEmployeeFormBtn");

  // Form / accordion
  const formSection = document.getElementById("employeeFormSection");
  const formBody = document.getElementById("employeeFormBody");
  const accordionTitle = document.getElementById("toggleEmployeeFormAccordion");
  const form = document.getElementById("employeeForm");
  const errorText = document.getElementById("employeeFormError");

  const idField = document.getElementById("employeeId");
  const nameField = document.getElementById("empName");
  const emailField = document.getElementById("empEmail");
  const contactField = document.getElementById("empContact");
  const roleField = document.getElementById("empRole");
  const passwordField = document.getElementById("empPassword");
  const confirmPasswordField = document.getElementById("empConfirmPassword");
  const activeField = document.getElementById("empActive");
  const cancelBtn = document.getElementById("cancelEmployeeBtn");

  // Demo data
  let employees = [
    { id: 1, name: "admin", email: "admin@cht.com", contact: "09170000001", role: "Manager", active: true },
    { id: 3, name: "Anna Reyes", email: "anna.reyes@agency.com", contact: "09170000001", role: "Manager", active: true },
    { id: 9, name: "Frence", email: "frence@gmail.com", contact: "09510986508", role: "User", active: true },
    { id: 5, name: "John Cruz", email: "john.cruz@agency.com", contact: "09170000003", role: "Staff", active: true },
    { id: 6, name: "Maria Gomez", email: "maria.gomez@agency.com", contact: "09170000004", role: "Manager", active: true },
    { id: 4, name: "Mark Santos", email: "mark.santos@agency.com", contact: "09170000002", role: "Staff", active: true }
  ];

  let filteredEmployees = [...employees];

  /* ---- RENDER TABLE ---- */
  function renderEmployees(list = filteredEmployees) {
    tableBody.innerHTML = "";
    list.forEach(emp => {
      // If "Show Inactive" unchecked, hide inactive
      if (!showInactiveCheckbox.checked && !emp.active) return;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.name}</td>
        <td>${emp.email}</td>
        <td>${emp.contact || ""}</td>
        <td class="${emp.role === "Manager" ? "role-manager" : emp.role === "Staff" ? "role-staff" : "role-user"}">${emp.role}</td>
        <td><span class="badge ${emp.active ? "badge-success" : "badge-danger"}">${emp.active ? "Active" : "Inactive"}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn btn-primary small" data-action="edit" data-id="${emp.id}">Edit</button>
            <button class="btn btn-warning small" data-action="toggle" data-id="${emp.id}">
              ${emp.active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }
  renderEmployees();

  /* ---- SEARCH ---- */
  function applyEmployeeSearch() {
    const q = (searchInput.value || "").toLowerCase();
    if (!q) {
      filteredEmployees = [...employees];
    } else {
      filteredEmployees = employees.filter(emp =>
        `${emp.name} ${emp.email} ${emp.role}`.toLowerCase().includes(q)
      );
    }
    renderEmployees();
  }

  searchBtn.addEventListener("click", applyEmployeeSearch);
  searchInput.addEventListener("keyup", e => {
    if (e.key === "Enter") applyEmployeeSearch();
  });

  refreshBtn.addEventListener("click", () => {
    searchInput.value = "";
    filteredEmployees = [...employees];
    renderEmployees();
  });

  showInactiveCheckbox.addEventListener("change", () => renderEmployees());

  /* ---- SCROLL TO FORM BUTTON ---- */
  scrollToFormBtn.addEventListener("click", () => {
    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---- ACCORDION BEHAVIOR ---- */
  let empFormCollapsed = false;

  accordionTitle.addEventListener("click", () => {
    empFormCollapsed = !empFormCollapsed;
    if (empFormCollapsed) {
      formBody.style.display = "none";
      accordionTitle.textContent = idField.value
        ? "▸ Edit Employee"
        : "▸ Add New Employee";
    } else {
      formBody.style.display = "block";
      accordionTitle.textContent = idField.value
        ? "▾ Edit Employee"
        : "▾ Add New Employee";
    }
  });

  function setEmployeeFormModeAdd() {
    idField.value = "";
    nameField.value = "";
    emailField.value = "";
    contactField.value = "";
    roleField.value = "Staff";
    roleField.disabled = false;  // Ensure role field is enabled
    passwordField.value = "";
    confirmPasswordField.value = "";
    activeField.checked = true;
    clearEmployeeError();

    accordionTitle.textContent = "▾ Add New Employee";
    if (empFormCollapsed) {
      empFormCollapsed = false;
      formBody.style.display = "block";
    }
  }

  function setEmployeeFormModeEdit(emp) {
    idField.value = emp.id;
    nameField.value = emp.name;
    emailField.value = emp.email;
    contactField.value = emp.contact || "";
    roleField.value = emp.role;
    roleField.disabled = false;  // Ensure role field is enabled
    passwordField.value = "";
    confirmPasswordField.value = "";
    activeField.checked = emp.active;
    clearEmployeeError();

    accordionTitle.textContent = "▾ Edit Employee";
    if (empFormCollapsed) {
      empFormCollapsed = false;
      formBody.style.display = "block";
    }
  }

  function showEmployeeError(msg) {
    errorText.textContent = msg;
    errorText.classList.remove("hidden");
  }

  function clearEmployeeError() {
    errorText.textContent = "";
    errorText.classList.add("hidden");
  }

  cancelBtn.addEventListener("click", () => setEmployeeFormModeAdd());

  // Ensure role field is always enabled
  roleField.addEventListener("focus", () => {
    roleField.disabled = false;
  });
  roleField.addEventListener("change", () => {
    roleField.disabled = false;
  });

  // Handle table buttons (edit / activate / deactivate)
  tableBody.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const emp = employees.find(e => e.id === id);
    if (!emp) return;

    const action = btn.dataset.action;

    if (action === "edit") {
      setEmployeeFormModeEdit(emp);
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (action === "toggle") {
      emp.active = !emp.active;
      renderEmployees();
    }
  });

  // Save employee (Add or Edit)
  form.addEventListener("submit", e => {
    e.preventDefault();
    clearEmployeeError();

    // simple validation: password & confirm must match if either has value
    if (passwordField.value || confirmPasswordField.value) {
      if (passwordField.value !== confirmPasswordField.value) {
        showEmployeeError("Password and Confirm Password do not match.");
        return;
      }
    }

    const idVal = idField.value.trim();
    const data = {
      id: idVal ? parseInt(idVal, 10) : getNextEmployeeId(),
      name: nameField.value.trim(),
      email: emailField.value.trim(),
      contact: contactField.value.trim(),
      role: roleField.value,
      active: activeField.checked
      // Note: for security, password is *not* stored here; in a real app,
      // you would send it to the backend for hashing.
    };

    if (!data.name || !data.email) {
      showEmployeeError("Full Name and Email are required.");
      return;
    }

    if (idVal) {
      // update
      const idx = employees.findIndex(e => e.id === data.id);
      if (idx > -1) employees[idx] = data;
    } else {
      // add new
      employees.push(data);
    }

    filteredEmployees = [...employees];
    renderEmployees();
    setEmployeeFormModeAdd();
  });

  function getNextEmployeeId() {
    return employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
  }

  // init in Add mode
  setEmployeeFormModeAdd();
}

//TourPackagesPage

localStorage.setItem("cht_packages", JSON.stringify(packagesArray));

