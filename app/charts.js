// charts.js — hand-rolled inline SVG charts. No library, no network:
// every chart is drawn from the numbers in data.js by plain arithmetic.

import { fmt, fmtJt } from "./data.js";

// Donut of spending by category. Returns an SVG string, 220 x 220.
export function donutChart(slices, size = 220) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - 14, thick = 30;
  const inner = r - thick / 2;
  let angle = -Math.PI / 2;
  let paths = "";
  for (const s of slices) {
    if (s.value <= 0) continue;
    const frac = s.value / total;
    const a0 = angle, a1 = angle + frac * Math.PI * 2;
    angle = a1;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + inner * Math.cos(a0), y0 = cy + inner * Math.sin(a0);
    const x1 = cx + inner * Math.cos(a1), y1 = cy + inner * Math.sin(a1);
    paths += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${inner} ${inner} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${s.color}" stroke-width="${thick}" />`;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by category donut chart">`
    + paths
    + `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.round(size * 0.11)}" fill="#22201d">${fmtJt(total)}</text>`
    + `<text x="${cx}" y="${cy + 16}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11" fill="#777573">spent in November</text>`
    + `</svg>`;
}

// Horizontal bars: budget vs actual for each category, one row each.
export function budgetBars(rows) {
  const max = Math.max(...rows.map((r) => Math.max(r.budget, r.actual)), 1);
  return rows.map((r) => {
    const pct = Math.round((r.actual / r.budget) * 100);
    const over = r.actual > r.budget;
    const width = Math.min(100, (r.actual / max) * 100);
    const budgetWidth = (r.budget / max) * 100;
    return `<div class="budget-row">
      <div class="row-top"><span><span class="cat-dot" style="background:${r.color}"></span><b>${r.name}</b></span>
      <span class="num">${fmt(r.actual)} <span class="muted">of ${fmt(r.budget)}</span></span></div>
      <div style="position:relative;margin-top:8px">
        <div class="bar-track" style="position:relative">
          <div class="bar-fill" style="width:${width}%;background:${r.color}"></div>
          <div style="position:absolute;top:-3px;left:${budgetWidth}%;width:2px;height:14px;background:#22201d"></div>
        </div>
      </div>
      <div style="margin-top:6px"><span class="pct">${pct}% of budget</span>
      ${over ? `<span class="over-tag"> · ${fmt(r.actual - r.budget)} over budget</span>` : `<span class="under-tag"> · ${fmt(r.budget - r.actual)} left</span>`}</div>
    </div>`;
  }).join("");
}

// Line chart of income vs spending over six months, with dots and labels.
export function trendChart(months) {
  const w = 640, h = 260, padL = 56, padR = 16, padT = 18, padB = 34;
  const max = Math.max(...months.map((m) => Math.max(m.income, m.spending))) * 1.08;
  const x = (i) => padL + (i * (w - padL - padR)) / (months.length - 1);
  const y = (v) => padT + (1 - v / max) * (h - padT - padB);
  const line = (key) => months.map((m, i) => (i === 0 ? "M" : "L") + " " + x(i).toFixed(1) + " " + y(m[key]).toFixed(1)).join(" ");
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const gy = padT + (1 - f) * (h - padT - padB);
    return `<line x1="${padL}" y1="${gy}" x2="${w - padR}" y2="${gy}" stroke="#dcd9d6" stroke-width="1" />`
      + `<text x="${padL - 8}" y="${gy + 4}" text-anchor="end" font-size="11" fill="#777573">${fmtJt(max * f)}</text>`;
  }).join("");
  const labels = months.map((m, i) => {
    const anchor = i === 0 ? "start" : i === months.length - 1 ? "end" : "middle";
    return `<text x="${x(i)}" y="${h - 10}" text-anchor="${anchor}" font-size="12" fill="#777573">${m.month}</text>`;
  }).join("");
  const dots = (key, color) => months.map((m, i) =>
    `<circle cx="${x(i)}" cy="${y(m[key])}" r="4" fill="${color}" />`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Six month income and spending trend">
    ${grid}
    <path d="${line("income")}" fill="none" stroke="#22201d" stroke-width="2.5" />
    <path d="${line("spending")}" fill="none" stroke="#ff692d" stroke-width="2.5" />
    ${dots("income", "#22201d")}${dots("spending", "#ff692d")}
    ${labels}
  </svg>
  <div class="legend"><span><span class="cat-dot" style="background:#22201d"></span>Income</span>
  <span><span class="cat-dot" style="background:#ff692d"></span>Spending</span></div>`;
}

// Simple vertical bars for monthly savings (income minus spending).
export function savingsBars(months) {
  const w = 640, h = 180, padB = 30, padT = 24;
  const values = months.map((m) => m.income - m.spending);
  const max = Math.max(...values) * 1.15;
  const bw = (w - 40) / months.length;
  const bars = values.map((v, i) => {
    const bh = (v / max) * (h - padT - padB);
    const bx = 20 + i * bw + bw * 0.2;
    return `<rect x="${bx.toFixed(1)}" y="${(h - padB - bh).toFixed(1)}" width="${(bw * 0.6).toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${i === months.length - 1 ? "#ff692d" : "#8a7f72"}" />`
      + `<text x="${(bx + bw * 0.3).toFixed(1)}" y="${(h - padB - bh - 6).toFixed(1)}" text-anchor="middle" font-size="11" fill="#22201d">${fmtJt(v)}</text>`
      + `<text x="${(bx + bw * 0.3).toFixed(1)}" y="${h - 10}" text-anchor="middle" font-size="11" fill="#777573">${months[i].month.split(" ")[0]}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Monthly savings bar chart">${bars}</svg>`;
}
