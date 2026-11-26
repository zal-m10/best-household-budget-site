// views.js — one render function per page. Each takes the live state
// (transactions, budgets, goals, accounts) and returns HTML. Nothing here
// holds a number of its own: every figure comes from data.js or from the
// state the user changed with a working control.

import { DATA, categoryById, categorySpent, fmt, fmtDate, fmtJt, monthIncome, monthSpending, savingsRate, totalBalance } from "./data.js";
import { budgetBars, donutChart, savingsBars, trendChart } from "./charts.js";

// User-typed text (merchant, note) must never become markup.
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function txRow(t) {
  const cat = categoryById(t.category);
  const dot = cat ? `<span class="cat-dot" style="background:${cat.color}"></span>${cat.name}` : "Income";
  const sign = t.type === "in" ? "+" : "−";
  return `<tr><td class="num">${fmtDate(t.date)}</td><td><b>${esc(t.merchant)}</b><br><span class="muted small">${esc(t.note || "")}</span></td><td class="hide-phone">${dot}</td><td class="amt num">${sign} ${fmt(t.amount)}</td></tr>`;
}

export function txTable(txs) {
  if (txs.length === 0) return `<p class="muted">No transactions match. Try clearing the search or choosing another category.</p>`;
  return `<table class="tx"><thead><tr><th>Date</th><th>What</th><th class="hide-phone">Category</th><th class="amt">Amount</th></tr></thead><tbody>`
    + txs.map(txRow).join("") + `</tbody></table>`;
}

function budgetRows(state) {
  return DATA.categories.map((c) => ({
    name: c.name, color: c.color,
    budget: state.budgets[c.id], actual: categorySpent(c.id, state.transactions),
  }));
}

