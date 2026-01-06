// CHT-Travel-and-Tours-Web/JS/assets/user_JS/userPayments.js

document.addEventListener("DOMContentLoaded", () => {
  const totalReceivedEl = document.getElementById("totalReceivedValue");
  const totalPendingEl = document.getElementById("totalPendingValue");
  const totalCountEl = document.getElementById("totalTransactionsValue");
  const searchInput = document.getElementById("paymentsSearch");
  const tableBody = document.querySelector("#paymentsTable tbody");
  if (!tableBody) return;

  let payments = [];

  // Logout functionality
  const logoutBtn = document.getElementById("userLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem('cht_current_username');
      window.location.href = '../log_in.html';
    });
  }

  function formatPHP(value) {
    return "₱" + Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2
    });
  }

  function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  }

  function getMethodIcon(method) {
    const m = (method || "").toLowerCase();
    if (m.includes("gcash")) return "📱";
    if (m.includes("bank")) return "🏦";
    if (m.includes("card") || m.includes("credit")) return "💳";
    if (m.includes("cash")) return "💵";
    return "💰";
  }

  function renderSummary(totalReceived, totalPending, totalCount) {
    if (totalReceivedEl) totalReceivedEl.textContent = formatPHP(totalReceived);
    if (totalPendingEl) totalPendingEl.textContent = formatPHP(totalPending);
    if (totalCountEl) totalCountEl.textContent = totalCount;
  }

  function updateCount(count) {
    const countLabel = document.getElementById("paymentsCountLabel");
    if (countLabel) {
      countLabel.textContent = `${count} payment${count === 1 ? "" : "s"}`;
    }
  }

  function renderTable(filterText = "") {
    tableBody.innerHTML = "";
    
    let filtered = payments;
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = payments.filter(p =>
        (p.reference && p.reference.toLowerCase().includes(lower)) ||
        (p.method && p.method.toLowerCase().includes(lower)) ||
        String(p.bookingId).includes(lower)
      );
    }

    updateCount(filtered.length);

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#9ca3af;">No payments found</td></tr>`;
      return;
    }

    filtered.forEach(p => {
      const tr = document.createElement("tr");

      let statusClass = "badge-success";
      if (p.status === "PENDING") statusClass = "badge-warning";
      if (p.status === "FAILED" || p.status === "REFUNDED") statusClass = "badge-danger";

      tr.innerHTML = `
        <td><span class="payment-id">#${p.id}</span></td>
        <td><span class="booking-link">Booking #${p.bookingId}</span></td>
        <td class="payment-amount-cell">${formatPHP(p.amount)}</td>
        <td>${formatDate(p.paymentDate)}</td>
        <td><span class="method-badge">${getMethodIcon(p.method)} ${p.method || "-"}</span></td>
        <td><span class="badge ${statusClass}">${p.status}</span></td>
        <td><span class="reference-code">${p.reference || "-"}</span></td>
      `;

      tableBody.appendChild(tr);
    });
  }

  function loadPayments() {
    fetch("./api/payments_list.php")
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          console.error("Failed to load payments:", data.error);
          alert(data.error || "Failed to load payments.");
          return;
        }
        payments = data.payments || [];
        renderSummary(data.totalReceived, data.totalPending, data.totalCount);
        renderTable();
      })
      .catch(err => {
        console.error("Payments fetch error:", err);
        alert("Server error while loading payments.");
      });
  }

  // Search - real-time filtering
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderTable(searchInput.value.trim());
    });
    searchInput.addEventListener("keyup", e => {
      if (e.key === "Enter") {
        renderTable(searchInput.value.trim());
      }
    });
  }

  // Initial load
  loadPayments();
});
