/* ==========================================================
   StockPilot - shared JavaScript (loaded by every page)
   Each feature checks that its elements exist, so one file
   works on all pages.
   ========================================================== */

/* ---------- Configuration (edit after deploying) ---------- */
const CONFIG = {
  // After deploying the backend on Render, replace this with your live URL, e.g.
  // "https://stockpilot-api.onrender.com/api/contact"
  contactEndpoint: "http://localhost:3000/api/contact",
  catalogUrl:
    "https://dummyjson.com/products?limit=6&select=title,price,category,stock,sku,thumbnail",
};

const STORAGE_KEY = "stockpilot.items";
const THEME_KEY = "stockpilot.theme";

/* ---------- Small helpers ---------- */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function money(n) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toast(message) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
}

/* ---------- Inventory data (saved in the browser's localStorage) ---------- */
const SEED_ITEMS = [
  { id: "p1", name: "Wireless Mouse", sku: "WM-1001", category: "Electronics", qty: 48, price: 19.99, min: 10 },
  { id: "p2", name: "Mechanical Keyboard", sku: "KB-2040", category: "Electronics", qty: 7, price: 59.5, min: 10 },
  { id: "p3", name: "A4 Copy Paper (500)", sku: "PP-3002", category: "Office", qty: 120, price: 6.25, min: 40 },
  { id: "p4", name: "Ballpoint Pens (Box)", sku: "PN-3110", category: "Office", qty: 0, price: 4.8, min: 15 },
  { id: "p5", name: "Standing Desk", sku: "DK-9001", category: "Furniture", qty: 12, price: 249, min: 5 },
  { id: "p6", name: "Ergonomic Chair", sku: "CH-9120", category: "Furniture", qty: 4, price: 179, min: 5 },
  { id: "p7", name: "USB-C Cable 1m", sku: "UC-1500", category: "Electronics", qty: 95, price: 7.5, min: 25 },
  { id: "p8", name: "Whiteboard Markers", sku: "WB-3300", category: "Office", qty: 33, price: 9.9, min: 12 },
];

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read saved inventory:", err);
  }
  saveItems(SEED_ITEMS);
  return SEED_ITEMS.map((i) => ({ ...i }));
}

function saveItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("Could not save inventory:", err);
  }
}

function stockStatus(item) {
  if (item.qty <= 0) return { key: "out", label: "Out of stock" };
  if (item.qty <= item.min) return { key: "low", label: "Low stock" };
  return { key: "in", label: "In stock" };
}

function newId() {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ---------- Theme (dark mode toggle) ---------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = $("#theme-btn");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));

  const btn = $("#theme-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    });
  }
}

/* ---------- Responsive navigation (hamburger menu) ---------- */
function initMenu() {
  const btn = $("#menu-btn");
  const menu = $("#menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
}

/* ---------- Accordion / FAQ ---------- */
function initAccordion() {
  $$(".accordion-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      const open = panel.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
}

/* ---------- Home page: live stats from saved inventory ---------- */
function renderStats() {
  if (!$("#stat-products")) return;
  const items = loadItems();
  const units = items.reduce((sum, i) => sum + i.qty, 0);
  const low = items.filter((i) => i.qty <= i.min).length;
  const value = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  $("#stat-products").textContent = items.length;
  $("#stat-units").textContent = units.toLocaleString("en-US");
  $("#stat-low").textContent = low;
  $("#stat-value").textContent = money(value);

  const preview = $("#low-preview");
  if (preview) {
    const alerts = items.filter((i) => i.qty <= i.min).slice(0, 4);
    preview.innerHTML = alerts.length
      ? alerts
          .map((i) => `<div class="mini-row"><span>${escapeHTML(i.name)}</span><strong>${i.qty} left</strong></div>`)
          .join("")
      : '<div class="mini-row"><span>All products are well stocked 🎉</span></div>';
  }
}

/* ---------- Home page: public API catalog (Week 4 Option A) ---------- */
async function loadCatalog() {
  const box = $("#catalog");
  if (!box) return;
  const status = $("#catalog-status");
  try {
    const res = await fetch(CONFIG.catalogUrl);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    box.innerHTML = "";
    data.products.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card product-card";

      const img = document.createElement("img");
      img.src = p.thumbnail;
      img.alt = p.title;
      img.loading = "lazy";

      const title = document.createElement("h3");
      title.textContent = p.title;

      const meta = document.createElement("div");
      meta.className = "meta";
      const cat = document.createElement("span");
      cat.textContent = p.category;
      const price = document.createElement("span");
      price.className = "price";
      price.textContent = money(p.price);
      meta.append(cat, price);

      const btn = document.createElement("button");
      btn.className = "btn btn-sm";
      btn.textContent = "Add to my stock";
      btn.addEventListener("click", () => {
        const items = loadItems();
        const sku = p.sku || "API-" + p.id;
        if (items.some((i) => i.sku === sku)) {
          toast("Already in your inventory");
          return;
        }
        items.push({
          id: newId(), name: p.title, sku, category: p.category,
          qty: Number(p.stock) || 0, price: Number(p.price) || 0, min: 10,
        });
        saveItems(items);
        renderStats();
        toast(`Added "${p.title}" to inventory`);
      });

      card.append(img, title, meta, btn);
      box.appendChild(card);
    });
    if (status) status.textContent = "";
  } catch (err) {
    console.error("Catalog failed to load:", err);
    box.innerHTML = "";
    if (status) status.textContent = "Could not load the product catalog. Check your internet connection and refresh.";
  }
}

