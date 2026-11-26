// main.js — the router and the state. Hash routes pick a page; every form
// on the site writes into the state, saves it to localStorage, and re-renders,
// so the dashboard, budget bars and charts always agree with each other.

import { DATA, fmt } from "./data.js";
import { renderBudget, renderDashboard, renderGoals, renderReports, renderTransactions } from "./views.js";

const STORE_KEY = "wijaya-budget-v1";

// ---- State: the base numbers from data.js, plus what the user changed. ----
function loadState() {
  const state = {
    transactions: DATA.transactions.map((t) => ({ ...t })),
    budgets: Object.fromEntries(DATA.categories.map((c) => [c.id, c.budget])),
    goals: DATA.goals.map((g) => ({ ...g })),
    accounts: DATA.accounts.map((a) => ({ ...a })),
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
  "/goals": () => renderGoals(state),
  "/reports": () => renderReports(state),
};

const txFilter = { q: "", category: "all", month: "November 2026" };
const titles = {
  "/": "Dashboard",
  "/transactions": "Transactions",
  "/budget": "Budget",
  "/goals": "Savings goals",
  "/reports": "Reports",
};

function nav() {
  const links = [
    ["/", "Dashboard"],
    ["/transactions", "Transactions"],
    ["/budget", "Budget"],
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
  if (path === "/goals") wireGoals();
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

  const form = document.getElementById("add-tx");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const merchant = document.getElementById("tx-merchant").value.trim();
    const amount = Math.round(Number(document.getElementById("tx-amount").value));
    const category = document.getElementById("tx-category").value;
    const date = document.getElementById("tx-date").value || "2026-11-26";
    const note = document.getElementById("tx-note").value.trim();
    if (!merchant || !(amount > 0)) return;
    const tx = { date, merchant, category, type: "out", amount, note };
    state.transactions.push(tx);
    addedTransactions.push(tx);
    saveState(state, addedTransactions);
    form.reset();
    document.getElementById("tx-date").value = "2026-11-26";
    render();
    const msg = document.getElementById("tx-msg");
    if (msg) msg.textContent = "Added " + merchant + " — " + fmt(amount) + ". Totals updated everywhere.";
  });
}

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
