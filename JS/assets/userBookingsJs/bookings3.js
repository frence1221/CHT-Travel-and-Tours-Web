// Step 3: Add-ons
// Loads add-ons from database via API

document.addEventListener("DOMContentLoaded", () => {
  const addonsListEl = document.getElementById("addonsList");
  const specialRequestsEl = document.getElementById("specialRequests");
  const backBtn = document.getElementById("bookingBackBtn");
  const nextBtn = document.getElementById("bookingNextBtn");

  let addons = [];
  let selectedAddonIds = [];

  // Load existing state
  const state = BookingState.get();
  selectedAddonIds = state.addons.selectedIds || [];
  if (specialRequestsEl && state.addons.specialRequests) {
    specialRequestsEl.value = state.addons.specialRequests;
  }

  // Update summary
  BookingState.populateSummary();

  // Fetch add-ons from database
  async function loadAddons() {
    try {
      addonsListEl.innerHTML = '<div class="loading">Loading add-ons...</div>';
      
      const response = await fetch('../api/addons_list.php');
      const data = await response.json();
      
      if (data.success && data.addons.length > 0) {
        addons = data.addons;
        renderAddons();
      } else {
        // Use default add-ons if none in database
        addons = [
          { id: 1, name: 'Daily Breakfast', description: 'Start each day with a delicious buffet breakfast', price: 500 },
          { id: 2, name: 'Travel Insurance', description: 'Comprehensive coverage for peace of mind', price: 1000 },
          { id: 3, name: 'Private Tour Guide', description: 'Personalized guided tours with local expert', price: 2000 },
          { id: 4, name: 'Airport Transfer', description: 'Convenient pickup and drop-off service', price: 800 }
        ];
        renderAddons();
      }
    } catch (error) {
      console.error('Error loading add-ons:', error);
      // Use default add-ons on error
      addons = [
        { id: 1, name: 'Daily Breakfast', description: 'Start each day with a delicious buffet breakfast', price: 500 },
        { id: 2, name: 'Travel Insurance', description: 'Comprehensive coverage for peace of mind', price: 1000 },
        { id: 3, name: 'Private Tour Guide', description: 'Personalized guided tours with local expert', price: 2000 },
        { id: 4, name: 'Airport Transfer', description: 'Convenient pickup and drop-off service', price: 800 }
      ];
      renderAddons();
    }
  }

  // Render add-on rows
  function renderAddons() {
    addonsListEl.innerHTML = addons.map(addon => {
      const isChecked = selectedAddonIds.includes(addon.id);
      return `
        <div class="addon-row">
          <div class="addon-row-left">
            <input type="checkbox" class="addon-checkbox" id="addon-${addon.id}" data-id="${addon.id}" ${isChecked ? 'checked' : ''}>
            <div class="addon-text">
              <span class="addon-name">${addon.name}</span>
              <span class="addon-desc">${addon.description}</span>
            </div>
          </div>
          <div class="addon-price">+₱${Number(addon.price).toLocaleString()}</div>
        </div>
      `;
    }).join('');
  }

  // Calculate add-ons total
  function calculateAddonsTotal() {
    return selectedAddonIds.reduce((sum, id) => {
      const addon = addons.find(a => a.id === id);
      return sum + (addon ? Number(addon.price) : 0);
    }, 0);
  }

  // Handle checkbox changes
  if (addonsListEl) {
    addonsListEl.addEventListener('change', (e) => {
      const checkbox = e.target.closest('.addon-checkbox');
      if (!checkbox) return;

      const id = parseInt(checkbox.dataset.id);
      
      if (checkbox.checked) {
        if (!selectedAddonIds.includes(id)) {
          selectedAddonIds.push(id);
        }
      } else {
        selectedAddonIds = selectedAddonIds.filter(a => a !== id);
      }

      // Save to state
      BookingState.updateStep('addons', {
        selectedIds: selectedAddonIds,
        totalPrice: calculateAddonsTotal()
      });
      BookingState.populateSummary();
    });
  }

  // Handle special requests input
  if (specialRequestsEl) {
    specialRequestsEl.addEventListener('input', () => {
      BookingState.updateStep('addons', {
        specialRequests: specialRequestsEl.value
      });
    });
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'bookings2.html';
    });
  }

  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // Save final add-ons state
      BookingState.updateStep('addons', {
        selectedIds: selectedAddonIds,
        specialRequests: specialRequestsEl ? specialRequestsEl.value : '',
        totalPrice: calculateAddonsTotal()
      });

      const currentState = BookingState.get();
      currentState.currentStep = 4;
      BookingState.save(currentState);

      window.location.href = 'bookings4.html';
    });
  }

  // Load add-ons on page load
  loadAddons();
});