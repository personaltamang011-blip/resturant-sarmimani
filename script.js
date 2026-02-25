// script.js (fixed, robust & with Flatpickr integration)

let menuData = {};
let grandTotal = 0;
let manualMode = false;

// DOM references
const mainCategory = document.getElementById("mainCategory");
const subCategory1 = document.getElementById("subCategory1");
const subCategory2 = document.getElementById("subCategory2");
const itemList = document.getElementById("itemList");
const priceInput = document.getElementById("priceInput");
const quantityInput = document.getElementById("quantityInput");
const manualItemInput = document.getElementById("manualItemInput");
const invoiceTable = document.querySelector("#invoiceTable tbody");
const grandTotalElement = document.getElementById("grandTotal");
const entryDate = document.getElementById("entryDate");

// ---------- Initialize Flatpickr ----------
document.addEventListener("DOMContentLoaded", function () {
  if (typeof flatpickr !== "undefined" && entryDate) {
    flatpickr("#entryDate", {
      dateFormat: "Y-m-d",
      allowInput: true,  // allows manual typing
      altInput: false,   // disables readonly alternate input
      clickOpens: true   // keeps calendar on tap/click
    });
    console.log("✅ Flatpickr active: manual typing + calendar enabled");
  }
});

// ---------- Dynamic JSON loader (safe) ----------
function loadAllJsons() {
  // Try to fetch data/list.json which should contain an array of filenames
  return fetch("data/list.json")
    .then(res => {
      if (!res.ok) throw new Error("list.json not found or returned " + res.status);
      return res.json();
    })
    .then(files => {
      const promises = (files || []).map(f =>
        fetch(`data/${f}`).then(r => {
          if (!r.ok) throw new Error(`Failed to load data/${f} (status ${r.status})`);
          return r.json();
        })
      );
      return Promise.all(promises);
    })
    .then(results => {
      results.forEach(d => Object.assign(menuData, d));
      loadMainCategories();
      console.info("✅ Menu JSONs loaded successfully.");
    });
}

// ---------- Initialization ----------
window.addEventListener("load", () => {
  // Always try to load saved invoice rows (so localStorage works even if JSON fetch fails)
  loadFromLocalStorage();

  // Attempt to load menu JSONs; if it fails, still continue (we already restored invoice)
  loadAllJsons().catch(err => {
    console.warn("⚠️ Could not load JSON files for menu. Dropdowns will be empty until files are available.", err);
    // Still call loadMainCategories() if menuData was populated some other way
    if (Object.keys(menuData).length) loadMainCategories();
  });
});

// ---------- Populate main categories ----------
function loadMainCategories() {
  if (!mainCategory) return;
  mainCategory.innerHTML = '<option value="">-- Select Main Category --</option>';
  Object.keys(menuData).forEach(cat => mainCategory.appendChild(new Option(cat, cat)));
}

// ---------- Dropdown updates ----------
function updateSubCategory1() {
  if (!subCategory1 || !subCategory2 || !itemList) return;
  subCategory1.innerHTML = '<option value="">-- Select Subcategory 1 --</option>';
  subCategory2.innerHTML = '<option value="">-- Select Subcategory 2 --</option>';
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
  priceInput && (priceInput.value = "");
  if (manualMode) return;
  const sel = mainCategory.value;
  if (sel && menuData[sel]) {
    Object.keys(menuData[sel]).forEach(sub => subCategory1.appendChild(new Option(sub, sub)));
  }
}

function updateSubCategory2() {
  if (!subCategory2 || !itemList) return;
  subCategory2.innerHTML = '<option value="">-- Select Subcategory 2 --</option>';
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
  priceInput && (priceInput.value = "");
  if (manualMode) return;
  const main = mainCategory.value;
  const sub1 = subCategory1.value;
  if (main && sub1 && menuData[main] && menuData[main][sub1]) {
    Object.keys(menuData[main][sub1]).forEach(sub => subCategory2.appendChild(new Option(sub, sub)));
  }
}

function updateItems() {
  if (!itemList) return;
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
  priceInput && (priceInput.value = "");
  if (manualMode) return;
  const main = mainCategory.value;
  const sub1 = subCategory1.value;
  const sub2 = subCategory2.value;
  if (main && sub1 && sub2 && menuData[main] && menuData[main][sub1] && menuData[main][sub1][sub2]) {
    menuData[main][sub1][sub2].forEach(item => {
      const opt = new Option(item.name, item.name);
      opt.dataset.price = item.price;
      itemList.appendChild(opt);
    });
  }
}