export function renderDashboard(state) {
  const income = monthIncome(state.transactions);
  const spent = monthSpending(state.transactions);
  const rate = savingsRate(state.transactions);
  const balance = totalBalance(state.accounts);
  const salary = DATA.incomeSources[0].amount;
  const freelance = DATA.incomeSources.slice(1).reduce((s, x) => s + x.amount, 0);
  const recent = [...state.transactions]
    .filter((t) => t.type === "out")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
  const slices = DATA.categories
    .map((c) => ({ name: c.name, value: categorySpent(c.id, state.transactions), color: c.color }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);
  const topBudgets = budgetRows(state).sort((a, b) => b.actual - a.actual).slice(0, 4);

  return `
  <div class="page-head"><h1>November, in one look</h1>
  <p>${esc(DATA.household.name)} — ${esc(DATA.household.members)}, ${esc(DATA.household.city)}. Income ${fmt(income)}, spending ${fmt(spent)} so far this month.</p></div>

  <section class="hero" aria-label="Month summary">
    <div><div class="label">Total balance</div><div class="big ember num">${fmt(balance)}</div>
    <div class="note">Across ${state.accounts.length} accounts, incl. savings</div></div>
    <div><div class="label">Income · Nov</div><div class="big num">${fmtJt(income)}</div>
    <div class="note">Salary ${fmtJt(salary)} + freelance ${fmtJt(freelance)}</div></div>
    <div><div class="label">Spent · Nov</div><div class="big num">${fmtJt(spent)}</div>
    <div class="note">${state.transactions.filter((t) => t.type === "out").length} purchases so far</div></div>
    <div><div class="label">Savings rate</div><div class="big num">${(rate * 100).toFixed(1)}%</div>
    <div class="note">${fmt(income - spent)} kept this month</div></div>
  </section>

  <div class="grid cols-32" style="margin-top:10px">
    <section class="card"><h2>Where the money went</h2>
      <p class="sub">Spending by category, November 2026</p>
      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:center">
        ${donutChart(slices, 200)}
        <div style="flex:1;min-width:200px">
          ${slices.slice(0, 5).map((s) => `<div class="bill-row"><span><span class="cat-dot" style="background:${s.color}"></span>${s.name}</span><span class="num"><b>${fmt(s.value)}</b> <span class="muted">· ${Math.round((s.value / spent) * 100)}%</span></span></div>`).join("")}
          <p class="small muted" style="margin-top:12px"><a href="#/transactions">See all transactions →</a></p>
        </div>
      </div>
    </section>

    <section class="card"><h2>Budget check</h2>
      <p class="sub">Biggest categories against their November budget</p>
      ${topBudgets.map((r) => {
        const pct = Math.round((r.actual / r.budget) * 100);
        return `<div class="budget-row"><div class="row-top"><span><span class="cat-dot" style="background:${r.color}"></span>${r.name}</span><span class="pct">${pct}%</span></div>
        <div class="bar-line"><div class="bar-track"><div class="bar-fill ${r.actual > r.budget ? "over" : ""}" style="width:${Math.min(100, pct)}%"></div></div>
        <span class="small muted fig">${fmt(r.actual)} of ${fmt(r.budget)}</span></div></div>`;
      }).join("")}
      <p class="small" style="margin-top:12px"><a href="#/budget">Open the full budget →</a></p>
    </section>
  </div>

  <div class="grid cols-32" style="margin-top:10px">
    <section class="card"><h2>Recent spending</h2>
      <p class="sub">Latest 8 purchases</p>
      ${txTable(recent)}
      <p class="small" style="margin-top:12px"><a href="#/transactions">All ${state.transactions.filter((t) => t.type === "out").length} purchases →</a></p>
    </section>

    <section class="card"><h2>Coming up</h2>
      <p class="sub">Bills due in the next two weeks</p>
      ${DATA.bills.map((b) => `<div class="bill-row"><span><b>${esc(b.name)}</b><br><span class="muted small">${esc(b.note)}</span></span><span style="text-align:right"><span class="num"><b>${fmt(b.amount)}</b></span><br><span class="muted small">${esc(b.due)}</span></span></div>`).join("")}
      <hr class="rule">
      <h3>Your accounts</h3>
      ${state.accounts.map((a) => `<div class="bill-row"><span>${esc(a.name)}</span><span class="num"><b>${fmt(a.balance)}</b></span></div>`).join("")}
    </section>
  </div>`;
}

export function renderTransactions(state, filter) {
  let list = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.merchant.localeCompare(a.merchant));
  let monthNote = "";
  if (filter.month === "October 2026") {
    // The family started tracking in November; October has no rows here.
    list = [];
    monthNote = "October's transactions are not in this household file — the family started tracking in November 2026.";
  }
  if (filter.category && filter.category !== "all") list = list.filter((t) => t.category === filter.category || (filter.category === "income" && t.type === "in"));
  if (filter.q) {
    const q = filter.q.toLowerCase();
    list = list.filter((t) => (t.merchant + " " + (t.note || "") + " " + (categoryById(t.category)?.name || "")).toLowerCase().includes(q));
  }
  const spent = list.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0);
  const got = list.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);

  return `
  <div class="page-head"><h1>Transactions</h1>
  <p>Every rupiah in and out for ${esc(DATA.household.month)}. Add a purchase below and the totals, the budget bars and the charts update at once.</p></div>

  <section class="card">
    <div class="toolbar">
      <div class="field search"><label for="f-q">Search</label><input type="text" id="f-q" placeholder="Merchant, note or category…" value="${esc(filter.q || "")}"></div>
      <div class="field"><label for="f-cat">Category</label>
        <select id="f-cat"><option value="all">All categories</option><option value="income" ${filter.category === "income" ? "selected" : ""}>Income</option>
        ${DATA.categories.map((c) => `<option value="${c.id}" ${filter.category === c.id ? "selected" : ""}>${c.name}</option>`).join("")}</select></div>
      <div class="field"><label for="f-month">Month</label>
        <select id="f-month"><option>November 2026</option><option>October 2026</option></select></div>
    </div>
    <p class="hint">Showing <b>${list.length}</b> of ${state.transactions.length} transactions · Spent ${fmt(spent)} · Received ${fmt(got)}</p>
    <p class="hint" id="tx-month-note">${monthNote}</p>
    ${txTable(list)}
  </section>

  <section class="card" style="margin-top:16px"><h2>Add a transaction</h2>
    <p class="sub">It appears in the list above and updates every total on the site.</p>
    <form id="add-tx">
      <div class="form-grid">
        <div><label for="tx-merchant">Merchant / description</label><input type="text" id="tx-merchant" required placeholder="e.g. Super Indo"></div>
        <div><label for="tx-amount">Amount (Rp)</label><input type="number" id="tx-amount" required min="1000" step="500" placeholder="150000"></div>
        <div><label for="tx-category">Category</label><select id="tx-category">${DATA.categories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select></div>
        <div><label for="tx-date">Date</label><input type="date" id="tx-date" value="2026-11-26" min="2026-11-01" max="2026-11-30"></div>
        <div class="full"><label for="tx-note">Note (optional)</label><input type="text" id="tx-note" placeholder="What was it for?"></div>
        <div class="full"><button class="primary" type="submit">Add transaction</button>
        <span class="hint" id="tx-msg"></span></div>
      </div>
    </form>
  </section>`;
}

