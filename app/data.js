// data.js — every number the site shows lives here and nowhere else.
// Keluarga Wijaya, a family of four in Jakarta, keeping their budget for
// November 2026. All views read from this one object, so the dashboard,
// the budget bars, the charts and the reports can never disagree.

export const DATA = {
  household: {
    name: "Keluarga Wijaya",
    members: "Ayah, Ibu, Dimas (12) & Sinta (9)",
    city: "Jakarta",
    month: "November 2026",
    monthShort: "Nov 2026",
    currency: "Rp",
  },

  // Money coming in this month. Salary lands on the 1st, freelance in two parts.
  incomeSources: [
    { source: "Ayah's salary — PT Nusantara Digital", amount: 8000000, day: 1 },
    { source: "Ibu's freelance — Toko Kopi Senja design", amount: 2250000, day: 5 },
    { source: "Ibu's freelance — Studio Kala illustration", amount: 2250000, day: 18 },
  ],

  // Where the money sits. The savings account holds exactly the three goal
  // pots below (4,250,000 + 1,400,000 + 1,200,000 = 6,850,000).
  accounts: [
    { name: "Main account — BCA", balance: 10225950 },
    { name: "Savings account — BCA", balance: 6850000 },
    { name: "Cash at home", balance: 1360000 },
    { name: "GoPay wallet", balance: 1000000 },
  ],

  // Budget per category for November. Colours stay warm monochrome; only
  // Dining Out takes the Ember accent, as the month's hero category.
  categories: [
    { id: "groceries", name: "Groceries", budget: 2900000, color: "#8a7f72" },
    { id: "dining", name: "Dining Out", budget: 850000, color: "#ff692d" },
    { id: "transport", name: "Transport", budget: 1350000, color: "#6b655e" },
    { id: "housing", name: "Housing", budget: 3500000, color: "#4a453f" },
    { id: "utilities", name: "Utilities", budget: 850000, color: "#a89e90" },
    { id: "kids", name: "Kids & School", budget: 1050000, color: "#7d7468" },
    { id: "health", name: "Health", budget: 450000, color: "#b3a89a" },
    { id: "entertainment", name: "Entertainment", budget: 550000, color: "#5c564e" },
    { id: "shopping", name: "Shopping", budget: 600000, color: "#96897a" },
  ],

  // Every transaction of November 2026, newest last. "type" is "in" for money
  // coming in and "out" for spending. Category actuals are computed from
  // this list, never typed twice.
  transactions: [
    { date: "2026-11-01", merchant: "PT Nusantara Digital", category: "income", type: "in", amount: 8000000, note: "Ayah's November salary" },
    { date: "2026-11-01", merchant: "House rent — November", category: "housing", type: "out", amount: 3500000, note: "Monthly rent, paid by transfer" },
    { date: "2026-11-01", merchant: "Pertamina", category: "transport", type: "out", amount: 250000, note: "Full tank, Pertalite" },
    { date: "2026-11-02", merchant: "Super Indo", category: "groceries", type: "out", amount: 486500, note: "Weekly shop: rice, chicken, vegetables" },
    { date: "2026-11-02", merchant: "School lunch money — Dimas", category: "kids", type: "out", amount: 300000, note: "Two weeks of lunch money" },
    { date: "2026-11-03", merchant: "GoFood — Warung Padang Sederhana", category: "dining", type: "out", amount: 86000, note: "Lunch for the family" },
    { date: "2026-11-03", merchant: "PLN electricity", category: "utilities", type: "out", amount: 412000, note: "October usage, paid via m-banking" },
    { date: "2026-11-04", merchant: "GrabBike", category: "transport", type: "out", amount: 28000, note: "Ayah to the office, rainy morning" },
    { date: "2026-11-04", merchant: "Apotek Kimia Farma", category: "health", type: "out", amount: 168000, note: "Vitamins and fever medicine" },
    { date: "2026-11-05", merchant: "Toko Kopi Senja", category: "income", type: "in", amount: 2250000, note: "Ibu's freelance: cafe menu design" },
    { date: "2026-11-05", merchant: "PDAM water", category: "utilities", type: "out", amount: 128500, note: "Monthly water bill" },
    { date: "2026-11-06", merchant: "Transmart Carrefour", category: "groceries", type: "out", amount: 612000, note: "Monthly stock-up: oil, milk, detergent" },
    { date: "2026-11-06", merchant: "Gramedia", category: "kids", type: "out", amount: 186500, note: "Books and stationery for Sinta" },
    { date: "2026-11-07", merchant: "KFC drive-thru", category: "dining", type: "out", amount: 124500, note: "Saturday treat for the kids" },
    { date: "2026-11-08", merchant: "Pertamina", category: "transport", type: "out", amount: 250000, note: "Full tank, Pertalite" },
    { date: "2026-11-08", merchant: "Netflix", category: "entertainment", type: "out", amount: 186000, note: "Premium plan, monthly" },
    { date: "2026-11-09", merchant: "IndiHome internet", category: "utilities", type: "out", amount: 271000, note: "50 Mbps home internet" },
    { date: "2026-11-10", merchant: "KRL Commuterline top-up", category: "transport", type: "out", amount: 150000, note: "Monthly train card top-up" },
    { date: "2026-11-10", merchant: "Tokopedia — school shoes", category: "shopping", type: "out", amount: 289000, note: "New school shoes for Dimas" },
    { date: "2026-11-11", merchant: "Pasar Tradisional Minggu", category: "groceries", type: "out", amount: 245000, note: "Fresh fish, fruit and spices" },
    { date: "2026-11-12", merchant: "Pizza Hut", category: "dining", type: "out", amount: 268000, note: "Family dinner, Dimas's good report card" },
    { date: "2026-11-13", merchant: "Les Matematika — Sinta", category: "kids", type: "out", amount: 350000, note: "Monthly maths tutoring" },
    { date: "2026-11-14", merchant: "GrabCar", category: "transport", type: "out", amount: 186000, note: "Airport run for Ayah's work trip" },
    { date: "2026-11-14", merchant: "CGV cinema", category: "entertainment", type: "out", amount: 245000, note: "Family movie night, 4 tickets" },
    { date: "2026-11-15", merchant: "Super Indo", category: "groceries", type: "out", amount: 528750, note: "Weekly shop, incl. Dimas's birthday cake" },
    { date: "2026-11-16", merchant: "Dokter gigi — Sinta", category: "health", type: "out", amount: 257000, note: "Check-up and filling" },
    { date: "2026-11-17", merchant: "GoFood — Soto Betawi H. Ma'ruf", category: "dining", type: "out", amount: 94000, note: "Dinner when Ibu was out" },
    { date: "2026-11-18", merchant: "Studio Kala", category: "income", type: "in", amount: 2250000, note: "Ibu's freelance: book illustration" },
    { date: "2026-11-18", merchant: "School lunch money — Sinta", category: "kids", type: "out", amount: 148500, note: "One week of lunch money" },
    { date: "2026-11-19", merchant: "Pertamina", category: "transport", type: "out", amount: 250000, note: "Full tank, Pertalite" },
    { date: "2026-11-19", merchant: "Uniqlo", category: "shopping", type: "out", amount: 253000, note: "Blouse for Ibu" },
    { date: "2026-11-20", merchant: "Sayurbox delivery", category: "groceries", type: "out", amount: 312400, note: "Vegetables and eggs, delivered" },
    { date: "2026-11-21", merchant: "Starbucks", category: "dining", type: "out", amount: 132000, note: "Coffee with Ibu's client" },
    { date: "2026-11-22", merchant: "Spotify Family", category: "entertainment", type: "out", amount: 99000, note: "Monthly family plan" },
    { date: "2026-11-23", merchant: "Tol JORR", category: "transport", type: "out", amount: 66000, note: "Toll to visit Grandma in Bekasi" },
    { date: "2026-11-24", merchant: "Transmart Carrefour", category: "groceries", type: "out", amount: 358900, note: "Weekly shop before the long weekend" },
    { date: "2026-11-24", merchant: "Toys Kingdom", category: "entertainment", type: "out", amount: 85000, note: "Board game for family night" },
    { date: "2026-11-25", merchant: "Ayam Geprek Bensu", category: "dining", type: "out", amount: 207500, note: "Takeaway dinner for four" },
  ],

  // Savings goals. The saved amounts add up to the savings account balance.
  goals: [
    { id: "emergency", name: "Emergency fund", target: 15000000, saved: 4250000, note: "Six months of essentials, for rainy days" },
    { id: "holiday", name: "Holiday in Bandung", target: 8000000, saved: 1400000, note: "Family trip in the June school holiday" },
    { id: "motorcycle", name: "New motorcycle", target: 12000000, saved: 1200000, note: "Replace the old Beat before it gives up" },
  ],

  // Six months of income and spending, for the trend chart. November's
  // spending is the sum of this month's transactions above.
  history: [
    { month: "Jun 2026", income: 12500000, spending: 10980000 },
    { month: "Jul 2026", income: 12500000, spending: 11240000 },
    { month: "Aug 2026", income: 13100000, spending: 11050000 },
    { month: "Sep 2026", income: 12500000, spending: 10640000 },
    { month: "Oct 2026", income: 12500000, spending: 11320000 },
    { month: "Nov 2026", income: 12500000, spending: 11514050 },
  ],

  // Bills coming up, with the date they fall due.
  bills: [
    { name: "House rent — December", due: "1 Dec 2026", amount: 3500000, note: "Auto-debit from BCA" },
    { name: "PLN electricity", due: "5 Dec 2026", amount: 420000, note: "Estimate, based on last month" },
    { name: "IndiHome internet", due: "9 Dec 2026", amount: 271000, note: "Auto-debit" },
    { name: "School fees (SPP) — Dimas & Sinta", due: "10 Dec 2026", amount: 850000, note: "Pay at the school office" },
    { name: "BPJS Kesehatan", due: "15 Dec 2026", amount: 175000, note: "Family of four" },
  ],
};

// ---- Derived figures: every view calls these, nothing re-types a number. ----

export function totalBalance(accounts = DATA.accounts) {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}

export function monthIncome(txs = DATA.transactions) {
  return txs
    .filter((t) => t.type === "in")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function monthSpending(txs = DATA.transactions) {
  return txs
    .filter((t) => t.type === "out")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function savingsRate(txs = DATA.transactions) {
  const income = monthIncome(txs);
  return income === 0 ? 0 : (income - monthSpending(txs)) / income;
}

export function categorySpent(id, txs = DATA.transactions) {
  return txs
    .filter((t) => t.type === "out" && t.category === id)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function categoryById(id) {
  return DATA.categories.find((c) => c.id === id);
}

// Full rupiah: Rp 12.500.000. Short: Rp 2,54 jt (one decimal when it fits).
export function fmt(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function fmtJt(n) {
  const jt = n / 1000000;
  const text = jt >= 10 ? jt.toFixed(1) : jt.toFixed(2);
  return "Rp " + text.replace(/\.?0+$/, "") + " jt";
}

export function fmtDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return d + " " + names[m - 1] + " " + y;
}
