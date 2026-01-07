// Step 4: Hotel Selection
// Loads hotels from accommodation table in database via API

document.addEventListener("DOMContentLoaded", () => {
  const hotelListInner = document.getElementById("hotelListInner");
  const backBtn = document.getElementById("bookingBackBtn");
  const nextBtn = document.getElementById("bookingNextBtn");

  let hotels = [];
  let selectedHotelId = null;

  // Load existing state
  const state = BookingState.get();
  if (state.hotel.id) {
    selectedHotelId = state.hotel.id;
  }

  // Update summary
  BookingState.populateSummary();

  // Fetch hotels from database (accommodation table)
  async function loadHotels() {
    try {
      hotelListInner.innerHTML = '<div class="loading">Loading hotels...</div>';
      
      const response = await fetch('../api/hotels_list.php');
      const data = await response.json();
      
      if (data.success && data.hotels.length > 0) {
        hotels = data.hotels.map(h => ({
          id: h.id,
          name: h.name,
          address: h.address,
          contact: h.contact,
          amenities: h.amenities,
          numberOfRooms: h.numberOfRooms,
          roomType: h.roomType || 'Standard Room',
          rating: estimateRating(h.amenities),
          pricePerNight: h.pricePerNight || estimatePrice(h.roomType)
        }));
        renderHotels();
      } else {
        hotelListInner.innerHTML = '<div class="no-data">No hotels available. Please add hotels first.</div>';
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
      hotelListInner.innerHTML = '<div class="error">Failed to load hotels. Please try again.</div>';
    }
  }

  // Estimate rating based on amenities (for display purposes)
  function estimateRating(amenities) {
    if (!amenities) return 3;
    const amenityCount = amenities.split(',').length;
    if (amenityCount >= 5) return 5;
    if (amenityCount >= 3) return 4;
    return 3;
  }

  // Estimate price based on room type (default pricing)
  function estimatePrice(roomType) {
    const prices = {
      'Deluxe': 5000,
      'Suite': 8000,
      'Standard': 2500,
      'Superior': 3500
    };
    for (const [key, price] of Object.entries(prices)) {
      if (roomType && roomType.toLowerCase().includes(key.toLowerCase())) {
        return price;
      }
    }
    return 2500; // Default price
  }

  // Render hotel rows
  function renderHotels(filterRating = "all") {
    if (!hotels.length) {
      hotelListInner.innerHTML = '<div class="no-data">No hotels match the filter.</div>';
      return;
    }

    const filtered = filterRating === "all" 
      ? hotels 
      : hotels.filter(h => h.rating === parseInt(filterRating));

    if (!filtered.length) {
      hotelListInner.innerHTML = '<div class="no-data">No hotels match the selected rating.</div>';
      return;
    }

    hotelListInner.innerHTML = filtered.map(hotel => {
      const stars = "★".repeat(hotel.rating) + "☆".repeat(5 - hotel.rating);
      return `
        <div class="hotel-row ${hotel.id === selectedHotelId ? 'selected' : ''}" data-id="${hotel.id}">
          <div class="hotel-row-left">
            <div class="hotel-name">${hotel.name}</div>
            <div class="hotel-rating">${stars}</div>
            <div class="hotel-location">📍 ${hotel.address || 'Location not specified'}</div>
            <div class="hotel-room">🛏 ${hotel.roomType}</div>
            <div class="hotel-features">
              <span>${hotel.amenities || 'WiFi • AC'}</span>
            </div>
            ${hotel.numberOfRooms ? `<div class="hotel-rooms">🏨 ${hotel.numberOfRooms} rooms available</div>` : ''}
          </div>
          <div class="hotel-price-block">
            <div class="hotel-price">PHP ${hotel.pricePerNight.toLocaleString()}</div>
            <div>per night</div>
            <button class="hotel-select-btn">${hotel.id === selectedHotelId ? '✓ Selected' : 'Select'}</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Handle rating filter
  document.querySelectorAll('input[name="ratingFilter"]').forEach(radio => {
    radio.addEventListener("change", () => {
      renderHotels(radio.value);
    });
  });

  // Handle hotel selection
  if (hotelListInner) {
    hotelListInner.addEventListener('click', (e) => {
      const row = e.target.closest('.hotel-row');
      if (!row) return;

      const id = parseInt(row.dataset.id);
      selectedHotelId = id;
      
      const hotel = hotels.find(h => h.id === id);
      if (hotel) {
        BookingState.updateStep('hotel', {
          id: hotel.id,
          name: hotel.name,
          address: hotel.address,
          roomType: hotel.roomType,
          pricePerNight: hotel.pricePerNight,
          rating: hotel.rating
        });
        BookingState.populateSummary();
      }
      
      const currentFilter = document.querySelector('input[name="ratingFilter"]:checked')?.value || "all";
      renderHotels(currentFilter);
    });
  }

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'bookings3.html';
    });
  }

  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!selectedHotelId) {
        if (!confirm('No hotel selected. Continue without hotel accommodation?')) {
          return;
        }
      }

      const currentState = BookingState.get();
      currentState.currentStep = 5;
      BookingState.save(currentState);

      window.location.href = 'bookings5.html';
    });
  }

  // Load hotels on page load
  loadHotels();
});