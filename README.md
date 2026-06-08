# 🛠️ Malaysia Co (Maintenance Services)

> **On-Demand Service Marketplace + Industrial CMMS + AI Operations + Digital Twin & BIM Platform**

***Malaysia Co (Maintenance Services) is a unified ecosystem that connects customers with trusted technicians for on-demand services while powering enterprise-grade maintenance operations. The platform integrates a full **Digital Twin** environment with **BIM (Building Information Modeling)**, **AR/VR** immersion, **IoT** sensor ingestion, **AI** analytics, and real-time collaboration — from a single building to an entire smart city.*** 

---

# 🚀 Overview

> Malaysia Co (Maintenance Services) combines five core systems into one seamless experience:

* - 🧑‍🔧 **Service Marketplace** — Uber-style technician matching
* - 🏭 **CMMS** — Asset, work order, inventory, and preventive maintenance
* - 🤖 **AI Layer** — Job intelligence, predictive maintenance, chat assistant
* - 💳 **Payments** — Stripe Connect marketplace payouts
* - 🧠 **Digital Twin + BIM + AR/VR** — Real-time asset visualization, simulation, and immersive collaboration

---

# 🧱 System Architecture

```mermaid
flowchart TD
    UI[Next.js 16 Web App] --> API[API Layer / Server Actions]
    API --> CORE[Core Domain Engine]

    CORE --> MARKET[Marketplace System]
    CORE --> CMMS[CMMS System]
    CORE --> AI[AI Engine]
    CORE --> PAY[Stripe Payments]
    CORE --> RT[Realtime System]
    CORE --> DT[Digital Twin Orchestrator]

    RT --> WS[WebSocket Server]
    RT --> IOT[IoT Ingestion Pipeline]

    CMMS --> ASSETS[Assets & Digital Twins]
    CMMS --> WO[Work Orders]
    CMMS --> PRED[Predictive Maintenance]

    DT --> BIM[BIM Integration Service]
    DT --> ARVR[AR/VR Session Manager]
    DT --> GIS[GIS & Geospatial Service]
```

---

# 🧠 OpenClaw Multi-Agent System

> Malaysia Co (Maintenance Services) uses **OpenClaw** — a powerful multi-agent orchestration framework — to manage complex workflows across property management, construction, asset operations, finance, and sustainability.

> Each agent is a specialized **skill** that can be invoked by the orchestrator based on user intent or system triggers.

---

# 📂 Agent Skills Directory (`.openclaw/agents/skills/`)

## 🏗️ Construction & Development

| Skill                                           | Description                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| `construction-cost-estimator`                   | Generates detailed cost estimates using CSI divisions and regional factors |
| `construction-budget-gc-analyzer`               | Reviews GC budgets, identifies discrepancies, and suggests optimizations   |
| `construction-procurement-contracts-engine`     | Analyzes bids, negotiates contracts, and manages procurement workflows     |
| `construction-project-command-center`           | Tracks project timelines, draws, safety compliance, and RFIs               |
| `construction-meeting-prep-and-action-tracking` | Prepares agendas, minutes, and tracks action items                         |
| `change-order-review`                           | Validates change orders against original scope and budget                  |
| `closing-checklist-tracker`                     | Monitors project closing tasks and critical path milestones                |
| `delivery-handoff`                              | Manages turnover documentation and punch lists                             |

---

## 🏢 Property & Asset Management

| Skill                                                | Description                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| `asset-manager-residential-multifamily`              | Oversees asset performance, NOI, and capital improvements             |
| `asset-ops-cockpit`                                  | Real-time dashboard for asset health, maintenance KPIs, and occupancy |
| `building-systems-maintenance-manager`               | Schedules preventive maintenance and tracks equipment lifecycle       |
| `assistant-property-manager-residential-multifamily` | Handles tenant requests, lease renewals, and daily operations         |
| `delinquency-and-collections`                        | Automates rent collection, late fee application, and payment plans    |

---

## 💰 Finance & Investment

