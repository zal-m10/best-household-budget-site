// main.js — the router and the state. Hash routes pick a page; every form
// on the site writes into the state, saves it to localStorage, and re-renders,
// so the dashboard, budget bars and charts always agree with each other.

import { DATA, fmt } from "./data.js";
import { esc, renderBudget, renderDashboard, renderDebts, renderGoals, renderReports, renderTransactions } from "./views.js";

const STORE_KEY = "wijaya-budget-v1";

// ---- State: the base numbers from data.js, plus what the user changed. ----
function loadState() {
  const state = {
    transactions: DATA.transactions.map((t) => ({ ...t })),
    budgets: Object.fromEntries(DATA.categories.map((c) => [c.id, c.budget])),
    goals: DATA.goals.map((g) => ({ ...g })),
    accounts: DATA.accounts.map((a) => ({ ...a })),
    debts: DATA.debts.map((d) => ({ ...d })),
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (!saved) return state;
    if (Array.isArray(saved.addedTransactions)) state.transactions.push(...saved.addedTransactions);
    if (saved.budgets) for (const [id, amount] of Object.entries(saved.budgets)) if (state.budgets[id] !== undefined) state.budgets[id] = amount;
    if (Array.isArray(saved.goals)) for (const g of saved.goals) {
      const goal = state.goals.find((x) => x.id === g.id);
      if (goal) goal.saved = g.saved;
    }
    if (Array.isArray(saved.accounts)) state.accounts = saved.accounts;
    if (Array.isArray(saved.debts)) state.debts = saved.debts;
  } catch (e) {
    // A damaged save is ignored; the base numbers still render.
  }
  return state;
}

function saveState(state, addedTransactions) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      addedTransactions,
      budgets: state.budgets,
      goals: state.goals.map((g) => ({ id: g.id, saved: g.saved })),
      accounts: state.accounts,
      debts: state.debts,
    }));
  } catch (e) {
    // Private mode or a full store: the site still works in memory.
  }
}

const state = loadState();
const addedTransactions = state.transactions.slice(DATA.transactions.length);

// ---- Router ----
const routes = {
  "/": () => renderDashboard(state),
  "/transactions": () => renderTransactions(state, txFilter),
  "/budget": () => renderBudget(state),
  "/debts": () => renderDebts(state),
  "/goals": () => renderGoals(state),
  "/reports": () => renderReports(state),
};

const txFilter = { q: "", category: "all", month: "November 2026" };
const titles = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/budget": "Budget",
  "/debts": "Debts",
  "/goals": "Savings goals",
  "/reports": "Reports",
};

function nav() {
  const links = [
    ["/", "Dashboard"],
    ["/transactions", "Transactions"],
    ["/budget", "Budget"],
    ["/debts", "Debts"],
    ["/goals", "Goals"],
    ["/reports", "Reports"],
  ];
  const path = currentPath();
  return links.map(([href, label]) =>
    `<a href="#${href}" class="${href === path ? "active" : ""}">${label}</a>`).join("");
}

function currentPath() {
  const hash = location.hash.replace(/^#/, "") || "/";
  return routes[hash] ? hash : "/";
}

function render() {
  const path = currentPath();
  document.body.dataset.page = path;
  setNavOpen(false);
  const app = document.getElementById("app");
  app.innerHTML = routes[path]() + siteFooter();
  document.querySelectorAll("nav.main a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + path);
  });
  document.title = titles[path] + " — " + DATA.household.name + " Budget";
  wirePage(path);
  window.scrollTo(0, 0);
}

function siteFooter() {
  return `<footer class="site">${DATA.household.name} · ${DATA.household.members} · ${DATA.household.city} · ${DATA.household.month}. `
    + `A household budget site that works offline — every figure comes from the family's own numbers.</footer>`;
}

// ---- Page controls: every button and field on the site does something. ----
function wirePage(path) {
  if (path === "/transactions") wireTransactions();
  if (path === "/budget") wireBudget();
  if (path === "/debts") wireDebts();
  if (path === "/goals") wireGoals();
}

// ---- Receipt photo attached to the transaction being typed, if any. ----
// Held in memory only and saved with the transaction when it is added.
// The photo is shrunk to at most 900 px on its long side before it is
// kept, so a phone picture stays small in the saved state.
let pendingReceipt = null;      // downscaled JPEG data URL, or null
let pendingReceiptName = "";
let receiptPromise = null;      // resolves when the chosen photo is ready

