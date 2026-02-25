/* script.js (updated: adds Reset Inputs feature) */

let menuData = {};
let grandTotal = 0;
let manualMode = false;

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
const clearAllBtn = document.getElementById("clearAllBtn");
const resetBtn = document.getElementById("resetBtn");

// ---------- Load JSON (unchanged) ----------
function loadAllJsons() {
  return fetch("data/list.json")
    .then(res => res.json())
    .then(files => Promise.all((files || []).map(f => fetch(`data/${f}`).then(r => r.json()))))
    .then(results => {
      results.forEach(d => Object.assign(menuData, d));
      loadMainCategories();
    })
    .catch(err => console.warn("Menu load error:", err));
}

window.addEventListener("load", () => {
  loadFromLocalStorage();
  loadAllJsons().catch(err => console.warn(err));
});

// ---------- Dropdown helpers (unchanged) ----------
function loadMainCategories() {
  mainCategory.innerHTML = '<option value="">-- Select Main Category --</option>';
  Object.keys(menuData).forEach(cat => mainCategory.appendChild(new Option(cat, cat)));
}

function updateSubCategory1() {
  subCategory1.innerHTML = '<option value="">-- Select Subcategory 1 --</option>';
  subCategory2.innerHTML = '<option value="">-- Select Subcategory 2 --</option>';
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
  if (manualMode) return;
  const sel = mainCategory.value;
  if (sel && menuData[sel]) Object.keys(menuData[sel]).forEach(sub => subCategory1.appendChild(new Option(sub, sub)));
}

function updateSubCategory2() {
  subCategory2.innerHTML = '<option value="">-- Select Subcategory 2 --</option>';
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
  if (manualMode) return;
  const main = mainCategory.value;
  const sub1 = subCategory1.value;
  if (main && sub1 && menuData[main] && menuData[main][sub1]) Object.keys(menuData[main][sub1]).forEach(sub => subCategory2.appendChild(new Option(sub, sub)));
}