/* ---------- Inventory page ---------- */
function initInventory() {
  const tbody = $("#item-table-body");
  if (!tbody) return;

  let items = loadItems();
  const search = $("#search");
  const filterCat = $("#filter-category");
  const filterStatus = $("#filter-status");
  const empty = $("#empty-state");
  const modal = $("#modal");
  const form = $("#item-form");
  const modalTitle = $("#modal-title");

  function refreshCategories() {
    const current = filterCat.value;
    const cats = [...new Set(items.map((i) => i.category))].sort();
    filterCat.innerHTML =
      '<option value="">All categories</option>' +
      cats.map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
    filterCat.value = cats.includes(current) ? current : "";
  }

  function render() {
    const q = search.value.trim().toLowerCase();
    const cat = filterCat.value;
    const st = filterStatus.value;

    const rows = items.filter((i) => {
      const matchQ = !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
      const matchC = !cat || i.category === cat;
      const matchS = !st || stockStatus(i).key === st;
      return matchQ && matchC && matchS;
    });

    tbody.innerHTML = rows
      .map((i) => {
        const s = stockStatus(i);
        return `<tr>
          <td><strong>${escapeHTML(i.name)}</strong></td>
          <td>${escapeHTML(i.sku)}</td>
          <td>${escapeHTML(i.category)}</td>
          <td>${i.qty}</td>
          <td>${money(i.price)}</td>
          <td>${money(i.qty * i.price)}</td>
          <td><span class="badge ${s.key}">${s.label}</span></td>
          <td class="actions">
            <button class="btn btn-sm btn-outline" data-act="minus" data-id="${i.id}" aria-label="Remove one unit of ${escapeHTML(i.name)}">−1</button>
            <button class="btn btn-sm btn-outline" data-act="plus" data-id="${i.id}" aria-label="Add one unit of ${escapeHTML(i.name)}">+1</button>
            <button class="btn btn-sm" data-act="edit" data-id="${i.id}">Edit</button>
            <button class="btn btn-sm btn-danger" data-act="delete" data-id="${i.id}">Delete</button>
          </td>
        </tr>`;
      })
      .join("");

    empty.style.display = rows.length ? "none" : "block";

    const units = items.reduce((s, i) => s + i.qty, 0);
    const value = items.reduce((s, i) => s + i.qty * i.price, 0);
    const low = items.filter((i) => i.qty > 0 && i.qty <= i.min).length;
    const out = items.filter((i) => i.qty <= 0).length;
    $("#summary").textContent =
      `${items.length} products · ${units.toLocaleString("en-US")} units · ${money(value)} stock value · ${low} low · ${out} out of stock`;
  }

  function persist() {
    saveItems(items);
    refreshCategories();
    render();
  }

  /* modal open / close */
  function openModal(item) {
    form.reset();
    $$(".error", form).forEach((e) => (e.textContent = ""));
    if (item) {
      modalTitle.textContent = "Edit product";
      form.elements.id.value = item.id;
      form.elements.name.value = item.name;
      form.elements.sku.value = item.sku;
      form.elements.category.value = item.category;
      form.elements.qty.value = item.qty;
      form.elements.price.value = item.price;
      form.elements.min.value = item.min;
    } else {
      modalTitle.textContent = "Add product";
      form.elements.id.value = "";
      form.elements.min.value = 10;
    }
    modal.classList.add("open");
    form.elements.name.focus();
  }

  function closeModal() {
    modal.classList.remove("open");
  }

  $("#add-btn").addEventListener("click", () => openModal(null));
  $("#cancel-btn").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  /* form validation + save */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      id: form.elements.id.value,
      name: form.elements.name.value.trim(),
      sku: form.elements.sku.value.trim().toUpperCase(),
      category: form.elements.category.value.trim() || "General",
      qty: Number(form.elements.qty.value),
      price: Number(form.elements.price.value),
      min: Number(form.elements.min.value),
    };

    const errors = {};
    if (!data.name) errors.name = "Product name is required.";
    if (!data.sku) errors.sku = "SKU is required.";
    else if (items.some((i) => i.sku === data.sku && i.id !== data.id)) errors.sku = "This SKU already exists.";
    if (!Number.isInteger(data.qty) || data.qty < 0) errors.qty = "Quantity must be a whole number, 0 or more.";
    if (!(data.price >= 0) || form.elements.price.value === "") errors.price = "Enter a valid price.";
    if (!Number.isInteger(data.min) || data.min < 0) errors.min = "Enter a whole number, 0 or more.";

    ["name", "sku", "qty", "price", "min"].forEach((f) => {
      $(`#err-${f}`).textContent = errors[f] || "";
    });
    if (Object.keys(errors).length) return;

    if (data.id) {
      items = items.map((i) => (i.id === data.id ? data : i));
      toast("Product updated");
    } else {
      data.id = newId();
      items.push(data);
      toast("Product added");
    }
    persist();
    closeModal();
  });

  /* table buttons (event delegation) */
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const item = items.find((i) => i.id === btn.dataset.id);
    if (!item) return;

    switch (btn.dataset.act) {
      case "plus":
        item.qty += 1;
        persist();
        break;
      case "minus":
        item.qty = Math.max(0, item.qty - 1);
        persist();
        break;
      case "edit":
        openModal(item);
        break;
      case "delete":
        if (confirm(`Delete "${item.name}" from inventory?`)) {
          items = items.filter((i) => i.id !== item.id);
          persist();
          toast("Product deleted");
        }
        break;
    }
  });

  [search, filterCat, filterStatus].forEach((el) => el.addEventListener("input", render));

  /* export to CSV */
  $("#export-btn").addEventListener("click", () => {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ["Name", "SKU", "Category", "Quantity", "Price", "Reorder level"];
    const lines = items.map((i) => [i.name, i.sku, i.category, i.qty, i.price, i.min].map(esc).join(","));
    const blob = new Blob([[header.map(esc).join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stockpilot-inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV downloaded");
  });

  /* reset demo data */
  $("#reset-btn").addEventListener("click", () => {
    if (confirm("Reset inventory back to the demo data? Your changes will be lost.")) {
      items = SEED_ITEMS.map((i) => ({ ...i }));
      persist();
      toast("Demo data restored");
    }
  });

  refreshCategories();
  render();
}

/* ---------- Contact form (validation + backend call) ---------- */
function initContactForm() {
  const form = $("#contact-form");
  if (!form) return;
  const status = $("#form-status");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const message = form.elements.message.value.trim();

    const errors = {};
    if (name.length < 2) errors.name = "Please enter your name.";
    if (!emailRe.test(email)) errors.email = "Please enter a valid email.";
    if (message.length < 10) errors.message = "Message should be at least 10 characters.";

    ["name", "email", "message"].forEach((f) => {
      $(`#err-${f}`).textContent = errors[f] || "";
    });
    status.textContent = "";
    status.className = "form-status";
    if (Object.keys(errors).length) return;

    const submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    submit.textContent = "Sending...";

    try {
      const res = await fetch(CONFIG.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Server error " + res.status);
      status.textContent = data.message || "Thank you, we received your message.";
      status.classList.add("ok");
      form.reset();
    } catch (err) {
      console.error("Contact form error:", err);
      status.textContent =
        "We could not reach the server right now. Please try again later or email us directly.";
      status.classList.add("fail");
    } finally {
      submit.disabled = false;
      submit.textContent = "Send message";
    }
  });
}

/* ---------- Footer year + start everything ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  initTheme();
  initMenu();
  initAccordion();
  renderStats();
  loadCatalog();
  initInventory();
  initContactForm();
});
