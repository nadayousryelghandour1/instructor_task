# Domain Copilot — UI

React + Vite + MUI front end for the Domain Copilot API.

## Run it

```bash
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:5173
```

The API must run at `VITE_API_URL` and allow this origin in CORS (`CORS_ORIGINS`).

```bash
npm run lint
npm run build
```

## Screens and the routes they use

| Route | Screen | Backend |
|---|---|---|
| `/login`, `/create-org` | Sign in, create organisation + first Admin | `POST /login`, `POST /onboard` |
| `/ask` | Ask, answers with sources | `POST /chat` `{ question, history }` |
| `/documents` | Upload, status, chunks, filters | `GET /tenantdocs`, `POST /upload`, `GET /documents/{id}/chunks` |
| `/workflows` | Start a run and see what it produced | `POST /workflow/runs` `{ learning_goal }` |
| `/approvals` | Review generated items: approve, reject, edit and approve | `GET /workflow/items/pending`, `POST /workflow/items/{id}/review` |
| `/runs`, `/runs/:runId` | Open a run's trace (steps and items) | `GET /workflow/runs/{run_id}` |
| `/users` (Admin) | List and add users | `GET /tenantusers/{tenant_id}`, `POST /signup` |

## Structure

```
src/
  api/          ALL backend calls live here (client.js + one file per resource)
  config/       app name, roles, statuses, navigation, limits (edit copy and limits here)
  hooks/        useDocuments, useRun (load + poll), useFormFields
  provider/     AuthProvider + useAuth
  components/   shared UI: Button, TextField, Alert, Badge, StatusBadge, DataTable, FileDropzone, JsonDetails, ...
  features/     pieces that belong to one screen (users/, documents/, approvals/, runs/)
  pages/        one file per route, no fetch() or endpoint paths inside
  theme.js      colours, radii and component defaults
```

Rules: pages never build URLs or parse responses (they call `src/api/*`); styling lives in `theme.js`;
anything used twice becomes a component or a hook.

## Backend contract in one place

Each file in `src/api/` starts with a comment listing the routes and fields it relies on.
If the backend changes, fix that one file. Fields marked ⚠️ are tolerant guesses: check `/openapi.json`.

## Backend gaps found while wiring

1. **Files are served from `/uploads/{id}_{filename}` with no login check.** Anyone who guesses the URL can open another organisation's file. Serve them through an authenticated endpoint that checks the tenant.
2. **No "list runs" route.** The Runs screen can only open a run by id, plus the runs started in this browser. Add `GET /workflow/runs` (tenant from the token).
3. **`POST /workflow/runs` answers only when the whole pipeline is done.** Long runs risk timeouts. A background job that returns the run id at once would let the UI show live progress.
4. **`POST /signup` receives `tenant_id` from the client.** The server must ignore it and use the tenant from the caller's token, and restrict the route to Admins.
5. **`GET /tenantusers/{tenant_id}`** must compare `tenant_id` with the token (403 otherwise).
6. **No cost or token data in run responses**, so the Runs screen cannot show them yet.

## Security notes

- Hiding a link or page by role is a courtesy. The API must enforce the same rules (for example `403` on review).
- The token is kept in `localStorage`, which any script on the page can read. Model output and document text are therefore only ever rendered as text, never as HTML.
- Never commit `.env`. Only `.env.example` is tracked.