// ---------- Auto-fill price ----------
function autoFillPrice() {
  if (manualMode || !itemList) return;
  const sel = itemList.options[itemList.selectedIndex];
  if (priceInput) priceInput.value = sel?.dataset?.price || "";
}

// ---------- Manual price entry ----------
function enterManualPrice() {
  const val = prompt("Enter custom price (Rs):");
  if (val !== null && val !== "" && !isNaN(val)) {
    if (priceInput) priceInput.value = val;
  } else if (val !== null) {
    alert("Invalid price entered.");
  }
}

// ---------- Toggle manual item entry ----------
function toggleManualItem() {
  manualMode = !manualMode;
  const toggleBtn = document.getElementById("toggleManualItemBtn");
  if (manualMode) {
    if (itemList) itemList.style.display = "none";
    if (manualItemInput) {
      manualItemInput.style.display = "block";
      manualItemInput.focus();
    }
    if (toggleBtn) toggleBtn.textContent = "Cancel Manual Entry";
    if (priceInput) priceInput.readOnly = false;
  } else {
    if (itemList) itemList.style.display = "block";
    if (manualItemInput) {
      manualItemInput.style.display = "none";
      manualItemInput.value = "";
    }
    if (toggleBtn) toggleBtn.textContent = "Manual Item Entry";
    if (priceInput) {
      priceInput.value = "";
      priceInput.readOnly = true;
    }
  }
}

// ---------- Add to invoice ----------
function addToInvoice() {
  const dateVal = entryDate?.value || "";
  const itemName = manualMode ? (manualItemInput?.value || "").trim() : (itemList?.value || "");
  if (!itemName) { alert("Enter/select item!"); return; }
  const price = parseFloat(priceInput?.value);
  const qty = parseInt(quantityInput?.value);
  if (isNaN(price) || qty <= 0) { alert("Enter valid price/quantity!"); return; }
  const total = price * qty;

  const row = invoiceTable.insertRow();
  row.insertCell(0).textContent = dateVal;
  row.insertCell(1).textContent = itemName;
  row.insertCell(2).textContent = price.toFixed(2);
  row.insertCell(3).textContent = qty;
  row.insertCell(4).textContent = total.toFixed(2);

  grandTotal += total;
  if (grandTotalElement) grandTotalElement.textContent = grandTotal.toFixed(2);

  if (manualMode && manualItemInput) manualItemInput.value = "";
  saveToLocalStorage();
}

// ---------- Print ----------
function printInvoice() { window.print(); }

// ---------- Local storage ----------
function saveToLocalStorage() {
  const tableData = [];
  invoiceTable.querySelectorAll("tr").forEach(row => {
    const c = row.cells;
    tableData.push({
      date: c[0].textContent,
      itemName: c[1].textContent,
      price: parseFloat(c[2].textContent),
      quantity: parseInt(c[3].textContent),
      total: parseFloat(c[4].textContent)
    });
  });
  try {
    localStorage.setItem("invoiceData", JSON.stringify(tableData));
  } catch (e) {
    console.error("Could not save to localStorage:", e);
  }
}

function loadFromLocalStorage() {
  const raw = localStorage.getItem("invoiceData") || "[]";
  let stored = [];
  try {
    stored = JSON.parse(raw);
  } catch (e) {
    console.warn("Invalid invoiceData in localStorage, clearing it.");
    localStorage.removeItem("invoiceData");
    stored = [];
  }

  // clear current table rows (avoid duplication)
  while (invoiceTable.firstChild) invoiceTable.removeChild(invoiceTable.firstChild);

  stored.forEach(entry => {
    const row = invoiceTable.insertRow();
    row.insertCell(0).textContent = entry.date || "";
    row.insertCell(1).textContent = entry.itemName || "";
    row.insertCell(2).textContent = (entry.price || 0).toFixed(2);
    row.insertCell(3).textContent = (entry.quantity || 0);
    row.insertCell(4).textContent = (entry.total || 0).toFixed(2);
  });

  grandTotal = stored.reduce((sum, e) => sum + (e.total || 0), 0);
  if (grandTotalElement) grandTotalElement.textContent = grandTotal.toFixed(2);
}