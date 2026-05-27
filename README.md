# Kivo Time — Franchise Partner Dashboard

A full-featured e-commerce franchise management system built for Bangalore-based franchise partners.

## Tech Stack
- **React 18** + **React Router v6**
- **Vite** (build tool)
- No external UI libraries — custom design throughout
- Fonts: Sora (UI), JetBrains Mono (data/numbers)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Demo Credentials

| Role    | Username             | Password      |
|---------|----------------------|---------------|
| Admin   | `admin`              | `Admin@2024`  |
| Partner | `rajan.bengaluru`    | `Partner@123` |
| Partner | `priya.koramangala`  | `Partner@456` |

> Note: `suresh.malleshwaram` is deactivated and cannot log in.

## Project Structure

```
src/
├── context/
│   └── AuthContext.jsx       # Login state, role, session persistence
├── features/
│   ├── auth/
│   │   └── Login.jsx         # Login screen
│   ├── dashboard/
│   │   ├── PartnerDashboard.jsx  # Partner's order table + investment tab
│   │   ├── OrderFilters.jsx      # Search, date, status filters
│   │   └── OrderRow.jsx          # Table row component
│   ├── investment/
│   │   └── Calculator.jsx        # Return calculator (11% × 18m)
│   └── admin/
│       └── AdminPanel.jsx        # Master view: orders, partners, plans
├── services/
│   ├── mockData.js           # Realistic Indian dummy data
│   └── api.js                # Simulated async API layer
└── components/
    └── ProtectedRoute.jsx    # Role-based route guard
```

## Features

### Partner Dashboard
- View only your own orders
- Search by customer name or mobile number
- Filter by date range and delivery status
- Export orders to CSV
- Summary stats (total, delivered, pending, revenue)
- Investment plans + return calculator

### Admin Panel
- View and filter all orders across all partners
- Update order delivery status inline
- Activate / deactivate partner accounts
- Add new partner accounts
- View investment plans + calculator

## Replacing Mock Data with a Real Backend

All API calls go through `src/services/api.js`. To connect a real backend:
1. Replace each function in `api.js` with actual `fetch`/`axios` calls to your REST endpoints
2. Update `AuthContext.jsx` to store JWT tokens instead of the raw user object
3. Add an `.env` file with your `VITE_API_BASE_URL`

## Deployment

Push to GitHub, then deploy on **Vercel** or **Netlify** (both support Vite out of the box):
```bash
# Vercel
npx vercel

# Netlify: set build command to `npm run build` and publish dir to `dist`
```
