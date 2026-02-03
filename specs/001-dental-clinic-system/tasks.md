# Tasks: Dental Clinic Appointment Management System

**Input**: Design documents from `/specs/001-dental-clinic-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Test tasks are excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **Frontend**: `src/` (Next.js App Router)
- **Database**: `supabase/migrations/`, `supabase/functions/`
- **Automation**: `n8n/workflows/`
- **Config**: Repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 14 project with TypeScript and App Router in repository root
- [x] T002 [P] Configure Tailwind CSS with RTL support in tailwind.config.ts
- [x] T003 [P] Install and initialize shadcn/ui components in src/components/ui/
- [x] T004 [P] Configure next-intl for i18n with Arabic/English in src/lib/i18n/config.ts
- [x] T005 [P] Create Arabic translations file in src/lib/i18n/messages/ar.json
- [x] T006 [P] Create English translations file in src/lib/i18n/messages/en.json
- [x] T007 [P] Create environment variable templates in .env.local.example and .env.production.example
- [x] T008 Configure next.config.js with i18n and environment settings

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Database Schema & Migrations

- [x] T009 Create Supabase project and enable pgvector extension via supabase/migrations/00009_enable_pgvector.sql
- [x] T010 [P] Create patients table migration in supabase/migrations/00001_create_patients.sql
- [x] T011 [P] Create services table migration in supabase/migrations/00002_create_services.sql
- [x] T012 [P] Create staff table migration in supabase/migrations/00007_create_staff.sql
- [x] T013 [P] Create clinic_schedule table migration in supabase/migrations/00005_create_schedule.sql
- [x] T014 [P] Create blocked_dates table migration in supabase/migrations/00008_create_blocked_dates.sql
- [x] T015 Create appointments table migration in supabase/migrations/00003_create_appointments.sql
- [x] T016 Create conversations table migration in supabase/migrations/00004_create_conversations.sql
- [x] T017 Create knowledge_base table migration in supabase/migrations/00006_create_knowledge_base.sql
- [x] T018 Create RLS policies migration in supabase/migrations/00010_create_rls_policies.sql
- [x] T019 Create database functions (get_available_slots, search_knowledge_base) in supabase/migrations/00011_create_functions.sql
- [x] T020 Create seed data file with default services and schedule in supabase/seed.sql

### Supabase Client Setup

- [x] T021 [P] Create Supabase browser client in src/lib/supabase/client.ts
- [x] T022 [P] Create Supabase server client in src/lib/supabase/server.ts
- [x] T023 Generate TypeScript types from database schema in src/lib/supabase/types.ts
- [x] T024 Create Supabase auth middleware in src/lib/supabase/middleware.ts

### Core Layout & Authentication

- [x] T025 Create RTL provider component in src/components/layout/rtl-provider.tsx
- [x] T026 Create root layout with RTL support in src/app/layout.tsx
- [x] T027 Create global styles with Arabic fonts in src/app/globals.css
- [x] T028 Create login page with Supabase Auth in src/app/(auth)/login/page.tsx
- [x] T029 Create auth hook in src/hooks/use-auth.ts
- [x] T030 Create dashboard layout with sidebar in src/app/(dashboard)/layout.tsx
- [x] T031 [P] Create sidebar component in src/components/layout/sidebar.tsx
- [x] T032 [P] Create header component in src/components/layout/header.tsx

### Shared Utilities

- [x] T033 [P] Create date/time utility functions in src/lib/utils/date.ts
- [x] T034 [P] Create slot availability calculation in src/lib/utils/slots.ts
- [x] T035 [P] Create formatting utilities in src/lib/utils/format.ts
- [x] T036 Create shared TypeScript types in src/types/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Patient Books Appointment via WhatsApp (Priority: P1)

**Goal**: Enable patients to book appointments by sending WhatsApp messages to the clinic, with AI agent processing requests and creating pending appointments.

**Independent Test**: Send a WhatsApp message requesting an appointment, verify the appointment appears in Supabase with "pending" status.

### n8n Workflow Implementation

- [x] T037 [US1] Create n8n WhatsApp Message Handler workflow base structure in n8n/workflows/01-whatsapp-message-handler.json
- [x] T038 [US1] Configure Evolution API webhook trigger node for incoming messages
- [x] T039 [US1] Add Supabase nodes for patient lookup/creation in workflow
- [x] T040 [US1] Add conversation history query node in workflow
- [x] T041 [US1] Configure OpenAI GPT-4 AI Agent node with Arabic system prompt
- [x] T042 [US1] Implement check_availability tool for AI agent (Supabase RPC call)
- [x] T043 [US1] Implement create_appointment tool for AI agent (Supabase INSERT)
- [x] T044 [US1] Add conversation save nodes (patient message and AI response)
- [x] T045 [US1] Configure Evolution API send message node for responses
- [x] T046 [US1] Add error handling and retry logic to workflow

### Edge Function for Embeddings

- [x] T047 [US1] Create embedding generation Edge Function in supabase/functions/generate-embedding/index.ts

### Workflow Documentation

- [x] T048 [US1] Create n8n workflows README in n8n/README.md

**Checkpoint**: Patients can book appointments via WhatsApp - US1 complete

---

## Phase 4: User Story 2 - Assistant Manages Appointments via Dashboard (Priority: P1)

**Goal**: Enable clinic assistants to view, confirm, cancel, and manage appointments through the dashboard with calendar and list views.

**Independent Test**: Log in, view appointments, change an appointment from "pending" to "confirmed" and verify the change persists.

### Hooks & Data Layer

- [x] T049 [US2] Create appointments hook with CRUD operations in src/hooks/use-appointments.ts
- [x] T050 [US2] Create patients hook for data fetching in src/hooks/use-patients.ts

### Appointment Components

- [x] T051 [P] [US2] Create appointment card component in src/components/appointments/appointment-card.tsx
- [x] T052 [P] [US2] Create appointment list component with filters in src/components/appointments/appointment-list.tsx
- [x] T053 [US2] Create appointment calendar component in src/components/appointments/appointment-calendar.tsx
- [x] T054 [US2] Create appointment form/edit modal in src/components/appointments/appointment-form.tsx

### Dashboard Pages

- [x] T055 [US2] Create appointments page with list/calendar views in src/app/(dashboard)/appointments/page.tsx
- [x] T056 [US2] Create dashboard home page with today's summary in src/app/(dashboard)/page.tsx

### n8n Notification Workflows

- [x] T057 [US2] Create appointment confirmation workflow in n8n/workflows/02-appointment-confirmation.json
- [x] T058 [US2] Create appointment cancellation workflow in n8n/workflows/03-appointment-cancellation.json
- [x] T059 [US2] Configure Supabase webhooks for appointment status changes

**Checkpoint**: Assistants can manage appointments via dashboard - US2 complete

---

## Phase 5: User Story 3 - Patient Receives Appointment Reminder (Priority: P2)

**Goal**: Automatically send WhatsApp reminders to patients 24 hours before their confirmed appointments.

**Independent Test**: Create a confirmed appointment for tomorrow, verify the reminder workflow sends the message and marks the appointment as reminded.

- [x] T060 [US3] Create appointment reminder cron workflow in n8n/workflows/05-appointment-reminder.json
- [x] T061 [US3] Add query node for confirmed appointments in next 24 hours
- [x] T062 [US3] Add filter node to exclude already-reminded appointments
- [x] T063 [US3] Add loop node to process each appointment
- [x] T064 [US3] Add Evolution API send node with Arabic reminder template
- [x] T065 [US3] Add Supabase update node to set reminded=true

**Checkpoint**: Patients receive automated reminders - US3 complete

---

## Phase 6: User Story 4 - Patient Asks General Questions via WhatsApp (Priority: P2)

**Goal**: AI agent answers patient questions using the knowledge base with semantic search (RAG).

**Independent Test**: Send "What are your working hours?" via WhatsApp, verify the AI responds with accurate information from the knowledge base.

- [x] T066 [US4] Add knowledge base query node to WhatsApp handler workflow
- [x] T067 [US4] Implement search_knowledge tool for AI agent using pgvector
- [x] T068 [US4] Update AI system prompt to reference knowledge base for FAQs
- [x] T069 [US4] Add embedding generation trigger for knowledge base entries

**Checkpoint**: AI agent answers FAQs using knowledge base - US4 complete

---

## Phase 7: User Story 5 - Assistant Manages Clinic Schedule (Priority: P2)

**Goal**: Administrators can configure weekly working hours, slot durations, and block dates.

**Independent Test**: Set working hours for Monday, verify only those hours appear as available slots.

### Schedule Components

- [x] T070 [P] [US5] Create working hours form component in src/components/schedule/working-hours-form.tsx
- [x] T071 [P] [US5] Create blocked dates management component in src/components/schedule/blocked-dates.tsx

### Schedule Page

- [x] T072 [US5] Create schedule management page in src/app/(dashboard)/schedule/page.tsx
- [x] T073 [US5] Create schedule hook for CRUD operations in src/hooks/use-schedule.ts

**Checkpoint**: Administrators can manage clinic schedule - US5 complete

---

## Phase 8: User Story 6 - Patient Cancels or Reschedules via WhatsApp (Priority: P3)

**Goal**: Patients can cancel or reschedule their appointments by sending WhatsApp messages.

**Independent Test**: Send "I need to cancel my appointment" via WhatsApp, verify the appointment status changes to cancelled.

- [x] T074 [US6] Implement cancel_appointment tool for AI agent in WhatsApp workflow
- [x] T075 [US6] Add reschedule logic to AI agent with slot suggestions
- [x] T076 [US6] Update AI system prompt to handle cancellation/reschedule intents

**Checkpoint**: Patients can cancel/reschedule via WhatsApp - US6 complete

---

## Phase 9: User Story 7 - No-Show Follow-up (Priority: P3)

**Goal**: Automatically send follow-up messages when appointments are marked as no-show.

**Independent Test**: Mark an appointment as no-show, verify the patient receives a follow-up message with rescheduling options.

- [x] T077 [US7] Create no-show follow-up workflow in n8n/workflows/04-no-show-followup.json
- [x] T078 [US7] Configure Supabase webhook trigger for no_show status
- [x] T079 [US7] Add available slots query and Arabic message template

**Checkpoint**: No-show patients receive follow-up messages - US7 complete

---

## Phase 10: User Story 8 - Administrator Manages Knowledge Base (Priority: P3)

**Goal**: Administrators can create, edit, and delete knowledge base entries that the AI agent uses.

**Independent Test**: Add a new FAQ entry, then ask the AI agent a related question and verify it uses the new information.

### Knowledge Base Components

- [x] T080 [P] [US8] Create knowledge base list component in src/components/knowledge/knowledge-list.tsx
- [x] T081 [P] [US8] Create knowledge base form component in src/components/knowledge/knowledge-form.tsx

### Knowledge Base Page

- [x] T082 [US8] Create knowledge base management page in src/app/(dashboard)/knowledge/page.tsx
- [x] T083 [US8] Create knowledge base hook with embedding trigger in src/hooks/use-knowledge.ts

**Checkpoint**: Administrators can manage knowledge base - US8 complete

---

## Phase 11: User Story 9 - Staff Views Patient History (Priority: P3)

**Goal**: Staff can view patient profiles with appointment history and conversation logs.

**Independent Test**: Open a patient profile, verify their appointment history and WhatsApp conversations are displayed.

### Patient Components

- [x] T084 [P] [US9] Create patient list component in src/components/patients/patient-list.tsx
- [x] T085 [P] [US9] Create patient profile component in src/components/patients/patient-profile.tsx
- [x] T086 [US9] Create conversation history component in src/components/patients/conversation-history.tsx

### Patient Pages

- [x] T087 [US9] Create patients list page in src/app/(dashboard)/patients/page.tsx
- [x] T088 [US9] Create patient detail page in src/app/(dashboard)/patients/[id]/page.tsx

**Checkpoint**: Staff can view patient history - US9 complete

---

## Phase 12: User Story 10 - Dashboard Real-time Updates (Priority: P4)

**Goal**: Dashboard updates in real-time when appointments are created or modified.

**Independent Test**: Have one user create an appointment while another watches the dashboard, verify it appears without refresh.

- [x] T089 [US10] Create Supabase Realtime hook in src/hooks/use-realtime.ts
- [x] T090 [US10] Integrate realtime subscription into appointments page
- [x] T091 [US10] Add realtime updates to dashboard home page
- [x] T092 [US10] Add visual indicators for realtime updates

**Checkpoint**: Dashboard shows real-time updates - US10 complete

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Settings, additional features, and quality improvements

### Settings Page

- [x] T093 [P] Create settings page with clinic profile in src/app/(dashboard)/settings/page.tsx
- [x] T094 [P] Add WhatsApp connection status display to settings
- [x] T095 [P] Add workflow status monitoring to settings

### API Routes

- [x] T096 Create Evolution API webhook route in src/app/api/webhooks/evolution/route.ts

### Final Polish

- [x] T097 [P] Add loading states and skeletons to all pages
- [x] T098 [P] Add error boundaries and user-friendly error messages
- [x] T099 [P] Optimize bundle size and lazy loading
- [x] T100 Run quickstart.md validation and fix any issues
- [x] T101 Create production deployment checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-12)**: All depend on Foundational phase completion
  - US1 and US2 should be completed first (both P1)
  - US3-US5 can proceed after US1/US2 (all P2)
  - US6-US9 can proceed after US1/US2 (all P3)
  - US10 should be last user story (P4)
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Priority | Can Start After | Dependencies |
|-------|----------|-----------------|--------------|
| US1: WhatsApp Booking | P1 | Foundational | None |
| US2: Dashboard Management | P1 | Foundational | None (independent of US1) |
| US3: Reminders | P2 | Foundational | None (uses same n8n patterns as US1) |
| US4: FAQ Responses | P2 | US1 partial | Requires WhatsApp workflow from US1 |
| US5: Schedule Management | P2 | Foundational | None |
| US6: WhatsApp Cancel/Reschedule | P3 | US1 | Extends WhatsApp workflow |
| US7: No-Show Follow-up | P3 | US2 | Requires status change from dashboard |
| US8: Knowledge Base Management | P3 | US4 partial | Uses same knowledge base |
| US9: Patient History | P3 | Foundational | None |
| US10: Real-time Updates | P4 | US2 | Requires dashboard pages |

### Within Each User Story

- Models/migrations before services
- Hooks before components
- Components before pages
- Core implementation before integrations
- n8n workflows can often be developed in parallel with dashboard

### Parallel Opportunities

**Phase 1 (Setup)**: T002, T003, T004, T005, T006, T007 can run in parallel
**Phase 2 (Foundational)**:
- Database migrations T010-T014 can run in parallel
- Supabase clients T021, T022 can run in parallel
- Layout components T031, T032 can run in parallel
- Utilities T033, T034, T035 can run in parallel

**User Stories**:
- US1 and US2 can be worked on in parallel by different team members
- Component tasks within each story marked [P] can run in parallel

---

## Parallel Example: Phase 2 Foundation

```bash
# Launch all independent database migrations together:
Task: "Create patients table migration in supabase/migrations/00001_create_patients.sql"
Task: "Create services table migration in supabase/migrations/00002_create_services.sql"
Task: "Create staff table migration in supabase/migrations/00007_create_staff.sql"
Task: "Create clinic_schedule table migration in supabase/migrations/00005_create_schedule.sql"
Task: "Create blocked_dates table migration in supabase/migrations/00008_create_blocked_dates.sql"