| Skill                                        | Description                                                        |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `cfo-finance-leader-residential-multifamily` | Manages fund accounting, distributions, and investor reporting     |
| `deal-underwriting-assistant`                | Analyzes acquisition opportunities and builds pro-forma models     |
| `cost-segregation-analyzer`                  | Identifies assets for accelerated depreciation                     |
| `debt-covenant-monitor`                      | Tracks loan covenants and alerts on breaches                       |
| `debt-portfolio-monitor`                     | Monitors interest rates, maturities, and refinancing opportunities |
| `emerging-manager-evaluator`                 | Assesses new investment managers using scorecards                  |
| `investment-committee-prep`                  | Generates investment memoranda and supporting analyses             |
| `fund-raise-negotiation-engine`              | Optimizes fund terms, fees, and LP negotiations                    |
| `distribution-notice-generator`              | Creates capital distribution notices with tax characterization     |
| `investor-lifecycle-manager`                 | Onboards investors and coordinates audits                          |

---

## 🌿 Sustainability & Compliance

| Skill                                | Description                                         |
| ------------------------------------ | --------------------------------------------------- |
| `carbon-audit-compliance`            | Calculates Scope 1, 2, and 3 emissions              |
| `climate-risk-assessment`            | Evaluates physical and transition climate risks     |
| `compliance-regulatory-response-kit` | Generates templates for regulatory filings          |
| `insurance-risk-manager`             | Reviews coverage adequacy and recommends mitigation |

---

## 👔 Executive & Operations

| Skill                                                    | Description                                             |
| -------------------------------------------------------- | ------------------------------------------------------- |
| `ceo-executive-leader-residential-multifamily`           | Aggregates portfolio performance and strategic insights |
| `coo-operations-leader-residential-multifamily`          | Optimizes operations and vendor management              |
| `estimator-preconstruction-lead-residential-multifamily` | Leads pre-construction estimating and VE                |
| `construction-manager-residential-multifamily`           | Oversees schedules, quality, and on-site execution      |
| `executive-operating-summary-generation`                 | Produces monthly and quarterly reports                  |
| `executive-pipeline-summary`                             | Summarizes investment pipeline activity                 |
| `bid-leveling-and-procurement-review`                    | Levels bids and recommends vendor awards                |
| `entitlement-feasibility`                                | Assesses zoning, permits, and approval timelines        |

---

# 🔗 OpenClaw Integration with Malaysia Co (Maintenance Services)

| Malaysia Co (Maintenance Services) Module                      | Invoked OpenClaw Skills                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| **Marketplace – Job Posting**        | `construction-cost-estimator`, `bid-leveling-and-procurement-review`          |
| **CMMS – Work Orders**               | `building-systems-maintenance-manager`, `asset-ops-cockpit`                   |
| **Digital Twin – Predictive Alerts** | `asset-manager-residential-multifamily`, `climate-risk-assessment`            |
| **Sustainability Dashboard**         | `carbon-audit-compliance`, `compliance-regulatory-response-kit`               |
| **Admin – Finance Reports**          | `cfo-finance-leader-residential-multifamily`, `distribution-notice-generator` |
| **Investment Committee Prep**        | `investment-committee-prep`, `deal-underwriting-assistant`                    |

---

# ⚙️ Agent Routing & Orchestration

### OpenClaw uses a `routing.yaml` file per skill to define when and how the skill should be triggered.

## Example: `asset-manager-residential-multifamily/routing.yaml`

```yaml
intents:
  - "asset performance"
  - "NOI analysis"
  - "capital improvements"

triggers:
  - keyword: "asset health"
  - condition: "work_order_completed > 10"

channels:
  - dashboard
  - api
```

### The orchestrator (`.openclaw/agents/messaging-orchestrator.ts`) listens for events from the Malaysia Co (Maintenance Services) backend such as:

* - Job creation
* - IoT sensor alerts
* - Maintenance completion
* - Financial reporting requests
* - Sustainability events

Skills can also be triggered through natural language prompts from the AI assistant.

Example:

```text
"Run a carbon audit for Building A"
```

---