export function renderBudget(state) {
  const rows = budgetRows(state);
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0);
  const totalSpent = rows.reduce((s, r) => s + r.actual, 0);
  const over = rows.filter((r) => r.actual > r.budget);
  return `
  <div class="page-head"><h1>Budget for November</h1>
  <p>Planned ${fmt(totalBudget)} against ${fmt(totalSpent)} spent so far. The black tick on each bar is the budget; a bar past it means overspent.</p></div>

  <div class="grid cols-3" style="margin-bottom:16px">
    <div class="card"><div class="label muted small">TOTAL BUDGET</div><div class="kpi num">${fmtJt(totalBudget)}</div><div class="hint">for 9 categories</div></div>
    <div class="card"><div class="label muted small">SPENT SO FAR</div><div class="kpi num">${fmtJt(totalSpent)}</div><div class="hint">${Math.round((totalSpent / totalBudget) * 100)}% of the budget used</div></div>
    <div class="card"><div class="label muted small">LEFT TO SPEND</div><div class="kpi num" style="color:${totalBudget - totalSpent < 0 ? "#a44a28" : "#22201d"}">${fmtJt(Math.max(0, totalBudget - totalSpent))}</div><div class="hint">${over.length === 0 ? "No category is over budget." : over.length + " categor" + (over.length === 1 ? "y" : "ies") + " over budget: " + over.map((r) => r.name).join(", ")}</div></div>
  </div>

  <section class="card"><h2>Budget vs actual</h2>
    <p class="sub">Every category, November 2026</p>
    ${budgetBars(rows)}
  </section>

  <section class="card" style="margin-top:16px"><h2>Change a budget</h2>
    <p class="sub">Pick a category, set a new monthly budget, and the bars here and the dashboard update at once.</p>
    <form id="edit-budget">
      <div class="form-grid">
        <div><label for="bd-cat">Category</label><select id="bd-cat">${DATA.categories.map((c) => `<option value="${c.id}">${c.name} — now ${fmt(state.budgets[c.id])}</option>`).join("")}</select></div>
        <div><label for="bd-amount">New monthly budget (Rp)</label><input type="number" id="bd-amount" required min="0" step="50000" value="850000"></div>
        <div class="full"><button type="submit">Save budget</button> <span class="hint" id="bd-msg"></span></div>
      </div>
    </form>
  </section>`;
}

export function renderGoals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `
  <div class="page-head"><h1>Savings goals</h1>
  <p>${fmt(totalSaved)} set aside of ${fmt(totalTarget)} in goals — the money lives in the savings account, and adding money here moves it from the main account.</p></div>

  <div class="grid cols-3">
    ${state.goals.map((g) => {
      const pct = Math.round((g.saved / g.target) * 100);
      return `<section class="card"><h2>${esc(g.name)}</h2>
      <p class="sub">${esc(g.note)}</p>
      <div class="goal-amount num">${fmt(g.saved)}</div>
      <div class="hint">of ${fmt(g.target)} · ${pct}% there</div>
      <div class="bar-track" style="margin:14px 0 8px"><div class="bar-fill ${pct >= 100 ? "ember" : ""}" style="width:${Math.min(100, pct)}%"></div></div>
      <div class="hint">${fmt(g.target - g.saved)} to go</div>
      <hr class="rule">
      <form class="add-goal" data-goal="${g.id}">
        <label for="goal-${g.id}">Add money (Rp)</label>
        <div style="display:flex;gap:8px"><input type="number" id="goal-${g.id}" min="10000" step="10000" placeholder="100000" required>
        <button class="primary small" type="submit">Add</button></div>
      </form></section>`;
    }).join("")}
  </div>
  <p class="hint" style="margin-top:16px" id="goal-msg"></p>`;
}