# Launch Supabase clients together:
Task: "Create Supabase browser client in src/lib/supabase/client.ts"
Task: "Create Supabase server client in src/lib/supabase/server.ts"
```

## Parallel Example: User Story 2

```bash
# Launch appointment components together:
Task: "Create appointment card component in src/components/appointments/appointment-card.tsx"
Task: "Create appointment list component in src/components/appointments/appointment-list.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (WhatsApp Booking)
4. Complete Phase 4: User Story 2 (Dashboard Management)
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo as MVP

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add US1 + US2 -> Test independently -> Deploy (MVP!)
3. Add US3 (Reminders) + US5 (Schedule) -> Test -> Deploy
4. Add US4 (FAQ) + US6 (Cancel/Reschedule) -> Test -> Deploy
5. Add US7-US9 (No-show, Knowledge Base, Patient History) -> Test -> Deploy
6. Add US10 (Real-time) + Polish -> Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (WhatsApp workflows)
   - Developer B: User Story 2 (Dashboard)
3. After US1/US2:
   - Developer A: US3, US4, US6 (n8n workflows)
   - Developer B: US5, US7, US8, US9 (dashboard pages)
4. US10 and Polish can be done by either

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 101 |
| **Setup Tasks** | 8 |
| **Foundational Tasks** | 28 |
| **US1 Tasks** | 12 |
| **US2 Tasks** | 11 |
| **US3 Tasks** | 6 |
| **US4 Tasks** | 4 |
| **US5 Tasks** | 4 |
| **US6 Tasks** | 3 |
| **US7 Tasks** | 3 |
| **US8 Tasks** | 4 |
| **US9 Tasks** | 5 |
| **US10 Tasks** | 4 |
| **Polish Tasks** | 9 |
| **Parallel Opportunities** | 35+ tasks marked [P] |

**Suggested MVP Scope**: User Stories 1 + 2 (23 story tasks + 36 foundation tasks = 59 tasks for working system)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- n8n workflows can be developed using n8n Cloud UI and exported to JSON
- Supabase migrations should be applied in order (numbered prefix)