function readAndShrinkPhoto(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => resolve(String(reader.result));
      img.src = String(reader.result);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function showReceiptPreview() {
  const box = document.getElementById("tx-receipt-preview");
  if (!box || !pendingReceipt) return;
  box.hidden = false;
  box.innerHTML = `<img class="receipt-preview-img" src="${pendingReceipt}" alt="Attached receipt preview" title="Tap to enlarge">`
    + `<div><b>${esc(pendingReceiptName)}</b><br><span class="muted small">Attached — it will be saved with this transaction.</span><br>`
    + `<button type="button" class="ghost small" id="tx-receipt-remove">Remove photo</button></div>`;
  document.getElementById("tx-receipt-remove").addEventListener("click", clearPendingReceipt);
}

function clearPendingReceipt() {
  pendingReceipt = null;
  pendingReceiptName = "";
  receiptPromise = null;
  for (const id of ["tx-receipt-camera", "tx-receipt-gallery"]) {
    const input = document.getElementById(id);
    if (input) input.value = "";
  }
  const box = document.getElementById("tx-receipt-preview");
  if (box) { box.hidden = true; box.innerHTML = ""; }
}

function attachPhotoFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    const msg = document.getElementById("tx-msg");
    if (msg) msg.textContent = "That file is not an image — pick a photo of the receipt or proof.";
    return;
  }
  pendingReceiptName = file.name;
  receiptPromise = readAndShrinkPhoto(file);
  receiptPromise.then((dataUrl) => {
    pendingReceipt = dataUrl;
    showReceiptPreview();
  });
}

// The category list follows the type: spending takes the 9 categories,
// income takes the single Income category.
function setTxCategories() {
  const type = document.querySelector('input[name="tx-type"]:checked')?.value || "out";
  const sel = document.getElementById("tx-category");
  if (!sel) return;
  sel.innerHTML = type === "in"
    ? `<option value="income">Income</option>`
    : DATA.categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
}

function wireTransactions() {
  const q = document.getElementById("f-q");
  const cat = document.getElementById("f-cat");
  const month = document.getElementById("f-month");
  q.addEventListener("input", () => { txFilter.q = q.value; refreshList(); });
  cat.addEventListener("change", () => { txFilter.category = cat.value; refreshList(); });
  month.addEventListener("change", () => {
    txFilter.month = month.value;
    refreshList();
    const msg = document.getElementById("tx-month-note");
    if (msg) msg.textContent = txFilter.month === "October 2026"
      ? "October's transactions are not in this household file — the family started tracking in November 2026."
      : "";
  });

  document.querySelectorAll('input[name="tx-type"]').forEach((r) =>
    r.addEventListener("change", setTxCategories));

  // Two separate photo buttons: Camera opens the camera on a phone,
  // Gallery opens the system picker with the phone's photos. On a
  // computer both open the file picker, which is the same thing there.
  const cameraInput = document.getElementById("tx-receipt-camera");
  const galleryInput = document.getElementById("tx-receipt-gallery");
  document.getElementById("tx-attach-camera").addEventListener("click", () => cameraInput.click());
  document.getElementById("tx-attach-gallery").addEventListener("click", () => galleryInput.click());
  cameraInput.addEventListener("change", () => attachPhotoFile(cameraInput.files[0]));
  galleryInput.addEventListener("change", () => attachPhotoFile(galleryInput.files[0]));

  const form = document.getElementById("add-tx");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const merchant = document.getElementById("tx-merchant").value.trim();
    const amount = Math.round(Number(document.getElementById("tx-amount").value));
    const type = document.querySelector('input[name="tx-type"]:checked')?.value || "out";
    const category = type === "in" ? "income" : document.getElementById("tx-category").value;
    const accountIndex = Number(document.getElementById("tx-account").value);
    const account = state.accounts[accountIndex] || state.accounts[0];
    const date = document.getElementById("tx-date").value || "2026-11-26";
    const note = document.getElementById("tx-note").value.trim();
    if (!merchant || !(amount > 0)) return;
    // The photo may still be shrinking; wait for it before saving.
    const receipt = receiptPromise ? await receiptPromise : null;
    const tx = { date, merchant, category, type, amount, note, account: account.name };
    if (receipt) tx.receipt = receipt;
    state.transactions.push(tx);
    addedTransactions.push(tx);
    // The money moves in or out of the wallet the user picked.
    account.balance += type === "in" ? amount : -amount;
    saveState(state, addedTransactions);
    clearPendingReceipt();
    form.reset();
    setTxCategories();
    document.getElementById("tx-date").value = "2026-11-26";
    render();
    const msg = document.getElementById("tx-msg");
    if (msg) msg.textContent = "Added " + merchant + " — " + fmt(amount) + " " + (type === "in" ? "to " : "from ") + account.name + ". Totals updated everywhere.";
  });

  // A photo attached before the list re-rendered (search, filter) keeps
  // its preview when the form is wired again.
  if (pendingReceipt) showReceiptPreview();
}

