// Step 1: Customer Information
// Uses database clients via API

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const searchInput = document.getElementById("existingCustomerSearch");
  const searchResults = document.createElement("div");
  searchResults.className = "search-results-dropdown";
  searchResults.id = "searchResultsDropdown";
  
  // Form fields
  const nameField = document.getElementById("custFullName");
  const contactField = document.getElementById("custContact");
  const emailField = document.getElementById("custEmail");
  const destinationField = document.getElementById("custDestination");
  const travelTypeField = document.getElementById("custTravelType");
  const paxField = document.getElementById("custPax");
  
  // Buttons
  const cancelBtn = document.getElementById("bookingCancelBtn");
  const nextBtn = document.getElementById("bookingNextBtn");
  
  // State
  let selectedClientId = null;
  let searchTimeout = null;
  let clients = [];

  // Insert search results dropdown after search input
  if (searchInput) {
    searchInput.parentNode.appendChild(searchResults);
  }

  // Load existing booking state if any
  const state = BookingState.get();
  if (state.customer.name) {
    nameField.value = state.customer.name || '';
    emailField.value = state.customer.email || '';
    contactField.value = state.customer.contact || '';
    destinationField.value = state.customer.destination || '';
    travelTypeField.value = state.customer.travelType || '';
    paxField.value = state.customer.pax || 1;
    selectedClientId = state.customer.id;
    
    if (state.customer.isExisting && state.customer.name) {
      searchInput.value = state.customer.name;
    }
  }

  // Update summary sidebar
  BookingState.populateSummary();

  // Search for existing customers
  async function searchClients(query) {
    try {
      const response = await fetch(`../api/clients_list.php?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        clients = data.clients;
        renderSearchResults(clients);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  }

  // Render search results dropdown
  function renderSearchResults(results) {
    if (!results.length) {
      searchResults.innerHTML = '<div class="search-no-results">No customers found. Enter new customer details below.</div>';
      searchResults.classList.add('show');
      return;
    }

    searchResults.innerHTML = results.map(client => `
      <div class="search-result-item" data-id="${client.id}">
        <div class="search-result-name">${client.name}</div>
        <div class="search-result-details">
          ${client.email ? `📧 ${client.email}` : ''} 
          ${client.contact ? `📞 ${client.contact}` : ''}
        </div>
      </div>
    `).join('');
    
    searchResults.classList.add('show');
  }

  // Handle search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      if (searchTimeout) clearTimeout(searchTimeout);
      
      if (query.length < 2) {
        searchResults.classList.remove('show');
        return;
      }
      
      searchTimeout = setTimeout(() => {
        searchClients(query);
      }, 300);
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.length >= 2 && clients.length) {
        searchResults.classList.add('show');
      }
    });
  }

  // Handle click on search result
  searchResults.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (!item) return;

    const clientId = parseInt(item.dataset.id);
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
      selectedClientId = client.id;
      nameField.value = client.name || '';
      emailField.value = client.email || '';
      contactField.value = client.contact || '';
      destinationField.value = client.address || '';
      travelTypeField.value = client.type || 'Leisure';
      searchInput.value = client.name;
      
      // Update state
      BookingState.updateStep('customer', {
        id: client.id,
        name: client.name,
        email: client.email,
        contact: client.contact,
        destination: client.address,
        travelType: client.type,
        isExisting: true
      });
      
      searchResults.classList.remove('show');
      BookingState.populateSummary();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lookup-input-wrapper')) {
      searchResults.classList.remove('show');
    }
  });

  // Save form data on input change
  function saveFormData() {
    BookingState.updateStep('customer', {
      id: selectedClientId,
      name: nameField.value.trim(),
      email: emailField.value.trim(),
      contact: contactField.value.trim(),
      destination: destinationField.value.trim(),
      travelType: travelTypeField.value.trim(),
      pax: parseInt(paxField.value) || 1,
      isExisting: selectedClientId !== null
    });
    BookingState.populateSummary();
  }

  // Add input listeners
  [nameField, emailField, contactField, destinationField, travelTypeField, paxField].forEach(field => {
    if (field) {
      field.addEventListener('input', saveFormData);
      field.addEventListener('change', saveFormData);
    }
  });

  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel this booking? All progress will be lost.')) {
        BookingState.clear();
        window.location.href = '../userBookings.html';
      }
    });
  }

  // Next button
  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      const name = nameField.value.trim();
      
      if (!name) {
        alert('Please enter a customer name.');
        nameField.focus();
        return;
      }

      // If it's a new customer, save to database first
      if (!selectedClientId) {
        try {
          const formData = new FormData();
          formData.append('name', name);
          formData.append('email', emailField.value.trim());
          formData.append('contact', contactField.value.trim());
          formData.append('address', destinationField.value.trim());
          formData.append('type', travelTypeField.value.trim() || 'Regular');

          const response = await fetch('../api/clients_save.php', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          
          if (result.success) {
            selectedClientId = result.id;
          } else {
            alert('Failed to save customer: ' + (result.error || 'Unknown error'));
            return;
          }
        } catch (error) {
          console.error('Error saving customer:', error);
          alert('Failed to save customer. Please try again.');
          return;
        }
      }

      // Update state with client ID
      BookingState.updateStep('customer', {
        id: selectedClientId,
        name: name,
        email: emailField.value.trim(),
        contact: contactField.value.trim(),
        destination: destinationField.value.trim(),
        travelType: travelTypeField.value.trim(),
        pax: parseInt(paxField.value) || 1,
        isExisting: true
      });

      // Update current step
      const currentState = BookingState.get();
      currentState.currentStep = 2;
      BookingState.save(currentState);

      // Navigate to step 2
      window.location.href = 'bookings2.html';
    });
  }
});