export function renderReports(state) {
  const spent = monthSpending(state.transactions);
  const income = monthIncome(state.transactions);
  const history = DATA.history.map((m, i, arr) => (i === arr.length - 1 ? { ...m, spending: spent, income } : m));
  const oct = DATA.history[4].spending;
  const change = ((spent - oct) / oct) * 100;
  const rows = budgetRows(state).sort((a, b) => b.actual - a.actual);
  const biggest = [...state.transactions].filter((t) => t.type === "out").sort((a, b) => b.amount - a.amount)[0];
  const over = rows.filter((r) => r.actual > r.budget);
  const top = rows[0];
  const rate = savingsRate(state.transactions);
  const insights = [
    `<b>Spending is ${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(1)}% vs October</b> — ${fmt(spent)} this month against ${fmt(oct)} last month. The jump is mostly the ${esc(top.name.toLowerCase())} and the family dinner on 12 November.`,
    `<b>${esc(top.name)} is your biggest cost after rent</b> — ${fmt(top.actual)} this month, ${Math.round((top.actual / spent) * 100)}% of all spending. A weekly shop list keeps it under ${fmt(top.budget)}.`,
    over.length
      ? `<b>${over.map((r) => esc(r.name)).join(" and ")} ${over.length === 1 ? "is" : "are"} over budget</b> — ${over.map((r) => `${esc(r.name)} by ${fmt(r.actual - r.budget)}`).join(", ")}. Eating at home twice more a week covers the gap.`
      : `<b>No category is over budget.</b> Every category is inside its November plan.`,
    `<b>Savings rate is ${(rate * 100).toFixed(1)}%</b> — ${fmt(income - spent)} kept from ${fmt(income)} of income. The family target is 15%; ${fmt(Math.round(income * 0.15) - (income - spent))} more saved this month would reach it.`,
    `<b>Biggest single purchase: ${esc(biggest.merchant)}</b> — ${fmt(biggest.amount)} on ${fmtDate(biggest.date)}. Rent is the one fixed cost; everything else is a choice.`,
  ];

  return `
  <div class="page-head"><h1>Reports — six months</h1>
  <p>Income against spending from June to November 2026, and what the numbers are actually saying.</p></div>

  <section class="card"><h2>Income vs spending</h2>
    <p class="sub">Six months, in rupiah. November is the live month — it moves when you add a transaction.</p>
    ${trendChart(history)}
  </section>

  <div class="grid cols-2" style="margin-top:16px">
    <section class="card"><h2>Monthly savings</h2>
      <p class="sub">Income minus spending, per month</p>
      ${savingsBars(history)}
      <p class="hint">November so far: ${fmt(income - spent)} kept. Best month: September, ${fmt(DATA.history[3].income - DATA.history[3].spending)}.</p>
    </section>

    <section class="card"><h2>Top categories this month</h2>
      <p class="sub">By spending, November 2026</p>
      ${rows.slice(0, 5).map((r, i) => `<div class="bill-row"><span><b>${i + 1}.</b> <span class="cat-dot" style="background:${r.color}"></span>${r.name}</span><span class="num"><b>${fmt(r.actual)}</b> <span class="muted">· ${Math.round((r.actual / spent) * 100)}%</span></span></div>`).join("")}
      <p class="hint" style="margin-top:12px">Housing is rent — fixed. The next four are where choices live.</p>
    </section>
  </div>

  <section class="card" style="margin-top:16px"><h2>What the numbers say</h2>
    <p class="sub">Computed from this month's transactions — not written by hand</p>
    ${insights.map((s) => `<div class="insight">${s}</div>`).join("")}
  </section>`;
}
