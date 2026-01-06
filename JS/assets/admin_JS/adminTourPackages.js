document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("packagesTable")) return;

  const tableBody = document.querySelector("#packagesTable tbody");
  const form = document.getElementById("packageForm");

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

  const imageDropArea = document.getElementById("imageDropArea");
  const imagePreview = document.getElementById("imagePreview");
  const browseImageBtn = document.getElementById("browseImageBtn");
  const imageInput = document.getElementById("packageImageInput");

  // Search elements
  const searchInput = document.getElementById("packageSearch");
  const searchBtn = document.getElementById("searchPackagesBtn");
  const refreshBtn = document.getElementById("refreshPackagesBtn");
  const scrollToFormBtn = document.getElementById("scrollToFormBtn");

  let packages = [];
  let currentFilter = "";

  function resetImagePreview() {
    imagePreview.classList.add("empty");
    imagePreview.innerHTML = `
      <span class="image-icon">☁</span>
      <p>Drag &amp; Drop<br><small>or click to browse</small></p>
    `;
    imageInput.value = "";
  }

  function showImagePreview(srcOrFile) {
    if (typeof srcOrFile === "string") {
      imagePreview.classList.remove("empty");
      imagePreview.innerHTML = `<img src="${srcOrFile}" alt="Package image">`;
      return;
    }
    const file = srcOrFile;
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview.classList.remove("empty");
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Package image">`;
    };
    reader.readAsDataURL(file);
  }

  browseImageBtn.addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) showImagePreview(file);
  });
  ["dragenter", "dragover"].forEach(evt =>
    imageDropArea.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      imageDropArea.classList.add("drag-over");
    })
  );
  ["dragleave", "drop"].forEach(evt =>
    imageDropArea.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      imageDropArea.classList.remove("drag-over");
    })
  );
  imageDropArea.addEventListener("drop", e => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      imageInput.files = e.dataTransfer.files;
      showImagePreview(file);
    }
  });
  imageDropArea.addEventListener("click", () => imageInput.click());

 function loadPackages() {
  fetch("./api/list_packages.php")
    .then(r => r.json())
    .then(data => {
      packages = Array.isArray(data) ? data : [];
      renderPackages(currentFilter);
    })
    .catch(err => {
      console.error("Failed to load packages", err);
    });
}

  function renderPackages(filterText = "") {
    tableBody.innerHTML = "";
    
    let filtered = packages;
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = packages.filter(pkg => 
        (pkg.name && pkg.name.toLowerCase().includes(lower)) ||
        (pkg.destination && pkg.destination.toLowerCase().includes(lower)) ||
        (pkg.description && pkg.description.toLowerCase().includes(lower)) ||
        (pkg.status && pkg.status.toLowerCase().includes(lower))
      );
    }
    
    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">No packages found</td></tr>`;
      return;
    }
    
    filtered.forEach(pkg => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pkg.id}</td>
        <td>${pkg.name}</td>
        <td>${pkg.destination}</td>
        <td>${pkg.duration_days} days</td>
        <td>${pkg.max_pax}</td>
        <td>₱${Number(pkg.price).toLocaleString()}</td>
        <td><span class="badge ${pkg.status === "Active" ? "badge-success" : "badge-danger"}">${pkg.status}</span></td>
        <td>
          <button class="btn btn-primary small" data-action="edit" data-id="${pkg.id}">Edit</button>
          <button class="btn btn-danger small" data-action="delete" data-id="${pkg.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  function setFormAdd() {
    idField.value = "";
    form.reset();
    statusField.checked = true;
    durationField.value = 4;
    maxPaxField.value = 20;
    resetImagePreview();
  }

  function setFormEdit(pkg) {
    idField.value = pkg.id;
    nameField.value = pkg.name;
    destField.value = pkg.destination;
    durationField.value = pkg.duration_days;
    maxPaxField.value = pkg.max_pax;
    priceField.value = pkg.price;
    statusField.checked = pkg.status === "Active";
    descField.value = pkg.description || "";
    inclField.value = pkg.inclusions || "";
    resetImagePreview();
    if (pkg.image_path) {
      showImagePreview("../" + pkg.image_path);
    }
  }

  cancelBtn.addEventListener("click", setFormAdd);

  tableBody.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = parseInt(btn.dataset.id, 10);
    const pkg = packages.find(p => Number(p.id) === id);
    if (!pkg) return;

    if (btn.dataset.action === "edit") {
      setFormEdit(pkg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (btn.dataset.action === "delete") {
      if (!confirm("Delete this package?")) return;
      const fd = new FormData();
      fd.append("id", id);
      fetch("./api/delete_package.php", { method: "POST", body: fd })
        .then(r => r.json())
        .then(res => {
          if (res.success) {
            loadPackages();
            setFormAdd();
          } else {
            alert(res.error || "Delete failed");
          }
        })
        .catch(err => {
          console.error(err);
          alert("Server error");
        });
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const fd = new FormData(form);
    
    // Handle status checkbox - ensure it's sent even when unchecked
    if (statusField.checked) {
      fd.set("status", "Active");
    } else {
      fd.delete("status"); // Remove it so PHP knows it's unchecked
    }

    fetch("./api/save_package.php", { method: "POST", body: fd })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          loadPackages();
          setFormAdd();
        } else {
          alert(res.error || "Save failed");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Server error");
      });
  });

  setFormAdd();
  loadPackages();

  // Search functionality
  console.log("Search elements:", { searchInput, searchBtn, refreshBtn });
  
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      currentFilter = searchInput ? searchInput.value.trim() : "";
      console.log("Search clicked, filter:", currentFilter);
      renderPackages(currentFilter);
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        currentFilter = searchInput.value.trim();
        console.log("Enter pressed, filter:", currentFilter);
        renderPackages(currentFilter);
      }
    });
    
    // Real-time search as user types
    searchInput.addEventListener("input", () => {
      currentFilter = searchInput.value.trim();
      console.log("Input changed, filter:", currentFilter);
      renderPackages(currentFilter);
    });
  }

  // Refresh button
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentFilter = "";
      loadPackages();
    });
  }

  // Scroll to form button
  if (scrollToFormBtn) {
    scrollToFormBtn.addEventListener("click", () => {
      setFormAdd();
      const formSection = document.getElementById("packageFormSection");
      if (formSection) formSection.scrollIntoView({ behavior: "smooth" });
    });
  }
});