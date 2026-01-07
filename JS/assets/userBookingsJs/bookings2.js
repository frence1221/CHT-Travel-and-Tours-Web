// Step 2: Select Tour Package
// Loads packages from database via API

document.addEventListener("DOMContentLoaded", () => {
  console.log('=== STEP 2 LOADED ===');
  console.log('Initial state:', BookingState.get());
  
  const packageGrid = document.getElementById("packageGrid");
  const backBtn = document.getElementById("bookingBackBtn");
  const nextBtn = document.getElementById("bookingNextBtn");

  let packages = [];
  let selectedPackageId = null;

  // Load existing state
  const state = BookingState.get();
  if (state.package.id) {
    selectedPackageId = state.package.id;
    console.log('Restored selectedPackageId:', selectedPackageId);
  }

  // Update summary
  BookingState.populateSummary();

  // Fetch packages from database
  async function loadPackages() {
    try {
      packageGrid.innerHTML = '<div class="loading">Loading packages...</div>';
      
      const response = await fetch('../api/packages_list.php');
      const data = await response.json();
      
      if (data.success && data.packages.length > 0) {
        packages = data.packages;
        renderPackages();
      } else {
        packageGrid.innerHTML = '<div class="no-data">No packages available. Please add packages first.</div>';
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      packageGrid.innerHTML = '<div class="error">Failed to load packages. Please try again.</div>';
    }
  }

  // Render package cards
  function renderPackages() {
    packageGrid.innerHTML = packages.map(pkg => `
      <article class="package-card ${pkg.id === selectedPackageId ? 'selected' : ''}" data-id="${pkg.id}">
        ${pkg.imagePath ? `<div class="package-image"><img src="../../uploads/packages/${pkg.imagePath}" alt="${pkg.name}"></div>` : ''}
        <div class="package-card-header">${pkg.name}</div>
        <div class="package-meta">
          <span>📍 ${pkg.destination || 'Various'}</span>
          <span>📅 ${pkg.duration} Days</span>
        </div>
        <div class="package-description">
          ${pkg.description || 'Explore amazing destinations with this package.'}
        </div>
        <div class="package-inclusions">
          ✓ ${pkg.inclusions || 'Standard inclusions'}
        </div>
        <div class="package-limit">
          👥 Max ${pkg.maxPax || 20} participants
        </div>
        <div class="package-price">
          PHP ${Number(pkg.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </div>
        <button class="package-select-btn">${pkg.id === selectedPackageId ? '✓ Selected' : 'Select Package'}</button>
      </article>
    `).join('');
  }

  // Handle package selection
  if (packageGrid) {
    packageGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.package-card');
      if (!card) return;

      const id = parseInt(card.dataset.id);
      console.log('Package card clicked, id:', id);
      selectedPackageId = id;
      
      const pkg = packages.find(p => p.id === id);
      console.log('Found package:', pkg);
      if (pkg) {
        const updateResult = BookingState.updateStep('package', {
          id: pkg.id,
          name: pkg.name,
          destination: pkg.destination,
          duration: pkg.duration,
          price: pkg.price,
          description: pkg.description,
          inclusions: pkg.inclusions
        });
        console.log('Package saved to state:', updateResult);
        console.log('Current state after save:', BookingState.get());
        BookingState.populateSummary();
      }
      
      renderPackages();
    });
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'bookings1.html';
    });
  }

  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!selectedPackageId) {
        alert('Please select a package before continuing.');
        return;
      }

      const currentState = BookingState.get();
      currentState.currentStep = 3;
      BookingState.save(currentState);

      window.location.href = 'bookings3.html';
    });
  }

  // Load packages on page load
  loadPackages();
});