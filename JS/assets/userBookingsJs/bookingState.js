// CHT Travel & Tours - Booking State Manager
// This file manages the booking state across all steps using sessionStorage
// to persist data even when users navigate to other pages

const BookingState = {
  STORAGE_KEY: 'cht_booking_state',

  // Get the current booking state
  get() {
    try {
      const data = sessionStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : this.getEmptyState();
    } catch (e) {
      console.error('Error reading booking state:', e);
      return this.getEmptyState();
    }
  },

  // Save the booking state
  save(state) {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('Error saving booking state:', e);
      return false;
    }
  },

  // Update specific step data
  updateStep(stepKey, data) {
    const state = this.get();
    state[stepKey] = { ...state[stepKey], ...data };
    state.lastUpdated = new Date().toISOString();
    return this.save(state);
  },

  // Get empty state structure
  getEmptyState() {
    return {
      currentStep: 1,
      lastUpdated: null,
      // Step 1: Customer
      customer: {
        id: null,
        name: '',
        email: '',
        contact: '',
        destination: '',
        travelType: '',
        pax: 1,
        isExisting: false
      },
      // Step 2: Package
      package: {
        id: null,
        name: '',
        destination: '',
        duration: 0,
        price: 0,
        description: '',
        inclusions: ''
      },
      // Step 3: Add-ons
      addons: {
        selectedIds: [],
        specialRequests: '',
        totalPrice: 0
      },
      // Step 4: Hotel
      hotel: {
        id: null,
        name: '',
        address: '',
        roomType: '',
        pricePerNight: 0,
        rating: 0
      },
      // Step 5: Transport
      transport: {
        id: null,
        type: '',
        provider: '',
        plateNumber: '',
        capacity: 0,
        pricePerDay: 0
      }
    };
  },

  // Clear booking state (for new booking or after confirmation)
  clear() {
    sessionStorage.removeItem(this.STORAGE_KEY);
  },

  // Check if there's an active booking in progress
  hasActiveBooking() {
    const state = this.get();
    return state.lastUpdated !== null;
  },

  // Calculate total price
  calculateTotal() {
    const state = this.get();
    let total = 0;
    
    // Package price
    total += Number(state.package.price) || 0;
    
    // Add-ons total
    total += Number(state.addons.totalPrice) || 0;
    
    // Hotel (price per night * duration if available)
    const duration = state.package.duration || 1;
    total += (Number(state.hotel.pricePerNight) || 0) * duration;
    
    // Transport (price per day * duration)
    total += (Number(state.transport.pricePerDay) || 0) * duration;
    
    return total;
  },

  // Format price to PHP currency
  formatPrice(amount) {
    return '₱' + Number(amount).toLocaleString('en-PH', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  },

  // Get step completion status
  getStepStatus() {
    const state = this.get();
    return {
      step1: Boolean(state.customer.name),
      step2: Boolean(state.package.id),
      step3: true, // Add-ons are optional
      step4: Boolean(state.hotel.id),
      step5: Boolean(state.transport.id),
      step6: false // Confirmation
    };
  },

  // Populate summary sidebar (shared across all steps)
  populateSummary() {
    const state = this.get();
    
    // Customer
    const summaryCustomer = document.getElementById('summaryCustomer');
    if (summaryCustomer) {
      summaryCustomer.textContent = state.customer.name 
        ? `${state.customer.name} (${state.customer.pax || 1} pax)` 
        : 'Not set';
    }
    
    // Package
    const summaryPackage = document.getElementById('summaryPackage');
    if (summaryPackage) {
      summaryPackage.textContent = state.package.name || 'Not selected';
    }
    
    // Hotel
    const summaryHotel = document.getElementById('summaryHotel');
    if (summaryHotel) {
      summaryHotel.textContent = state.hotel.name || 'Not selected';
    }
    
    // Transport
    const summaryTransport = document.getElementById('summaryTransport');
    if (summaryTransport) {
      summaryTransport.textContent = state.transport.type 
        ? `${state.transport.type} - ${state.transport.provider}` 
        : 'Not selected';
    }
    
    // Total
    const summaryTotal = document.getElementById('summaryTotal');
    if (summaryTotal) {
      summaryTotal.textContent = this.formatPrice(this.calculateTotal());
    }
    
    // Breakdown
    const summaryBreakdown = document.getElementById('summaryBreakdown');
    if (summaryBreakdown) {
      const breakdown = [];
      if (state.package.price) breakdown.push(`Package: ${this.formatPrice(state.package.price)}`);
      if (state.addons.totalPrice) breakdown.push(`Add-ons: ${this.formatPrice(state.addons.totalPrice)}`);
      if (state.hotel.pricePerNight) breakdown.push(`Hotel: ${this.formatPrice(state.hotel.pricePerNight)}/night`);
      if (state.transport.pricePerDay) breakdown.push(`Transport: ${this.formatPrice(state.transport.pricePerDay)}/day`);
      summaryBreakdown.textContent = breakdown.join(', ') || 'Add items to see total';
    }
  }
};

// Handle sidebar navigation warning
function setupSidebarNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-item');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Save current state before navigating
      // State is automatically preserved in sessionStorage
      // No warning needed - just let user navigate
      // Their booking progress is saved and will be there when they return
    });
  });
}

// Setup new booking button
function setupNewBookingButton() {
  const newBookingBtn = document.getElementById('sidebarNewBookingBtn');
  if (newBookingBtn) {
    newBookingBtn.addEventListener('click', () => {
      if (BookingState.hasActiveBooking()) {
        const confirmNew = confirm(
          'You have a booking in progress. Starting a new booking will clear your current progress.\n\n' +
          'Click OK to start a new booking or Cancel to continue your current booking.'
        );
        if (confirmNew) {
          BookingState.clear();
          window.location.href = window.location.pathname.includes('Bookings') ? 'bookings1.html' : 'Bookings/bookings1.html';
        }
      } else {
        BookingState.clear();
        window.location.href = window.location.pathname.includes('Bookings') ? 'bookings1.html' : 'Bookings/bookings1.html';
      }
    });
  }
}

// Setup logout button
function setupLogout() {
  const logoutBtn = document.getElementById('userLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (BookingState.hasActiveBooking()) {
        const confirmLogout = confirm(
          'You have a booking in progress. Your progress will be lost if you logout.\n\n' +
          'Click OK to logout or Cancel to stay.'
        );
        if (!confirmLogout) return;
      }
      BookingState.clear();
      localStorage.removeItem('cht_current_username');
      window.location.href = '../../log_in.html';
    });
  }
}

// Initialize common elements
document.addEventListener('DOMContentLoaded', () => {
  setupSidebarNavigation();
  setupNewBookingButton();
  setupLogout();
});
