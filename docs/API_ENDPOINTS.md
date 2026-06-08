# API Endpoints Documentation

Analyzed repository API structure and client connections. All endpoints connect seamlessly via `services/api-client.ts` (centralized fetch to `/api/*` with auth) and services like `jobs-service.ts`, `auth-service.ts`.

## Key Endpoints by Feature

### Dashboard / Jobs (`/api/jobs*`)
- `GET /api/jobs?customerId=...&technicianId=...&status=...` - List jobs (used in customer/technician dashboards)
- `POST /api/jobs` - Create job
- `GET /api/jobs/[id]`
- `POST /api/jobs/[id]/accept` - Accept job
- `POST /api/jobs/[id]/start|complete|messages|bids|sos`

**Client Usage**: `jobsService.getJobs({customer_id: user.id})` in `app/(dashboard)/customer/page.tsx` & technician page.

### Auth / Users (`/api/auth*`, `/api/user*`)
- `POST /api/auth/login|register|magic-login|magic-signup`
- `GET /api/auth/me`
- `POST /api/auth/logout|verify-magic`
- `POST /api/user/phone`
- `GET/POST /api/profile`, `/api/profile/password`

**Client Usage**: `authService.login('/auth/login')`, managed in `useUserStore`.

### Technician (`/api/technician*`)
- `GET/POST /api/technician/profile|setup`

### Customer (via jobs/profile above)

### CMMS / IoT / Assets
- `GET/POST /api/sensor-data`
- `POST /api/iot/ingest`
- `GET /api/digital-twins/[id]`
- `GET/POST /api/assets|inventory`
- `GET/POST /api/predictive-maintenance|preventive-maintenance|work-orders`

**Client Usage**: Props in `components/cmms/digital-twin.tsx` (sensorData from parent API calls).

### Other
- **AI**: `/api/ai/chat`, `/api/ai/suggest-budget`
- **Stripe**: `/api/stripe/*`
- **Integrations**:
  - `GET /api/integrations` — fetch verified phone and integrations list
  - `POST /api/integrations` — sync a single platform or sync all platforms
  - `POST /api/integrations/disconnect/[platform]` — disconnect a linked platform
  - `GET /api/integrations/status` — get a status summary
- **Analytics/Alerts**: `/api/analytics/*`, `/api/alerts`
- **Webhooks**: `/api/webhooks/stripe|supabase`

## Connection Verification
- **Seamless**: Frontend (dashboards/pages) → services → apiClient → backend routes.
- **Auth**: Bearer token auto-added; backend uses `getUserFromSession`.
- **Data Flow**: Jobs fetched by role (customer/technician filters), displayed in JobCard/StatsCard.
- **Stores**: Zustand `useJobsStore`/`useUserStore` syncs state post-API.
- **TODOs**: Fetch ratings dynamically (e.g., `/api/profile/ratings`); implement all subroutes consistently.

## Testing
```bash
npm run dev
curl -H \"Authorization: Bearer <token>\" \"http://localhost:3000/api/jobs?customerId=1\"
```

Full ~40 endpoints listed via `app/api/` tree. Architecture solid for CMMS dashboard app.

