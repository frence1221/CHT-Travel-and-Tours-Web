// adminEmployees.js - Employee Management

document.addEventListener("DOMContentLoaded", () => {
  // Only run on employees page
  const tableBody = document.querySelector("#employeesTable tbody");
  if (!tableBody) return;

  const searchInput      = document.getElementById("employeeSearch");
  const searchBtn        = document.getElementById("searchEmployeeBtn");
  const refreshBtn       = document.getElementById("refreshEmployeeBtn");
  const showInactiveChk  = document.getElementById("showInactiveCheckbox");
  const scrollToFormBtn  = document.getElementById("scrollToEmployeeFormBtn");

  const form             = document.getElementById("employeeForm");
  const idField          = document.getElementById("employeeId");
  const nameField        = document.getElementById("empName");
  const emailField       = document.getElementById("empEmail");
  const contactField     = document.getElementById("empContact");
  const roleField        = document.getElementById("empRole");
  const passwordField    = document.getElementById("empPassword");
  const confirmField     = document.getElementById("empConfirmPassword");
  const activeField      = document.getElementById("empActive");
  const cancelBtn        = document.getElementById("cancelEmployeeBtn");
  const errorText        = document.getElementById("employeeFormError");
  const toggleAccordion  = document.getElementById("toggleEmployeeFormAccordion");

  let employees = [];

  function showError(msg) {
    if (!errorText) {
      alert(msg);
      return;
    }
    errorText.textContent = msg;
    errorText.classList.remove("hidden");
  }

  function clearError() {
    if (!errorText) return;
    errorText.textContent = "";
    errorText.classList.add("hidden");
  }

  // Load employees from database
  function loadEmployees() {
    const showInactive = showInactiveChk ? showInactiveChk.checked : false;
    fetch(`./api/list_employees.php?showInactive=${showInactive}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          showError(data.error);
          return;
        }
        employees = Array.isArray(data) ? data : [];
        renderEmployees();
      })
      .catch(err => {
        console.error("Failed to load employees", err);
        showError("Failed to load employees");
      });
  }

  // Render employees in table
  function renderEmployees(filterText = "") {
    tableBody.innerHTML = "";
    
    let filtered = employees;
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(lower) ||
        emp.email.toLowerCase().includes(lower) ||
        (emp.contact && emp.contact.toLowerCase().includes(lower))
      );
    }

    filtered.forEach(emp => {
      const tr = document.createElement("tr");
      const statusClass = emp.isActive ? "badge-success" : "badge-danger";
      tr.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.name}</td>
        <td>${emp.email}</td>
        <td>${emp.contact || '-'}</td>
        <td>${emp.role}</td>
        <td><span class="badge ${statusClass}">${emp.status}</span></td>
        <td>
          <button class="btn btn-primary small" data-action="edit" data-id="${emp.id}">Edit</button>
          <button class="btn btn-danger small" data-action="delete" data-id="${emp.id}">${emp.isActive ? 'Deactivate' : 'Activate'}</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Reset form to "Add" mode
  function resetForm() {
    if (idField) idField.value = "";
    if (form) form.reset();
    if (activeField) activeField.checked = true;
    if (toggleAccordion) toggleAccordion.textContent = "▾ Add New Employee";
    clearError();
  }

  // Set form to "Edit" mode
  function setFormEdit(emp) {
    if (idField) idField.value = emp.id;
    if (nameField) nameField.value = emp.name;
    if (emailField) emailField.value = emp.email;
    if (contactField) contactField.value = emp.contact || "";
    if (roleField) roleField.value = emp.role;
    if (activeField) activeField.checked = emp.isActive;
    if (passwordField) passwordField.value = "";
    if (confirmField) confirmField.value = "";
    if (toggleAccordion) toggleAccordion.textContent = "▾ Edit Employee: " + emp.name;
    clearError();
    
    // Scroll to form
    const formSection = document.getElementById("employeeFormSection");
    if (formSection) formSection.scrollIntoView({ behavior: "smooth" });
  }

  // Table actions (Edit/Delete)
  tableBody.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const emp = employees.find(e => parseInt(e.id, 10) === id);
    if (!emp) return;

    if (btn.dataset.action === "edit") {
      setFormEdit(emp);
    } else if (btn.dataset.action === "delete") {
      const action = emp.isActive ? "deactivate" : "activate";
      if (!confirm(`Are you sure you want to ${action} ${emp.name}?`)) return;
      
      const fd = new FormData();
      fd.append("id", id);
      fd.append("action", action);
      fetch("./api/delete_employee.php", { method: "POST", body: fd })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            loadEmployees();
            resetForm();
          } else {
            alert(res.error || "Failed to update employee");
          }
        })
        .catch(err => {
          console.error(err);
          alert("Server error");
        });
    }
  });

  // Form submit
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      clearError();
      
      // Validate passwords match
      if (passwordField && confirmField && passwordField.value && passwordField.value !== confirmField.value) {
        showError("Passwords do not match!");
        return;
      }

      // For new employees, password is required
      if (idField && !idField.value && passwordField && !passwordField.value) {
        showError("Password is required for new employees!");
        return;
      }

      const fd = new FormData();
      fd.append("id", idField ? idField.value : "");
      fd.append("name", nameField ? nameField.value : "");
      fd.append("email", emailField ? emailField.value : "");
      fd.append("contact", contactField ? contactField.value : "");
      fd.append("role", roleField ? roleField.value : "Staff");
      if (activeField && activeField.checked) {
        fd.append("isActive", "1");
      }
      if (passwordField && passwordField.value) {
        fd.append("password", passwordField.value);
      }

      fetch("./api/save_employee.php", { method: "POST", body: fd })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            loadEmployees();
            resetForm();
          } else {
            showError(res.error || "Failed to save employee");
          }
        })
        .catch(err => {
          console.error(err);
          showError("Server error");
        });
    });
  }

  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener("click", resetForm);
  }

  // Search
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      renderEmployees(searchInput ? searchInput.value.trim() : "");
    });
  }
  if (searchInput) {
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        renderEmployees(searchInput.value.trim());
      }
    });
  }

  // Refresh
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      loadEmployees();
    });
  }

  // Show inactive checkbox
  if (showInactiveChk) {
    showInactiveChk.addEventListener("change", loadEmployees);
  }

  // Scroll to form button
  if (scrollToFormBtn) {
    scrollToFormBtn.addEventListener("click", () => {
      resetForm();
      const formSection = document.getElementById("employeeFormSection");
      if (formSection) formSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Toggle accordion
  if (toggleAccordion) {
    toggleAccordion.addEventListener("click", () => {
      const formBody = document.getElementById("employeeFormBody");
      if (formBody) formBody.classList.toggle("collapsed");
    });
  }

  // Initial load
  resetForm();
  loadEmployees();
});