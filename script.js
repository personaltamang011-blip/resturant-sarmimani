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

// 🔹 Dynamic JSON Loading
fetch("data/list.json")
  .then(res => res.json())
  .then(files => {
    const promises = files.map(f => fetch(`data/${f}`).then(r => r.json()));
    return Promise.all(promises);
  })
  .then(results => {
    results.forEach(d => Object.assign(menuData, d));
    loadMainCategories();
    loadFromLocalStorage();
  })
  .catch(err => console.error("Error loading JSON files:", err));

// 🔹 Populate main categories
function loadMainCategories() {
  mainCategory.innerHTML = '<option value="">-- Select Main Category --</option>';
  Object.keys(menuData).forEach(cat => mainCategory.appendChild(new Option(cat, cat)));
}

// 🔹 Dropdown updates
function updateSubCategory1() {
  subCategory1.innerHTML = '<option value="">-- Select Subcategory 1 --</option>';
  subCategory2.innerHTML = '<option value="">-- Select Subcategory 2 --</option>';
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
  priceInput.value = "";
  if (manualMode) return;
  const sel = mainCategory.value;
  if (sel) Object.keys(menuData[sel]).forEach(sub => subCategory1.appendChild(new Option(sub, sub)));
}

function updateSubCategory2() {
  subCategory2.innerHTML = '<option value="">-- Select Subcategory 2 --</option>';
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
  priceInput.value = "";
  if (manualMode) return;
  const main = mainCategory.value;
  const sub1 = subCategory1.value;
  if (main && sub1) Object.keys(menuData[main][sub1]).forEach(sub => subCategory2.appendChild(new Option(sub, sub)));
}

function updateItems() {
  itemList.innerHTML = '<option value="">-- Select Item --</option>';
  priceInput.value = "";
  if (manualMode) return;
  const main = mainCategory.value;
  const sub1 = subCategory1.value;
  const sub2 = subCategory2.value;
  if (main && sub1 && sub2) {
    menuData[main][sub1][sub2].forEach(item => {
      const opt = new Option(item.name, item.name);
      opt.dataset.price = item.price;
      itemList.appendChild(opt);
    });
  }
}

// 🔹 Auto-fill price
function autoFillPrice() {
  if (manualMode) return;
  const sel = itemList.options[itemList.selectedIndex];
  priceInput.value = sel?.dataset.price || "";
}

// 🔹 Manual price entry
function enterManualPrice() {
  const val = prompt("Enter custom price (Rs):");
  if (val && !isNaN(val)) priceInput.value = val;
}

// 🔹 Toggle manual item entry
function toggleManualItem() {
  manualMode = !manualMode;
  if (manualMode) {
    itemList.style.display = "none";
    manualItemInput.style.display = "block";
    manualItemInput.focus();
    document.getElementById("toggleManualItemBtn").textContent = "Cancel Manual Entry";
    priceInput.readOnly = false;
  } else {
    itemList.style.display = "block";
    manualItemInput.style.display = "none";
    manualItemInput.value = "";
    document.getElementById("toggleManualItemBtn").textContent = "Manual Item Entry";
    priceInput.value = "";
    priceInput.readOnly = true;
  }
}

// 🔹 Add to invoice + save to localStorage
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

  grandTotal += total;
  grandTotalElement.textContent = grandTotal.toFixed(2);
  if (manualMode) manualItemInput.value = "";
  saveToLocalStorage();
}

// 🔹 Print invoice
function printInvoice() {
  window.print();
}

// 🔹 Local storage functions
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
  localStorage.setItem("invoiceData", JSON.stringify(tableData));
}

function loadFromLocalStorage() {
  const stored = JSON.parse(localStorage.getItem("invoiceData") || "[]");
  stored.forEach(entry => {
    const row = invoiceTable.insertRow();
    row.insertCell(0).textContent = entry.date;
    row.insertCell(1).textContent = entry.itemName;
    row.insertCell(2).textContent = entry.price.toFixed(2);
    row.insertCell(3).textContent = entry.quantity;
    row.insertCell(4).textContent = entry.total.toFixed(2);
  });
  grandTotal = stored.reduce((sum, e) => sum + e.total, 0);
  grandTotalElement.textContent = grandTotal.toFixed(2);
}