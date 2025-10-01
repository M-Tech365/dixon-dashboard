# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dixon Priority Dashboard is a Next.js application that displays prioritized sales orders from Microsoft Business Central. It's designed for service technicians and deployed on Raspberry Pi displays in kiosk mode.

## Development Commands

```bash
npm run dev     # Start development server at http://localhost:3000
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

The app automatically redirects from `/` to `/dashboard`.

## Architecture

### Data Flow

1. **Business Central Integration** (`lib/business-central.ts`)
   - Authenticates via OAuth2 client credentials flow
   - Fetches sales orders from BC OData V4 API: `Sales_Order_VT` entity
   - Implements token caching (5-minute buffer before expiry)
   - Server-side filtering: Only DIXON location orders via `$filter=LocationCode eq 'DIXON'`
   - Transforms BC data structure to simplified app format
   - Filters out P1 priority orders at API level

2. **API Routes** (`app/api/`)
   - `/api/sales-orders` - Main endpoint, falls back to mock data if BC not configured
   - `/api/warm-cache` - Keep-alive endpoint for Vercel cron (runs every 5 minutes)

3. **Dashboard Page** (`app/dashboard/page.tsx`)
   - Client-side state management with React hooks
   - Auto-refresh every 5 minutes (configurable via `NEXT_PUBLIC_REFRESH_INTERVAL`)
   - Client-side priority filtering (P2, P3, P4 checkboxes)
   - Manual refresh button

4. **Component Structure** (`components/`)
   - `dashboard-header` - Logo, title, last refresh timestamp
   - `priority-filter` - Checkbox filters (P2/P3/P4) + refresh button
   - `order-card` - Individual order display with priority badge
   - `priority-badge` - Color-coded priority indicators

### Type Definitions (`types/sales-order.ts`)

- `BCSalesOrder` - Raw Business Central API response structure
- `SalesOrder` - Simplified app format with transformed fields
- `DashboardFilters` - Filter state interface

### Environment Variables

Required for Business Central integration:
- `BC_TENANT_ID` - Azure AD tenant ID
- `BC_CLIENT_ID` - App registration client ID
- `BC_CLIENT_SECRET` - App registration secret
- `BC_ENVIRONMENT` - BC environment name (default: `BC_Sandbox`)
- `BC_COMPANY_ID` - Company name (default: `CFI Tire`)
- `BC_BASE_URL` - API base URL (default: `https://api.businesscentral.dynamics.com/v2.0`)
- `BC_SCOPE` - OAuth scope (default: `https://api.businesscentral.dynamics.com/.default`)

Optional:
- `NEXT_PUBLIC_REFRESH_INTERVAL` - Auto-refresh interval in ms (default: 300000 = 5 min)

### Deployment Notes

- Vercel serverless functions: `/api/sales-orders` has 30s max duration
- Vercel cron runs `/api/warm-cache` every 5 minutes to prevent cold starts
- Raspberry Pi kiosk mode: Uses Chromium in full-screen with auto-start on boot
- Root page redirects to `/dashboard` automatically

### Business Logic

- **Priority Mapping**: BC priorities "1", "2", "3", "4" → "P1", "P2", "P3", "P4"
- **Display Filter**: Only shows P2-P4 (P1 filtered server-side)
- **Location Filter**: Only DIXON location (filtered in BC API query)
- **Date Fields**: Uses `OrderDate` or falls back to `DocumentDate`
- **Sorting**: Orders sorted by creation date (oldest first)

### Naming Convention

Component files use kebab-case (e.g., `priority-filter.tsx`, `dashboard-header.tsx`). Keep each `page.tsx` minimal by extracting logic into reusable components.