# 🔄 Multi-Agent Construction Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant OpenClaw
    participant Skill_Estimator
    participant Skill_Procurement
    participant Skill_ConstructionMgr

    User->>UI: Request estimate for new building
    UI->>OpenClaw: Invoke construction-cost-estimator
    OpenClaw->>Skill_Estimator: Calculate cost
    Skill_Estimator-->>OpenClaw: Cost breakdown

    OpenClaw->>Skill_Procurement: Run bid-leveling
    Skill_Procurement-->>OpenClaw: Vendor shortlist

    OpenClaw->>Skill_ConstructionMgr: Create project timeline
    Skill_ConstructionMgr-->>OpenClaw: Gantt chart

    OpenClaw-->>UI: Return integrated plan
```

---

# 📁 Project Structure

## `app/`

```text
app
├── (auth)
├── (dashboard)
├── api
├── auth
├── cookies
├── error.tsx
├── features
├── globals.css
├── how-it-works
├── integrations
├── jobs
├── layout.tsx
├── not-found.tsx
├── page.tsx
├── pricing
├── privacy
├── services
├── skills
├── support
├── technician
└── terms
```

---

## `components/`

```text
components
├── 3d
├── FeatureShowcase.tsx
├── FeaturesOverview.tsx
├── ai-elements
├── auth
├── chat
├── features
├── forms
├── integration
├── landing
├── layout
├── layouts
├── mobile
├── navigation
├── theme-toggle.tsx
└── ui
```

---

## `.openclaw/`

```text
.openclaw
├── AGENTS_QUICK_START.md
├── DESIGN.md
├── MULTI_AGENT_SETUP.md
├── REQUIREMENTS.md
├── TASKS.md
├── agents
│   └── skills
└── settings.json
```

---

## `lib/`

```text
lib
├── agents
│   └── messaging-orchestrator.ts
├── auth.ts
├── cmms
├── embedding.ts
├── errorHandler.ts
├── integrations
├── middleware
├── prisma.ts
├── proxy.ts
├── pwa-utils.ts
├── rag.ts
├── rbac.ts
├── resend-emails.ts
├── supabase
├── trpc
└── utils.ts
```

---

## `hooks/`

```text
hooks
├── mobile
├── useAnalytics.ts
├── useAssets.ts
├── useAuth.ts
├── useInventory.ts
├── useJob.ts
├── usePWA.ts
├── usePreventiveMaintenance.ts
├── useRoleGuard.ts
├── useServerAction.ts
└── useWorkOrders.ts
```

---

## `store/`

```text
store
├── index.ts
├── useAnalyticsStore.ts
├── useAppStore.ts
├── useAssetsStore.ts
├── useInventoryStore.ts
├── useJobsStore.ts
├── usePreventiveMaintenanceStore.ts
├── useUserStore.ts
└── useWorkOrdersStore.ts
```

---

# 🔐 Authentication System

* - JWT-based authentication using `auth-token` cookies
* - Role-based access control:

  * - `CUSTOMER`
  * - `TECHNICIAN`
  * - `ADMIN`
  * - `CMMS_OPERATOR`
* - Password hashing with `bcrypt`
* - PostgreSQL hosted on Neon
* - Middleware-enforced RBAC
* - Sandbox development mode:

  * - `ENABLE_AUTH=false`
  * - `SKIP_LOGIN=true`

---

# ⚙️ Tech Stack

| Layer            | Technology                                     |
| ---------------- | ---------------------------------------------- |
| Frontend         | Next.js 16, React 19, TypeScript 6, Tailwind 4 |
| UI Components    | shadcn/ui, Lucide Icons, ai-elements           |
| 3D / BIM         | Three.js, web-ifc-three, Cesium, Mapbox GL JS  |
| AR/VR            | WebXR, ARCore, ARKit, Microsoft HoloLens       |
| State Management | Zustand, TanStack Query                        |
| Backend API      | Next.js API Routes + tRPC                      |
| Database         | PostgreSQL (Neon) + pgVector + Prisma          |
| Authentication   | JWT cookies + optional Supabase                |
| Payments         | Stripe Connect                                 |
| AI / LLM         | Vercel AI SDK, OpenAI, Ollama, OpenClaw        |
| IoT Protocols    | MQTT, OPC-UA, Modbus, BACnet, LoRaWAN          |
| Real-time        | WebSockets (Socket.io / uWebSockets)           |
| Cloud            | Vercel + AWS/Azure                             |
| Infrastructure   | Kubernetes (EKS), Terraform, GitHub Actions    |

---

# 🚀 Getting Started

## Prerequisites

* - Node.js 20+
* - PostgreSQL database
* - Stripe account
* - Mapbox token *(optional)*
* - OpenAI API key or Ollama instance

---

## Installation

```bash
# Clone repository
git clone https://github.com/your-org/fixswift.git

