# Experiment (React)

Vite + React + TypeScript SPA for the learning API.

## Quick start

```bash
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:3000`. Start the Nest API first.

- App: `http://localhost:5173`
- API base: `http://localhost:3000/api/v1`
- Seed login: `superadmin` / `super/1234`

## Config

Copy `.env.example` to `.env` only if you need to override the API origin. Leave `VITE_API_BASE_URL` empty in local dev so requests stay on the Vite proxy.

Architecture notes live in the parent experiment workspace: `docs/architecture-decisions-react.md`.

## Icons

Use `@mui/icons-material`. Import each icon from its own path, for example `@mui/icons-material/ArrowUpward`. Do not import the `@mui/icons-material` barrel, and do not load the Material Icons font from a CDN.

A custom SVG later wraps MUI `SvgIcon` with a 24×24 view box and `currentColor`.
