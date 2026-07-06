# ClarioNex ERP — Enterprise Intelligence Dashboard

A React + Vite + Tailwind frontend for the ClarioNex ERP "Enterprise Intelligence
Center" dashboard, with sign up and login pages in front of it.

## File structure

```
clarionex-erp/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── main.jsx              # App entry point, wraps App in Router + AuthProvider
    ├── App.jsx               # Routes: /login, /signup, /dashboard
    ├── index.css             # Tailwind directives + global styles
    ├── context/
    │   └── AuthContext.jsx   # Mock auth (localStorage-based sign up / login)
    ├── data/
    │   └── mockData.js        # Sample data for stats, chart, alerts, etc.
    ├── pages/
    │   ├── Login.jsx
    │   ├── Signup.jsx
    │   └── Dashboard.jsx      # Assembles the dashboard layout
    └── components/
        ├── Sidebar.jsx
        ├── Topbar.jsx
        ├── StatCard.jsx
        ├── RevenueChart.jsx
        ├── AlertsPanel.jsx
        ├── AIAssistant.jsx
        ├── EmployeeDistribution.jsx
        ├── InventoryStatus.jsx
        └── ActiveLogistics.jsx
```

## Getting started in VS Code

1. **Open the folder** `clarionex-erp` in VS Code.
2. **Install dependencies** (requires Node.js 18+):

   ```bash
   npm install
   ```

3. **Run the dev server**:

   ```bash
   npm run dev
   ```

4. Open the printed local URL (usually `http://localhost:5173`) in your
   browser. You'll land on the **Login** page.

## How auth works (demo only)

There's no backend yet, so authentication is simulated with `localStorage`:

- **Sign up** (`/signup`) creates an account record in `localStorage`
  (`clarionex_erp_users`) and logs you straight in.
- **Login** (`/login`) checks the email/password against those stored
  accounts.
- A session is stored under `clarionex_erp_session`. While a session exists,
  visiting `/login` or `/signup` redirects you to `/dashboard`, and
  visiting `/dashboard` without a session redirects you to `/login`.
- Click the logout icon next to your name in the sidebar to end the session.

To connect this to a real backend later, replace the `signup`, `login`, and
`logout` functions in `src/context/AuthContext.jsx` with calls to your API
(e.g. `fetch('/api/auth/login', ...)`), and store a token instead of the
plain user object.

## Customizing the dashboard

- **Colors / theme tokens**: `tailwind.config.js` (`base`, `panel`, `accent`,
  `cyan`, `good`, `warn`, `danger`, `violet`, etc.)
- **Dashboard data**: `src/data/mockData.js` — stats, revenue trend, alerts,
  employee distribution, inventory status, AI assistant messages.
- **Navigation items**: `src/components/Sidebar.jsx`.
- **Layout**: `src/pages/Dashboard.jsx` controls the grid arrangement of all
  widgets.

## Building for production

```bash
npm run build
```

This outputs a static build to `dist/`, which you can deploy to any static
host (Netlify, Vercel, S3 + CloudFront, etc.).
