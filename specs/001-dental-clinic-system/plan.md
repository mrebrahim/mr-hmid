# Implementation Plan: Dental Clinic Appointment Management System

**Branch**: `001-dental-clinic-system` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dental-clinic-system/spec.md`

## Summary

A dental clinic management system combining a Next.js admin dashboard with n8n automation workflows for WhatsApp-based appointment booking, notifications, and AI-powered patient communication. The system uses Supabase for data persistence and real-time features, Evolution API for WhatsApp integration, and OpenAI/Claude for RAG-based conversational AI.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 14), SQL (PostgreSQL via Supabase)
**Primary Dependencies**:
- Frontend: Next.js 14 (App Router), React 18, shadcn/ui, Tailwind CSS, next-intl (i18n)
- Backend: Supabase (PostgreSQL, Auth, Realtime, Edge Functions, pgvector)
- Automation: n8n Cloud (workflow automation)
- WhatsApp: Evolution API (WhatsApp Business integration)
- AI/LLM: OpenAI GPT-4 or Claude API (conversational AI with RAG)

**Storage**: Supabase PostgreSQL with pgvector extension for semantic search embeddings
**Testing**: Vitest (unit), Playwright (E2E), n8n workflow testing
**Target Platform**: Web (dashboard), n8n Cloud (automation), WhatsApp (patient interface)
**Project Type**: Web application (Next.js frontend + Supabase backend + n8n workflows)
**Performance Goals**:
- Dashboard page load < 3 seconds
- AI agent response < 5 seconds
- 500 appointments/month capacity
- 10 concurrent dashboard users

**Constraints**:
- Arabic RTL support required
- WhatsApp message delivery within 1 minute of trigger
- 2-year data retention for patient records
- Single clinic, single timezone (GST)

**Scale/Scope**:
- 500 appointments/month
- ~1000 patients/year
- 10 concurrent staff users
- 7 dashboard pages
- 5 n8n automation workflows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Project constitution is using placeholder template. Applying standard best practices:

| Principle | Status | Notes |
|-----------|--------|-------|
| Simplicity | PASS | Using established stack (Next.js, Supabase, n8n) - no custom frameworks |
| Separation of Concerns | PASS | Dashboard, automation workflows, and database are distinct components |
| Testing | PASS | Unit tests (Vitest), E2E tests (Playwright), integration tests planned |
| Security | PASS | Supabase Auth, RLS policies, no credentials in code |
| Documentation | PASS | Spec, plan, data model, contracts, quickstart documents generated |

## Project Structure

### Documentation (this feature)

```text
specs/001-dental-clinic-system/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   ├── api-schema.yaml  # OpenAPI specification
│   └── n8n-workflows.md # Workflow specifications
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
# Next.js Dashboard Application
src/
├── app/                      # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Dashboard home
│   │   ├── appointments/
│   │   │   └── page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── schedule/
│   │   │   └── page.tsx
│   │   ├── knowledge/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/                  # API routes (if needed beyond Supabase)
│   │   └── webhooks/
│   │       └── evolution/
│   │           └── route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── appointments/
│   │   ├── appointment-card.tsx
│   │   ├── appointment-calendar.tsx
│   │   ├── appointment-list.tsx
│   │   └── appointment-form.tsx
│   ├── patients/
│   │   ├── patient-list.tsx
│   │   ├── patient-profile.tsx
│   │   └── conversation-history.tsx
│   ├── schedule/
│   │   ├── working-hours-form.tsx
│   │   └── blocked-dates.tsx
│   ├── knowledge/
│   │   ├── knowledge-list.tsx
│   │   └── knowledge-form.tsx
│   └── layout/
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── rtl-provider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client
│   │   ├── middleware.ts     # Auth middleware
│   │   └── types.ts          # Generated types
│   ├── utils/
│   │   ├── date.ts           # Date/time helpers
│   │   ├── slots.ts          # Availability calculation
│   │   └── format.ts         # Formatters
│   └── i18n/
│       ├── config.ts
│       └── messages/
│           ├── ar.json
│           └── en.json
├── hooks/
│   ├── use-appointments.ts
│   ├── use-patients.ts
│   ├── use-realtime.ts
│   └── use-auth.ts
└── types/
    └── index.ts

# Supabase Configuration
supabase/
├── migrations/
│   ├── 00001_create_patients.sql
│   ├── 00002_create_services.sql
│   ├── 00003_create_appointments.sql
│   ├── 00004_create_conversations.sql
│   ├── 00005_create_schedule.sql
│   ├── 00006_create_knowledge_base.sql
│   ├── 00007_create_staff.sql
│   ├── 00008_create_blocked_dates.sql
│   ├── 00009_enable_pgvector.sql
│   └── 00010_create_rls_policies.sql
├── functions/
│   └── generate-embedding/
│       └── index.ts          # Edge function for embeddings
└── seed.sql                  # Initial data (services, schedule)

# n8n Workflow Definitions (exported JSON)
n8n/
├── workflows/
│   ├── 01-whatsapp-message-handler.json
│   ├── 02-appointment-confirmation.json
│   ├── 03-appointment-cancellation.json
│   ├── 04-no-show-followup.json
│   └── 05-appointment-reminder.json
└── README.md

# Tests
tests/
├── unit/
│   ├── utils/
│   │   └── slots.test.ts
│   └── components/
│       └── appointment-card.test.tsx
├── integration/
│   └── supabase/
│       └── appointments.test.ts
└── e2e/
    ├── login.spec.ts
    ├── appointments.spec.ts
    └── patients.spec.ts

# Configuration
├── .env.local.example
├── .env.production.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

**Structure Decision**: Web application structure with Next.js App Router for the dashboard frontend, Supabase as the backend-as-a-service, and n8n workflows as external automation layer. This keeps the codebase focused on the dashboard while leveraging managed services for database, auth, and workflow automation.

## Complexity Tracking

> No constitution violations identified. Standard web application architecture.

| Decision | Rationale | Alternative Considered |
|----------|-----------|------------------------|
| Supabase over custom backend | Provides Auth, Realtime, RLS, pgvector out of box; reduces development time | Custom Node.js/Express API would require more code and ops overhead |
| n8n over custom workflow engine | Visual workflow builder, Evolution API integration exists, reduces AI agent complexity | Custom webhook handlers would require building conversation state machine |
| shadcn/ui over custom components | Production-ready, accessible, RTL-friendly components | Custom components would take longer to build and test |

## Phase 0: Research Summary

See [research.md](./research.md) for detailed findings.

**Key Decisions**:
1. **WhatsApp Integration**: Evolution API with n8n webhook trigger
2. **AI/LLM**: OpenAI GPT-4 for Arabic language support and tool use
3. **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions) for RAG
4. **Calendar Component**: react-big-calendar with RTL support
5. **State Management**: React Query + Supabase Realtime (no Redux needed)

## Phase 1: Design Artifacts

- [data-model.md](./data-model.md) - Database schema and entity relationships
- [contracts/api-schema.yaml](./contracts/api-schema.yaml) - REST API specification
- [contracts/n8n-workflows.md](./contracts/n8n-workflows.md) - Workflow specifications
- [quickstart.md](./quickstart.md) - Development setup guide

## Next Steps

Run `/speckit.tasks` to generate the implementation task list from this plan.
