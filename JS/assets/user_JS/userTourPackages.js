// CHT-Travel-and-Tours-Web/JS/assets/user_JS/userTourPackages.js

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("packagesGrid");
  if (!grid) return;

  const searchInput = document.getElementById("packagesSearch");
  const countLabel = document.getElementById("packagesCountLabel");

  let packages = [];

  // Logout functionality
  const logoutBtn = document.getElementById("userLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem('cht_current_username');
      window.location.href = '../log_in.html';
    });
  }

  function formatPHP(amount) {
    return "₱" + Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2
    });
  }

  function updateCount(count) {
    if (countLabel) {
      countLabel.textContent = `${count} package${count === 1 ? "" : "s"}`;
    }
  }

  function renderPackages(filterText = "") {
    grid.innerHTML = "";
    
    let filtered = packages;
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = packages.filter(pkg =>
        (pkg.name && pkg.name.toLowerCase().includes(lower)) ||
        (pkg.destination && pkg.destination.toLowerCase().includes(lower)) ||
        (pkg.description && pkg.description.toLowerCase().includes(lower))
      );
    }
    
    updateCount(filtered.length);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-packages-message">
          <p>No packages found</p>
        </div>
      `;
      return;
    }

    // Gradient colors for cards
    const gradients = [
      "linear-gradient(135deg, #2563eb, #7c3aed)",
      "linear-gradient(135deg, #059669, #0d9488)",
      "linear-gradient(135deg, #dc2626, #ea580c)",
      "linear-gradient(135deg, #7c3aed, #db2777)",
      "linear-gradient(135deg, #0284c7, #0891b2)"
    ];

    filtered.forEach((pkg, index) => {
      const card = document.createElement("article");
      card.className = "user-package-card";
      const gradient = gradients[index % gradients.length];
      
      // Check if image exists - path is relative from HTML folder
      // From userDashboard/userTourPackage.html, we need to go up one level to HTML/
      const hasImage = pkg.imagePath && pkg.imagePath.trim() !== '';
      const imageUrl = hasImage ? `../${pkg.imagePath}` : null;

      card.innerHTML = `
        <div class="user-package-card-header ${hasImage ? 'has-image' : ''}" style="${hasImage ? '' : 'background: ' + gradient}">
          ${hasImage ? `<img src="${imageUrl}" alt="${pkg.name}" class="package-header-image">` : ''}
          <div class="header-overlay">
            <h3>${pkg.destination || "Destination"}</h3>
          </div>
        </div>
        <div class="user-package-card-body">
          <span class="user-package-chip">${pkg.duration} Days Tour</span>
          <h4 class="user-package-title">${pkg.name}</h4>
          <p class="user-package-desc">${pkg.description || "Contact us for more details"}</p>
          <ul class="user-package-details">
            <li>👥 Max ${pkg.maxPax} pax</li>
            <li>📦 ${pkg.inclusions || "Standard inclusions"}</li>
          </ul>
          <div class="user-package-footer">
            <span class="user-package-price">${formatPHP(pkg.price)}</span>
            <button class="btn-book-now" data-id="${pkg.id}">Book Now</button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  function loadPackages() {
    fetch("./api/packages_list.php")
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          console.error("Failed to load tour packages:", data.error);
          alert(data.error || "Failed to load tour packages.");
          return;
        }
        packages = data.packages || [];
        renderPackages();
      })
      .catch(err => {
        console.error("Tour packages fetch error:", err);
        alert("Server error while loading tour packages.");
      });
  }

  // Search - real-time filtering
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderPackages(searchInput.value.trim());
    });
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        renderPackages(searchInput.value.trim());
      }
    });
  }

  // Lightbox elements
  const lightbox = document.getElementById("imageLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeLightboxBtn = document.getElementById("closeLightbox");

  function openLightbox(imageUrl, caption) {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = imageUrl;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    lightbox.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add("hidden");
    document.body.style.overflow = ""; // Restore scrolling
  }

  // Close lightbox events
  if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener("click", closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener("click", e => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  // Close on Escape key
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeLightbox();
  });

  // Book Now button click AND Image click
  grid.addEventListener("click", e => {
    // Book Now button
    const btn = e.target.closest(".btn-book-now");
    if (btn) {
      const packageId = btn.dataset.id;
      window.location.href = `Bookings/bookings1.html?packageId=${packageId}`;
      return;
    }

    // Image click - open lightbox
    const header = e.target.closest(".user-package-card-header.has-image");
    if (header) {
      const img = header.querySelector(".package-header-image");
      const card = header.closest(".user-package-card");
      const title = card ? card.querySelector(".user-package-title")?.textContent : "";
      if (img && img.src) {
        openLightbox(img.src, title);
      }
    }
  });

  // Initial load
  loadPackages();
});