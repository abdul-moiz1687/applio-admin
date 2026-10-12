# APPLIO Admin

Administrator console for APPLIO (digital appliance passports and lifecycle management). It connects to the existing
deployed backend and does not contain a backend, a database, or the customer app.

- Stack: React 18, Vite 6, React Router 6, Axios, GSAP 3, Lucide React, custom CSS. JavaScript/JSX only.
- Local development port: **5174** (the customer app uses 5173).

## Status

- `npm run lint` (zero warnings) and `npm run build` pass.
- Runtime behaviour against the live backend has **not** been verified in this development environment, because the
  sandbox could not reach the backend host. See `API-VERIFICATION.md`.

## Pages

| Route | Page | Data source |
| --- | --- | --- |
| `/login` | Administrator sign-in | `POST /auth/login` |
| `/dashboard` | Overview: user, appliance, and service counts; recent registrations | `GET /admin/users`, `GET /admin/appliances`, `GET /admin/services` |
| `/users` | Users: search, role filter, details, delete with confirmation | `GET /admin/users`, `DELETE /admin/users/:id` |
| `/appliances` | Appliances: search, brand filter, details, public passport QR | `GET /admin/appliances`, `GET /appliances/:id`, `GET /appliances/:id/qr` |
| `/services` | Service records across all appliances: search, appliance filter | `GET /admin/services`, `GET /admin/appliances` (for names) |

Unknown routes show a not-found page. There is no public registration page. Every nav item leads to one of these routes.

## Setup

Requires Node.js 18 or newer.

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5174/login
```

`.env` contains only public configuration:

```env
VITE_API_URL=https://applio-lifecyle-backend.vercel.app/api
```

Note the backend host spelling: `applio-lifecyle-backend` (no second "c"). The app refuses to start without `VITE_API_URL`.
Endpoint paths in the code do not include `/api`, because the base URL already ends in it.

Other commands:

```bash
npm run lint
npm run build        # outputs dist/
npm run preview      # serves dist/ on port 5174
```

## Authentication and authorization

- Signs in with `POST /auth/login`. The token and user come from the backend; nothing is generated or hardcoded in the frontend.
- The session is stored under `applioAdminToken` and `applioAdminUser`.
- Login is refused, and no session is stored, unless the returned `user.role` is exactly `admin`.
- Protected requests send `Authorization: Bearer <token>`.
- HTTP 401 clears the session and redirects to login with a message. HTTP 403 shows a permission error. Network failures are reported separately.
- The frontend role check improves the experience only. The backend's admin middleware is the real authorization.
- Logout clears the Admin session only.

## Design and motion

- Dark palette from the APPLIO identity (`#0b0d0c` background, `#c8ff3d` accent), defined as CSS variables in `src/index.css`.
- Sidebar: grouped navigation, a refined active indicator, a collapsible desktop mode (remembered in localStorage), and a
  mobile drawer. The footer shows the signed-in administrator with a sign-out control.
- Buttons share one component (`src/components/Button`) with hover, focus, pressed, disabled, and loading states. Loading
  buttons are disabled, which prevents duplicate submissions.
- Destructive actions open a confirmation dialog. Dialogs trap focus, close on Escape, and restore focus on close.
- Success and error feedback after API operations appears as toasts.

### GSAP motion

All animation is in `src/motion/`:

- `useReveal`: a one-time staggered entrance when a page's real data first arrives. It does not replay on later updates.
- `useCountUp`: counts KPI values up from their previous displayed value to the exact value returned by the API.
- Modal enter animation and a short fade when the route changes.
- Every animation is skipped under `prefers-reduced-motion`, and content is never hidden while waiting for an animation.
- GSAP is loaded only by the signed-in area, not by the login screen.

## Data handling

- Lists are paginated **client-side** (10 rows per page). The documented API has no server pagination.
- Costs are shown as plain numbers. No currency is assumed, and missing values display as "—".
- Service records are read from the global `GET /admin/services` endpoint. Appliance names are resolved from the appliance list.
- Appliances and service records are read-only. Create, edit, and delete are not implemented because those routes are not documented.

## API layer

- `src/services/api.js`: Axios client, token injection, error mapping, and the `endpoints` registry.
- `src/services/normalize.js`: converts response records into the UI's shape.
- `src/services/resources.js`: resource functions used by the pages.

Change an endpoint or response key in one of these files, not in components.

## Deployment (Vercel)

1. Push this folder to its own GitHub repository. It must not be nested inside the customer app repository.
2. In Vercel, import the repository. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Set `VITE_API_URL` to `https://applio-lifecyle-backend.vercel.app/api` for Production and Preview.
4. `vercel.json` rewrites all paths to `index.html`, so refreshing a nested route does not return 404.
5. **Before the Admin domain can call the API**, the backend must allow that exact origin in its CORS configuration,
   alongside the customer origin and `http://localhost:5174`. Do not use wildcard CORS.

The app sends `noindex, nofollow` meta tags because it is not a public website.

## Security notes

- No secrets, JWT signing keys, MongoDB credentials, or Cloudinary secrets belong in this project. Anything prefixed
  `VITE_` is shipped to the browser.
- `.env` and `dist/` are git-ignored.