// ---- Debts: recording one moves no money; settling one moves a wallet. ----
function wireDebts() {
  document.querySelectorAll("form.settle-debt").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const debt = state.debts.find((d) => d.id === form.dataset.debt);
      if (!debt || debt.status === "paid") return;
      const wallet = state.accounts[Number(form.querySelector("select").value)] || state.accounts[0];
      // Paying a debt we owe takes money out; collecting one puts it in.
      if (debt.direction === "utang" && wallet.balance < debt.amount) {
        const msg = document.getElementById("debt-msg");
        if (msg) msg.textContent = "Not enough in " + wallet.name + " to pay " + fmt(debt.amount) + ".";
        return;
      }
      wallet.balance += debt.direction === "utang" ? -debt.amount : debt.amount;
      debt.status = "paid";
      debt.settledDate = "2026-11-26";
      debt.settledAccount = wallet.name;
      saveState(state, addedTransactions);
      render();
      const msg = document.getElementById("debt-msg");
      if (msg) msg.textContent = debt.person + " — " + fmt(debt.amount) + " settled through " + wallet.name + ".";
    });
  });

  const form = document.getElementById("add-debt");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const person = document.getElementById("debt-person").value.trim();
    const amount = Math.round(Number(document.getElementById("debt-amount").value));
    const direction = document.querySelector('input[name="debt-dir"]:checked')?.value || "piutang";
    const due = document.getElementById("debt-due").value || "";
    const note = document.getElementById("debt-note").value.trim();
    if (!person || !(amount > 0)) return;
    state.debts.push({ id: "d" + Date.now(), person, direction, amount, due, note, status: "open" });
    saveState(state, addedTransactions);
    form.reset();
    render();
    const msg = document.getElementById("debt-add-msg");
    if (msg) msg.textContent = "Recorded — no money moved, and no total changed. It moves only when it is settled.";
  });
}

// ---- Sidebar drawer (phone): the hamburger opens it; a link, the scrim or Esc closes it. ----
const menuBtn = document.getElementById("menu-btn");
const scrim = document.getElementById("scrim");
function setNavOpen(open) {
  document.body.classList.toggle("nav-open", open);
  scrim.hidden = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setNavOpen(!document.body.classList.contains("nav-open")));
scrim.addEventListener("click", () => setNavOpen(false));
document.querySelector("nav.main").addEventListener("click", (e) => {
  if (e.target.closest("a")) setNavOpen(false);
});

// ---- Receipt lightbox: tap a thumbnail in any row to enlarge it. ----
function openLightbox(src, alt) {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  img.src = src;
  img.alt = alt || "Receipt or payment proof";
  box.hidden = false;
}

function closeLightbox() {
  const box = document.getElementById("lightbox");
  box.hidden = true;
  document.getElementById("lightbox-img").removeAttribute("src");
}

document.getElementById("app").addEventListener("click", (e) => {
  const thumb = e.target.closest(".receipt-thumb, .receipt-preview-img");
  if (thumb) openLightbox(thumb.src, thumb.alt);
});
document.getElementById("lightbox").addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeLightbox(); setNavOpen(false); } });

function refreshList() {
  // Re-render just the page; the filter values live in txFilter, so the
  // search box keeps its text while the list updates under it.
  const path = currentPath();
  const app = document.getElementById("app");
  app.innerHTML = routes[path]() + siteFooter();
  wirePage(path);
  const q = document.getElementById("f-q");
  if (q) { q.value = txFilter.q; q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
}

function wireBudget() {
  const form = document.getElementById("edit-budget");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("bd-cat").value;
    const amount = Math.round(Number(document.getElementById("bd-amount").value));
    if (!(amount >= 0)) return;
    state.budgets[id] = amount;
    saveState(state, addedTransactions);
    render();
    const msg = document.getElementById("bd-msg");
    if (msg) msg.textContent = "Budget saved. The bars above and the dashboard already show it.";
  });
}

function wireGoals() {
  document.querySelectorAll("form.add-goal").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = form.dataset.goal;
      const amount = Math.round(Number(form.querySelector("input").value));
      if (!(amount > 0)) return;
      const goal = state.goals.find((g) => g.id === id);
      const main = state.accounts[0];
      if (!goal || !main || main.balance < amount) {
        const msg = document.getElementById("goal-msg");
        if (msg) msg.textContent = "Not enough in the main account for that amount.";
        return;
      }
      goal.saved += amount;
      main.balance -= amount;
      const savings = state.accounts.find((a) => a.name.startsWith("Savings"));
      if (savings) savings.balance += amount;
      saveState(state, addedTransactions);
      render();
      const msg = document.getElementById("goal-msg");
      if (msg) msg.textContent = fmt(amount) + " added to " + goal.name + ". Main account down, savings up — total balance unchanged.";
    });
  });
}

window.addEventListener("hashchange", render);
render();
