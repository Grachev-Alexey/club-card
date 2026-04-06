# Digital Club Cards App

A full-stack web application for managing digital loyalty club cards, integrated with AmoCRM.

## Architecture

- **Frontend**: React + Vite (TypeScript), served via Express middleware in dev mode
- **Backend**: Express.js (TypeScript), runs on port 5000
- **Database**: PostgreSQL via Drizzle ORM
- **Build**: Vite for frontend, esbuild for server

## Project Structure

```
client/          # React frontend (Vite)
  src/
    pages/       # Page components
    components/  # Reusable UI components
    hooks/       # Custom React hooks
    lib/         # Utilities
server/          # Express backend
  index.ts       # Entry point
  routes.ts      # API routes
  storage.ts     # Database access layer
  vite.ts        # Vite dev middleware setup
  db.ts          # Drizzle DB connection
  services/      # External services (AmoCRM)
shared/          # Shared types and schema
  schema.ts      # Drizzle schema (club_cards, visits, users)
```

## Key Features

- Digital club card management (create, update, lookup by client ID)
- QR code generation for client cards
- AmoCRM webhook integration (auto-creates cards from CRM leads)
- Master PIN-protected visit tracking
- Card status tracking (Active, Expiring Soon, Expired)

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (set as Replit secret)
- `AMO_DOMAIN` — AmoCRM subdomain
- `AMO_ACCESS_TOKEN` — AmoCRM API token
- `CUSTOM_FIELD_ID_CLIENT_ID` — AmoCRM custom field ID for client ID
- `CUSTOM_FIELD_ID_CARD_TYPE` — AmoCRM custom field ID for card type
- `PORT` — Server port (default: 5000)
- `FRONTEND_URL` — Frontend URL for CORS

## Development

```bash
npm run dev      # Start dev server (Express + Vite HMR) on port 5000
npm run build    # Build for production
npm start        # Run production build
```

## Database

Tables: `club_cards`, `visits`, `users`

Schema managed with Drizzle ORM. Use `npm run db:push` to sync schema changes.

## Deployment

- Target: autoscale
- Build: `npm run build`
- Run: `node dist/index.js`