function updateItems() {
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
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

function autoFillPrice() {
  if (manualMode) return;
  const sel = itemList.options[itemList.selectedIndex];
  if (priceInput) priceInput.value = sel?.dataset?.price || "";
}

function enterManualPrice() {
  const val = prompt("Enter custom price (Rs):");
  if (val && !isNaN(val)) priceInput.value = val;
}

// ---------- Manual item toggle (unchanged) ----------
function toggleManualItem() {
  manualMode = !manualMode;
  const toggleBtn = document.getElementById("toggleManualItemBtn");
  if (manualMode) {
    if (itemList) itemList.style.display = "none";
    if (manualItemInput) manualItemInput.style.display = "block";
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

// ---------- Invoice row operations (unchanged, with actions) ----------
function addToInvoice() {
  const dateVal = entryDate.value || "";
  const itemName = manualMode ? manualItemInput.value.trim() : itemList.value;
  if (!itemName) return alert("Enter/select item!");
  const price = parseFloat(priceInput.value);
  const qty = parseInt(quantityInput.value);
  if (isNaN(price) || qty <= 0) return alert("Enter valid price/quantity!");
  const total = price * qty;

  const row = invoiceTable.insertRow();
  row.insertCell(0).textContent = dateVal;
  row.insertCell(1).textContent = itemName;
  row.insertCell(2).textContent = price.toFixed(2);
  row.insertCell(3).textContent = qty;
  row.insertCell(4).textContent = total.toFixed(2);

  const actionCell = row.insertCell(5);
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "action-btn edit-btn";
  editBtn.onclick = () => editRow(row);
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "action-btn delete-btn";
  deleteBtn.onclick = () => deleteRow(row);
  actionCell.append(editBtn, deleteBtn);

  grandTotal = calculateGrandTotal();
  grandTotalElement.textContent = grandTotal.toFixed(2);

  saveToLocalStorage();
}

function editRow(row) {
  entryDate.value = row.cells[0].textContent;
  // If item exists in dropdown, select it; otherwise put into manual input
  const itemText = row.cells[1].textContent;
  const found = Array.from(itemList.options).find(o => o.value === itemText);
  if (found) {
    // switch to dropdown mode and select
    if (manualItemInput) manualItemInput.style.display = "none";
    if (itemList) { itemList.style.display = "block"; itemList.value = itemText; }
    manualMode = false;
    document.getElementById("toggleManualItemBtn").textContent = "Manual Item Entry";
  } else {
    // switch to manual mode
    if (itemList) itemList.style.display = "none";
    if (manualItemInput) { manualItemInput.style.display = "block"; manualItemInput.value = itemText; }
    manualMode = true;
    document.getElementById("toggleManualItemBtn").textContent = "Cancel Manual Entry";
  }
  priceInput.value = row.cells[2].textContent;
  quantityInput.value = row.cells[3].textContent;
  // delete the old row
  invoiceTable.deleteRow(row.rowIndex - 1);
  grandTotal = calculateGrandTotal();
  grandTotalElement.textContent = grandTotal.toFixed(2);
  saveToLocalStorage();
}

function deleteRow(row) {
  if (confirm("Delete this row?")) {
    invoiceTable.deleteRow(row.rowIndex - 1);
    grandTotal = calculateGrandTotal();
    grandTotalElement.textContent = grandTotal.toFixed(2);
    saveToLocalStorage();
  }
}

function calculateGrandTotal() {
  let sum = 0;
  invoiceTable.querySelectorAll("tr").forEach(row => {
    sum += parseFloat(row.cells[4].textContent) || 0;
  });
  return sum;
}

// ---------- Clear All table rows (keeps form inputs intact) ----------
clearAllBtn.addEventListener("click", () => {
  if (!confirm("Clear all invoice rows?")) return;
  // remove rows
  while (invoiceTable.firstChild) invoiceTable.removeChild(invoiceTable.firstChild);
  grandTotal = 0;
  grandTotalElement.textContent = grandTotal.toFixed(2);
  localStorage.removeItem("invoiceData");
});

// ---------- NEW: Reset inputs (clears the form fields, not the invoice) ----------
function resetInputs() {
  // date
  if (entryDate) entryDate.value = "";

  // reset selects to default and clear dependent selects
  if (mainCategory) mainCategory.selectedIndex = 0;
  if (subCategory1) subCategory1.innerHTML = '<option value="">-- Select Subcategory 1 --</option>';
  if (subCategory2) subCategory2.innerHTML = '<option value="">-- Select Subcategory 2 --</option>';
  if (itemList) itemList.innerHTML = '<option value="">-- Select Item --</option>';

  // price and quantity
  if (priceInput) {
    priceInput.value = "";
    priceInput.readOnly = true;
  }
  if (quantityInput) quantityInput.value = 1;

  // hide manual item input and reset manualMode
  if (manualItemInput) {
    manualItemInput.style.display = "none";
    manualItemInput.value = "";
  }
  if (itemList) itemList.style.display = "block";
  manualMode = false;

  // update toggle button text
  const toggleBtn = document.getElementById("toggleManualItemBtn");
  if (toggleBtn) toggleBtn.textContent = "Manual Item Entry";

  // set focus to date for convenience
  if (entryDate) entryDate.focus();
}

// wire the Reset button
if (resetBtn) resetBtn.addEventListener("click", resetInputs);

// ---------- Print ----------
function printInvoice() { window.print(); }

// ---------- LocalStorage ----------
function saveToLocalStorage() {
  const tableData = [];
  invoiceTable.querySelectorAll("tr").forEach(row => {
    tableData.push({
      date: row.cells[0].textContent,
      itemName: row.cells[1].textContent,
      price: parseFloat(row.cells[2].textContent),
      quantity: parseInt(row.cells[3].textContent),
      total: parseFloat(row.cells[4].textContent)
    });
  });
  localStorage.setItem("invoiceData", JSON.stringify(tableData));
}

function loadFromLocalStorage() {
  const stored = JSON.parse(localStorage.getItem("invoiceData") || "[]");
  invoiceTable.innerHTML = "";
  stored.forEach(entry => {
    const row = invoiceTable.insertRow();
    row.insertCell(0).textContent = entry.date || "";
    row.insertCell(1).textContent = entry.itemName || "";
    row.insertCell(2).textContent = (entry.price || 0).toFixed(2);
    row.insertCell(3).textContent = entry.quantity || 0;
    row.insertCell(4).textContent = (entry.total || 0).toFixed(2);

    const actionCell = row.insertCell(5);
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "action-btn edit-btn";
    editBtn.onclick = () => editRow(row);
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.onclick = () => deleteRow(row);
    actionCell.append(editBtn, deleteBtn);
  });
  grandTotal = calculateGrandTotal();
  grandTotalElement.textContent = grandTotal.toFixed(2);
}