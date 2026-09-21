# Domain Copilot — UI

React + Vite + MUI front end for the Domain Copilot API.

## Run it

```bash
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:5173
```

The API must allow this origin in CORS (`http://localhost:5173`) and run at `VITE_API_URL`.

```bash
npm run lint
npm run build
```

## Screens

| Route | Screen | Who |
|---|---|---|
| `/login` | Sign in | everyone |
| `/create-org` | Create organisation + first Admin (2 steps) | everyone |
| `/users` | List users, search, filter by role, add user | Admin |
| `/ask` `/documents` `/workflows` `/approvals` `/runs` | Placeholder, not built yet | signed in |

## Structure

```
src/
  config/       app name, roles, statuses, navigation (edit copy and links here)
  api/          fetch client + one file per resource (users.js)
  provider/     AuthProvider + useAuth
  hooks/        useFormFields (values, errors and field props in one call)
  components/   shared UI: Button, TextField, PasswordField, Alert, Badge, RoleBadge,
                StatusBadge, DataTable, PageHeader, EmptyState, RoleSelect, AppShell, ...
  features/     pieces that belong to one screen (users/AddUserDialog, users/UserCell)
  pages/        one file per route
  theme.js      all colours, radii and component defaults (design system colours)
```

Rules we follow: styling lives in `theme.js`; anything used twice becomes a component;
pages only compose components; API paths and field names live in `src/api/`.

## Confirm against the backend (`/openapi.json`)

These are assumptions. Each is in one place.

| Assumption | File |
|---|---|
| `POST /login` takes JSON `{ email, password }`, returns `{ access_token }` | `provider/AuthProvider.jsx` |
| The JWT has `role` (and optionally `name`, `email`) | `provider/AuthProvider.jsx` |
| `POST /onboard` takes `tenant_name`, `admin_name`, `admin_email`, `admin_password` | `pages/CreateOrgPage.jsx` |
| `GET /users` returns a list, `POST /users` takes `full_name`, `email`, `password`, `role` | `api/users.js` |
| Role values are `admin`, `lead_instructor`, `instructor` (spacing and case are normalised) | `config/roles.js` |
| Role descriptions match what the server enforces | `config/roles.js` |

## Security notes

- Hiding a link or a page by role is a courtesy. The API must enforce the same rules.
- The token is kept in `localStorage`. That is simple but readable by any script on the page,
  which is why model output is only ever rendered as text (never `dangerouslySetInnerHTML`).
  Record this trade-off in `docs/SECURITY.md`.
- Never commit `.env`. Only `.env.example` is tracked.
