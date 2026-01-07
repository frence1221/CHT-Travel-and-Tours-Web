// Step 6: Review & Confirm
// Saves booking to database via API

document.addEventListener("DOMContentLoaded", () => {
  const reviewCustomer = document.getElementById("reviewCustomer");
  const reviewTravelDate = document.getElementById("reviewTravelDate");
  const reviewPackage = document.getElementById("reviewPackage");
  const reviewHotel = document.getElementById("reviewHotel");
  const reviewTransport = document.getElementById("reviewTransport");
  const reviewTotalAmount = document.getElementById("reviewTotalAmount");

  const backBtn = document.getElementById("bookingBackBtn");
  const confirmBtn = document.getElementById("confirmBookingBtn");
  const agreeTerms = document.getElementById("agreeTerms");
  const termsError = document.getElementById("termsError");

  // Load booking state
  let state = BookingState.get();
  
  // Debug: log the state to console
  console.log('Booking State on Step 6:', state);

  // Update summary sidebar
  BookingState.populateSummary();

  // Populate review section
  function populateReview() {
    // Customer
    if (reviewCustomer) {
      reviewCustomer.textContent = state.customer.name 
        ? `${state.customer.name} (${state.customer.pax || 1} pax)` 
        : 'Not set';
    }

    // Travel date
    if (reviewTravelDate) {
      const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      reviewTravelDate.textContent = today;
    }

    // Package
    if (reviewPackage) {
      reviewPackage.textContent = state.package.name 
        ? `${state.package.name} - ${state.package.duration || 0} Days` 
        : 'Not selected';
    }

    // Hotel
    if (reviewHotel) {
      reviewHotel.textContent = state.hotel.name 
        ? `${state.hotel.name} (${state.hotel.roomType || 'Standard'})` 
        : 'Not selected';
    }

    // Transport
    if (reviewTransport) {
      reviewTransport.textContent = state.transport.type 
        ? `${state.transport.type} - ${state.transport.provider || 'CHT Transport'}` 
        : 'Not selected';
    }

    // Total amount
    if (reviewTotalAmount) {
      const total = BookingState.calculateTotal();
      reviewTotalAmount.textContent = `PHP ${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    }
  }

  populateReview();

  // Back button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'bookings5.html';
    });
  }

  // Terms checkbox
  if (agreeTerms) {
    agreeTerms.addEventListener('change', () => {
      if (agreeTerms.checked && termsError) {
        termsError.classList.add('hidden');
      }
    });
  }

  // Confirm button
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      // Reload state to get latest data
      state = BookingState.get();
      console.log('State before confirm:', state);

      // Validate required selections
      if (!state.customer.id) {
        alert('Please select a customer first.\n\nGo back to Step 1 to select a customer.');
        return;
      }

      if (!state.package.id) {
        alert('Please select a package first.\n\nGo back to Step 2 to select a tour package.');
        return;
      }

      // Validate terms agreement
      if (!agreeTerms || !agreeTerms.checked) {
        if (termsError) {
          termsError.classList.remove('hidden');
        }
        return;
      }

      if (termsError) {
        termsError.classList.add('hidden');
      }

      // Confirm dialog
      if (!confirm('Are you sure you want to confirm this booking?')) {
        return;
      }

      // Disable button to prevent double submission
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Processing...';

      try {
        // Prepare booking data
        const today = new Date().toISOString().slice(0, 10);
        const duration = state.package.duration || 1;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        const bookingData = {
          clientId: state.customer.id,
          packageId: state.package.id,
          accommodationId: state.hotel.id || null,
          vehicleId: state.transport.id || null,
          startDate: today,
          endDate: endDate.toISOString().slice(0, 10),
          numberOfPax: state.customer.pax || 1,
          totalAmount: BookingState.calculateTotal(),
          status: 'Pending',
          specialRequests: state.addons.specialRequests || '',
          addons: state.addons.selectedIds || []
        };

        console.log('Booking data to send:', bookingData);

        // Send to API
        const response = await fetch('../api/bookings_save.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          throw new Error('Invalid response from server: ' + responseText);
        }

        if (result.success) {
          // Clear booking state
          BookingState.clear();

          // Show success message
          alert(`Booking confirmed successfully!\n\nBooking Reference: ${result.bookingRef}\n\nThank you for booking with CHT Travel & Tours!`);

          // Redirect to bookings list
          window.location.href = '../userBookings.html';
        } else {
          throw new Error(result.error || 'Failed to save booking');
        }
      } catch (error) {
        console.error('Error saving booking:', error);
        alert('Failed to confirm booking. Please try again.\n\nError: ' + error.message);
        
        // Re-enable button
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm Booking →';
      }
    });
  }
});