# Enter project directory
cd fixswift

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

---

# 🔑 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@ep-fixswift-db.neon.tech/neondb
DIRECT_URL=postgresql://user:pass@ep-fixswift-db.neon.tech/neondb

# Auth
JWT_SECRET=your-super-secret-jwt-key
ENABLE_AUTH=true
SKIP_LOGIN=false

# AI
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434
OPENCLAW_ENABLED=true

# Payments
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

---

# 📊 Key Workflows

## Marketplace Job Flow

```mermaid
flowchart LR
    A[Create Job] --> B[AI Categorization]
    B --> C[Budget Suggestion]
    C --> D[Technician Matching]
    D --> E[Accept Job]
    E --> F[Execute Work]
    F --> G[Complete & Pay]
```

---

## IoT → Digital Twin Flow

```mermaid
flowchart TD
    SENSOR[Sensor Data] --> INGEST
    INGEST --> ANOMALY[Anomaly Detection]
    ANOMALY --> ALERT
    ALERT --> WORK_ORDER
    WORK_ORDER --> TECH
    TECH --> RESOLVE
    RESOLVE --> TWIN_UPDATE[Digital Twin Update]
    TWIN_UPDATE --> VIS[3D Viewer Reflects Change]
```

---

## Multi-Agent Construction Workflow

```mermaid
sequenceDiagram
    participant PM as Project Manager
    participant UI
    participant OC as OpenClaw
    participant EST as Cost Estimator
    participant PROC as Procurement
    participant CM as Construction Mgr

    PM->>UI: Start new project
    UI->>OC: Trigger construction-cost-estimator

    OC->>EST: Calculate estimate
    EST-->>OC: Cost breakdown

    OC->>PROC: Run bid-leveling
    PROC-->>OC: Vendor shortlist

    OC->>CM: Generate schedule
    CM-->>OC: Gantt chart

    OC-->>UI: Return integrated plan
    UI-->>PM: Display project dashboard
```

---

# 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Digital Twin tests
npm run test:twin

# OpenClaw skill validation
npm run test:skills
```

---

# 📈 Roadmap

* - [x] Marketplace + CMMS foundations
* - [x] Multi-agent AI system
* - [x] Digital Twin core
* - [ ] AR maintenance overlay (HoloLens 2)
* - [ ] VR safety training module
* - [ ] Smart city GIS expansion
* - [ ] Autonomous drone inspection integration
* - [ ] Generative AI copilot
* - [ ] OpenClaw skill marketplace

---

# 🤝 Contributing

Please read:

```text
CONTRIBUTING.md
```

for contribution guidelines, coding standards, and pull request workflow.

---

# 📄 License

Licensed under the **MIT License**.

See:

```text
LICENSE
```

for details.

---

# 🙏 Acknowledgements

* - OpenClaw — Multi-agent orchestration framework
* - Vercel AI SDK — Generative UI and AI tooling
* - Three.js & web-ifc-three — BIM visualization
* - Neon — Serverless PostgreSQL with pgVector
* - shadcn/ui — Component system
* - Mapbox — Geospatial rendering
* - Stripe — Payments infrastructure
* - OpenAI & Ollama — LLM and agent intelligence
* - The open-source community for inspiration and tools
