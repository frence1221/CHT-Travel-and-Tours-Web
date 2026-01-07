// Step 5: Transportation Selection
// Loads vehicles from vehicle table in database via API

document.addEventListener("DOMContentLoaded", () => {
  const transportListInner = document.getElementById("transportListInner");
  const backBtn = document.getElementById("bookingBackBtn");
  const nextBtn = document.getElementById("bookingNextBtn");

  let vehicles = [];
  let selectedTransportId = null;

  // Load existing state
  const state = BookingState.get();
  if (state.transport.id) {
    selectedTransportId = state.transport.id;
  }

  // Update summary
  BookingState.populateSummary();

  // Fetch vehicles from database
  async function loadVehicles() {
    try {
      transportListInner.innerHTML = '<div class="loading">Loading transportation options...</div>';
      
      const response = await fetch('../api/transportation_list.php');
      const data = await response.json();
      
      if (data.success && data.vehicles.length > 0) {
        vehicles = data.vehicles.map(v => ({
          id: v.id,
          type: v.type,
          capacity: v.capacity,
          plateNumber: v.plateNumber,
          provider: v.provider,
          pricePerDay: v.pricePerDay || estimatePrice(v.type, v.capacity)
        }));
        renderVehicles();
      } else {
        transportListInner.innerHTML = '<div class="no-data">No transportation available. Please add vehicles first.</div>';
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      transportListInner.innerHTML = '<div class="error">Failed to load transportation. Please try again.</div>';
    }
  }

  // Estimate price based on vehicle type and capacity
  function estimatePrice(type, capacity) {
    const basePrice = {
      'Bus': 5000,
      'Van': 3000,
      'Sedan': 2000,
      'SUV': 2500,
      'Coaster': 4000
    };
    
    for (const [key, price] of Object.entries(basePrice)) {
      if (type && type.toLowerCase().includes(key.toLowerCase())) {
        return price;
      }
    }
    
    // Price based on capacity if type not matched
    if (capacity >= 40) return 5000;
    if (capacity >= 15) return 3500;
    if (capacity >= 10) return 3000;
    return 2000;
  }

  // Get vehicle icon based on type
  function getVehicleIcon(type) {
    if (!type) return '🚐';
    const t = type.toLowerCase();
    if (t.includes('bus')) return '🚌';
    if (t.includes('van')) return '🚐';
    if (t.includes('sedan') || t.includes('car')) return '🚗';
    if (t.includes('suv')) return '🚙';
    return '🚐';
  }

  // Render vehicle rows
  function renderVehicles(filterType = "all") {
    if (!vehicles.length) {
      transportListInner.innerHTML = '<div class="no-data">No transportation options available.</div>';
      return;
    }

    const filtered = filterType === "all" 
      ? vehicles 
      : vehicles.filter(v => v.type && v.type.toLowerCase().includes(filterType.toLowerCase()));

    if (!filtered.length) {
      transportListInner.innerHTML = '<div class="no-data">No vehicles match the selected filter.</div>';
      return;
    }

    transportListInner.innerHTML = filtered.map(vehicle => `
      <div class="transport-row ${vehicle.id === selectedTransportId ? 'selected' : ''}" data-id="${vehicle.id}">
        <div class="transport-row-left">
          <div class="transport-name">${getVehicleIcon(vehicle.type)} ${vehicle.type || 'Vehicle'}</div>
          <div class="transport-meta">
            <span>👥 ${vehicle.capacity} seats</span>
            <span>🏢 ${vehicle.provider || 'CHT Transport'}</span>
            <span>🚐 ${vehicle.plateNumber || 'N/A'}</span>
          </div>
        </div>
        <div class="transport-price-block">
          <div class="transport-price">PHP ${vehicle.pricePerDay.toLocaleString()}</div>
          <div>per day</div>
          <button class="transport-select-btn">${vehicle.id === selectedTransportId ? '✓ Selected' : 'Select'}</button>
        </div>
      </div>
    `).join('');
  }

  // Handle filter change
  document.querySelectorAll('input[name="transportFilter"]').forEach(radio => {
    radio.addEventListener("change", () => {
      renderVehicles(radio.value);
    });
  });

  // Handle vehicle selection
  if (transportListInner) {
    transportListInner.addEventListener('click', (e) => {
      const row = e.target.closest('.transport-row');
      if (!row) return;

      const id = parseInt(row.dataset.id);
      selectedTransportId = id;
      
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        BookingState.updateStep('transport', {
          id: vehicle.id,
          type: vehicle.type,
          provider: vehicle.provider,
          plateNumber: vehicle.plateNumber,
          capacity: vehicle.capacity,
          pricePerDay: vehicle.pricePerDay
        });
        BookingState.populateSummary();
      }
      
      const currentFilter = document.querySelector('input[name="transportFilter"]:checked')?.value || "all";
      renderVehicles(currentFilter);
    });
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'bookings4.html';
    });
  }

  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!selectedTransportId) {
        if (!confirm('No transportation selected. Continue without transportation?')) {
          return;
        }
      }

      const currentState = BookingState.get();
      currentState.currentStep = 6;
      BookingState.save(currentState);

      window.location.href = 'bookings6.html';
    });
  }

  // Load vehicles on page load
  loadVehicles();
});