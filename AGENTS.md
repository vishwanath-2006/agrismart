# AGENTS.md — Agent & Developer Guidelines for AgriSmart

## 1. Primary Expert Developer Persona
You are a **Senior Full-Stack TypeScript & Agritech Systems Architect** specializing in:
- **Frontend**: React 18+, TypeScript (Strict Mode), Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet.
- **Backend & Cloud**: Supabase (PostgreSQL, GoTrue Auth, Row Level Security, Edge Functions with Deno, Realtime Channels, `pg_cron` jobs).
- **Domain Specialization**: Agritech supply-chain systems, APMC Mandi market intelligence, geospatial telemetry / browser geolocation tracking, dynamic multi-party negotiation engines, and multi-modal load logistics.

You build reliable, type-safe, resilient, performant, and secure solutions. You understand the critical importance of keeping real Government observations separate from AI forecasts and prototype simulations.

---

## 2. Critical Rules & Guardrails

### 🛡️ Type Safety & Code Quality
- **Strict Typing**: No implicit `any`. All API responses, Supabase table entities, telemetry payloads, and form states must have explicit TypeScript interfaces.
- **Error Boundaries**: Wrap critical UI sections (such as Leaflet maps, mandi charts, negotiation feeds) in resilient Error Boundaries and fallback states.
- **Defensive State Management**: Handle null/undefined data gracefully (loading skeletons, empty states, network retry handlers).

### 🔒 Security, Secrets & Access Control
- **Database Schema Protection**: No unapproved or ad-hoc database schema mutations. All schema changes must be authored as versioned SQL migration scripts in `supabase/migrations/` including explicit Row Level Security (RLS) policies.
- **Secret Isolation**: Private API keys (such as `DATA_GOV_API_KEY`) **must strictly reside in Supabase Edge Functions / server environments**. Never expose them in Vite client-side environment variables (`VITE_*`).
- **Telemetry Authorization**: Transporter location writes (`public.transporter_locations`) must be enforced at the database level (RLS + `enforce_order_integrity` trigger) to ensure only the assigned transporter can write GPS points for an active order.
- **Atomic Operations**: State-changing operations involving concurrency (e.g., claiming transport jobs) must use PostgreSQL atomic RPCs (`claim_transport_job`) rather than multi-step client queries.

### 🌾 Business & Pricing Invariants
- **Farmer Asking Price Sovereignty**: Government reference prices (from data.gov.in) are strictly informational benchmarks. The system must **never overwrite or alter** the farmer's asking price with government data.
- **Negotiated Deal Preservation**: Once an offer is accepted in the negotiation flow, the agreed unit price must carry through checkout and order creation without reverting to the original asking price.
- **Accurate Financial Calculations**:
  $$\text{Total} = (\text{Quantity} \times \text{Agreed Price/kg}) + (\text{Distance km} \times \text{Rate/km}) + \text{Protection/Escrow Fee}$$

### 🏷️ Trust Boundary & Prototype Disclosures
- **Government vs. AI Distinction**: Real mandi price observations (APMC data) must be visually and structurally distinct from AI-estimated price forecasts/projections. Never fabricate missing historical dates to "smooth" charts.
- **Simulation Transparency**: All simulated capabilities (e.g. simulated escrow payments, demo OTP `8492`, corridor benchmark road distances, browser GPS vs hardware IoT telematics, demo transporter personas) must be explicitly disclosed in the UI.

---

## 3. Module Boundaries & Directory Structure

```
agrismart/
├── .github/                     # CI/CD workflows
├── public/                      # Static assets, logos, manifests
├── src/
│   ├── assets/                  # Images, SVGs, brand assets
│   ├── components/              # Shared UI components (Modals, Tables, Cards, Charts)
│   │   ├── common/              # Buttons, Badges, Loaders, ErrorBoundary
│   │   ├── layout/              # Navbar, Sidebar, Footer, RoleLayout
│   │   └── maps/                # Leaflet map wrappers, Route markers
│   ├── context/                 # Application & Session State (AppContext.tsx)
│   ├── hooks/                   # Custom React hooks (useLiveTracking.ts, useMandiPrices.ts)
│   ├── lib/                     # Supabase client (`src/lib/supabase.ts`), utility helpers
│   ├── pages/                   # Role-based feature pages
│   │   ├── auth/                # Login, Register, RoleSelection
│   │   ├── farmer/              # Dashboard, ProduceListing, MandiPrices, MarketCompare, PriceHistory
│   │   ├── buyer/               # Marketplace, Negotiation, TransporterSelect, OrderConfirmation
│   │   └── transporter/         # Dashboard, RouteOptimizer, LiveTracking, DeliveryConfirm
│   ├── services/                # External API & Supabase data services
│   │   ├── mandiPriceService.ts # APMC Government mandi price ingestion & queries
│   │   ├── liveTrackingService.ts # Browser geolocation telemetry ingestion
│   │   ├── orderService.ts      # Order lifecycle & atomic status transitions
│   │   └── negotiationService.ts# Realtime negotiation offers & counters
│   ├── types/                   # Shared TypeScript definitions (entities, DTOs, Enums)
│   ├── App.tsx                  # Lazy-loaded route boundaries & provider tree
│   └── main.tsx                 # Entrypoint
├── supabase/
│   ├── functions/               # Deno Edge Functions (e.g., `sync-mandi-prices`)
│   └── migrations/              # PostgreSQL schema, RLS policies, Triggers, RPCs
├── package.json                 # Core dependencies
├── tsconfig.json                # Strict TypeScript configuration
├── tailwind.config.js           # Styling tokens & theme
├── vite.config.ts               # Code splitting & chunking rules
└── vercel.json                  # Production SPA rewrites & security headers
```

---

## 4. Architectural Guidelines

1. **Lazy Loading & Code Splitting**:
   - Every route in `src/App.tsx` must be loaded via `React.lazy` and wrapped in `Suspense`.
   - Heavy libraries (e.g. `leaflet`) must be isolated into dedicated vendor chunks in `vite.config.ts` to keep initial bundle size minimal (< 60 kB gzip).

2. **State & Realtime Communication**:
   - `AppContext` coordinates cross-cutting auth sessions and active role views.
   - For real-time updates (negotiation counter-offers, live transporter location tracking), use Supabase Realtime channels with clean unsubscribe lifecycle hooks in `useEffect`.

3. **Regression Testing & Verification**:
   - After modifying order models, tracking logic, or auth flows, always verify the 3-role regression loop:
     1. Farmer creates listing & selects market.
     2. Buyer discovers produce, negotiates, confirms deal, and requests transport.
     3. Transporter claims job, broadcasts telemetry, follows route, and delivers via OTP confirmation.
