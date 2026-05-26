# 🚗 Driver Finance Dashboard

A data-driven dashboard built to help ride-hailing drivers (Uber & Bolt) understand their **real profitability** and make better daily decisions.

---

## 💡 Why this project exists

As a TVDE driver, I realized something critical:

> Most drivers track earnings… but don't actually know if they are making money.

This dashboard solves that problem by turning raw daily data into **clear financial insights**.

---

## 🚀 Key Features

### 📊 Weekly Profit Analysis (Real Payout Logic)

- Data grouped by **weekly payout cycle (Monday → Sunday)**
- Reflects how drivers actually get paid
- Helps identify profitable vs unprofitable weeks

---

### 💰 Fixed Cost Control & Break-Even Analysis

- Track all fixed costs: car lease, insurance, IUC, maintenance, washing, food, taxes
- Operator commission (%) configured once — applied automatically to every day
- Fuel tracked per day — summed automatically, no double entry
- Real-time weekly break-even analysis: are you covering your costs this week?
- Smart recommendations: how many more hours or days you need to break even

---

### 🔄 Dual Input System

Supports two real-world workflows:

- **Quick Mode** → total earnings per day
- **Detailed Mode** → ride-by-ride tracking

---

### ⚖️ Uber vs Bolt Comparison

- Understand which platform performs better
- Data-driven decision making

---

### 💸 Automatic Cost Calculation

- Fuel costs tracked per day
- Operator commission applied globally
- Real net profit (not just earnings)

---

### 📈 Smart Insights

- Profitability analysis
- Profit per hour
- Weekly trend with week-over-week delta
- Break-even status with actionable recommendations

---

## 🧠 Key Insight

This project is built around a real constraint:

> Drivers don't think daily — they think weekly (because they get paid weekly).

That's why the dashboard focuses on **weekly analytics instead of daily metrics** — and shows whether fixed costs are being covered each week.

---

## 🛠️ Tech Stack

- TypeScript
- React (Hooks + Context API)
- React Router v6 (client-side routing)
- Chart.js (data visualization)
- CSS (custom UI)
- Demo data preloaded for first-time visitors

---

## 📸 Preview

### Dashboard Overview

![Dashboard Overview](preview.png)

---

## 🚀 Live Demo

👉 https://driver-finance-dashboard.vercel.app

---

## 🎯 What I focused on

- Turning a real-world problem into a digital product
- Building business logic, not just UI
- Creating a usable tool, not just a demo project
- Mobile-first responsive layout with bottom navigation
- No double data entry — fuel and operator costs flow automatically
- Full TypeScript migration with typed interfaces and strict mode

---

## 🔮 Next Steps

- Unit tests (Vitest)
- Backend integration (Firebase)
- Best day / best time detection

---

## 👨‍💻 About Me

Frontend Developer transitioning from Civil Engineering, focused on building **real-world, data-driven applications**.

---
