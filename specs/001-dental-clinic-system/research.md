# Research: Dental Clinic Appointment Management System

**Feature**: 001-dental-clinic-system
**Date**: 2026-02-02
**Purpose**: Resolve technical decisions and document best practices for implementation

## Table of Contents

1. [WhatsApp Integration](#1-whatsapp-integration)
2. [AI/LLM Selection for Arabic RAG](#2-aillm-selection-for-arabic-rag)
3. [Embedding Model for Semantic Search](#3-embedding-model-for-semantic-search)
4. [Calendar Component with RTL Support](#4-calendar-component-with-rtl-support)
5. [State Management Approach](#5-state-management-approach)
6. [Supabase Realtime Best Practices](#6-supabase-realtime-best-practices)
7. [n8n Workflow Patterns](#7-n8n-workflow-patterns)
8. [Arabic RTL Implementation in Next.js](#8-arabic-rtl-implementation-in-nextjs)

---

## 1. WhatsApp Integration

### Decision
**Evolution API** via n8n webhook integration

### Rationale
- Evolution API is a self-hosted or cloud WhatsApp Business API solution
- Native n8n integration available via HTTP Request or community nodes
- Supports sending/receiving messages, media, and status updates
- More cost-effective than official WhatsApp Cloud API for small clinics
- Webhook-based architecture fits n8n event-driven model

### Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| WhatsApp Cloud API (Meta) | Official, well-documented | Requires business verification, complex setup, higher cost | Overkill for single clinic, longer setup time |
| Twilio WhatsApp | Reliable, good SDKs | Expensive per-message pricing | Cost prohibitive for high message volume |
| WABA (WhatsApp Business App) | Free | No API access, manual only | Cannot automate |

### Implementation Notes
- Evolution API webhook sends POST to n8n on message receive
- n8n sends messages via Evolution API HTTP endpoint
- Store Evolution API instance URL and API key in n8n credentials
- Message format: `{ "number": "phone", "text": "message" }`

---

## 2. AI/LLM Selection for Arabic RAG

### Decision
**OpenAI GPT-4** (gpt-4-turbo or gpt-4o)

### Rationale
- Excellent Arabic language understanding and generation
- Native tool/function calling for structured data extraction (booking details)
- Widely available via n8n AI Agent node
- Consistent response quality for customer-facing interactions
- Supports system prompts for persona/behavior control

### Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Claude 3.5 Sonnet | Strong reasoning, good Arabic | Less established tool use in n8n | n8n AI Agent has better OpenAI integration |
| Gemini Pro | Good multilingual | Less reliable for Arabic medical context | Inconsistent Arabic quality |
| Local LLM (Llama) | Privacy, no API costs | Requires hosting, slower, weaker Arabic | Complexity and quality tradeoffs |

### Implementation Notes
- Use n8n AI Agent node with OpenAI model
- System prompt defines: clinic context, Arabic response requirement, booking flow
- Tools: `check_availability`, `create_appointment`, `search_knowledge_base`
- Temperature: 0.3 for consistent, professional responses
- Max tokens: 500 (concise WhatsApp messages)

---

## 3. Embedding Model for Semantic Search

### Decision
**OpenAI text-embedding-3-small** (1536 dimensions)

### Rationale
- Cost-effective ($0.02/1M tokens) for knowledge base embeddings
- 1536 dimensions matches Supabase pgvector common configurations
- Good multilingual/Arabic support
- Same provider as LLM simplifies API management

### Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| text-embedding-3-large (3072d) | Higher quality | More expensive, larger storage | Overkill for FAQ-sized knowledge base |
| Cohere embed-multilingual | Excellent multilingual | Additional API provider | Adds complexity |
| Local embeddings (sentence-transformers) | Free, private | Requires hosting, setup | Infrastructure overhead |

### Implementation Notes
- Supabase Edge Function generates embeddings on knowledge base insert/update
- Store in `embedding VECTOR(1536)` column
- Similarity search: `SELECT * FROM knowledge_base ORDER BY embedding <-> query_embedding LIMIT 5`
- Index: `CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops)`

---

## 4. Calendar Component with RTL Support

### Decision
**react-big-calendar** with custom RTL styling

### Rationale
- Mature, well-maintained React calendar library
- Built-in week/day/agenda views match requirements
- CSS-based RTL support via direction override
- Highly customizable event rendering
- Active community and documentation

### Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| FullCalendar | Feature-rich | Larger bundle, complex licensing | Heavyweight for appointment display |
| react-calendar | Lightweight | Date picker only, no scheduling view | Missing week/day views |
| Custom implementation | Full control | Development time | Not worth building from scratch |
| shadcn/ui calendar | Consistent with UI | Basic date picker only | No week/day scheduling views |

### Implementation Notes
- Wrap in RTL provider for Arabic locale
- Custom toolbar with Arabic day/month names
- Event component shows: patient name, service, status badge
- Click event opens appointment detail/edit modal
- Integrate with Supabase Realtime for live updates

---

## 5. State Management Approach

### Decision
**TanStack Query (React Query)** + **Supabase Realtime** subscriptions

### Rationale
- React Query handles server state caching, refetching, optimistic updates
- Supabase Realtime provides real-time updates without polling
- No global state store needed (Redux/Zustand overkill)
- Built-in loading/error states reduce boilerplate
- Works seamlessly with Supabase client

### Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|------------------|
| Redux Toolkit | Predictable, DevTools | Boilerplate, overkill for this scale | Too complex for server-state-heavy app |
| Zustand | Simple, lightweight | Still need React Query for server state | Unnecessary layer |
| SWR | Similar to React Query | Less features, smaller ecosystem | React Query more mature |
| Context only | Built-in React | No caching, manual refetch logic | Reinventing React Query |

### Implementation Notes
- Custom hooks: `useAppointments`, `usePatients`, `useServices`
- Supabase Realtime subscription in `useRealtime` hook
- Invalidate queries on Realtime events for consistency
- Optimistic updates for status changes (confirm/cancel)

---

## 6. Supabase Realtime Best Practices

### Decision
Use **Postgres Changes** (database webhooks) + **Broadcast** for presence

### Rationale
- Postgres Changes automatically sync database updates to clients
- Built into Supabase, no additional setup
- Row-level security applies to realtime subscriptions
- Broadcast useful for "who's online" dashboard feature (future)

### Implementation Notes

```typescript
// Subscribe to appointment changes
const channel = supabase
  .channel('appointments')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'appointments' },
    (payload) => {
      queryClient.invalidateQueries(['appointments'])
    }
  )
  .subscribe()
```

- Subscribe on dashboard mount, unsubscribe on unmount
- Filter by date range to reduce payload size
- Handle reconnection gracefully (Supabase client handles this)

---

## 7. n8n Workflow Patterns

### Decision
**Event-driven workflows** with Supabase webhooks as triggers

### Rationale
- Database triggers (INSERT/UPDATE on appointments) fire n8n workflows
- Decouples dashboard from notification logic
- Visual workflow debugging in n8n
- Easy to modify message templates without code changes

### Workflow Architecture

| Workflow | Trigger | Action |
|----------|---------|--------|
| Message Handler | Evolution API webhook | AI Agent -> Supabase CRUD |
| Confirmation | Supabase webhook (status=confirmed) | Format message -> Evolution API |
| Cancellation | Supabase webhook (status=cancelled) | Query slots -> Format -> Evolution API |
| No-Show | Supabase webhook (status=no_show) | Query slots -> Format -> Evolution API |
| Reminder | Cron (hourly) | Query appointments -> Filter -> Evolution API |

### Implementation Notes
- Use n8n Supabase node for database operations
- Store message templates in n8n as code nodes (easy translation)
- Error handling: retry 3x, then log to Supabase `workflow_errors` table
- Use n8n environment variables for API keys

---

## 8. Arabic RTL Implementation in Next.js

### Decision
**next-intl** for i18n + **CSS logical properties** for RTL

### Rationale
- next-intl integrates with App Router (Next.js 14)
- Supports message extraction, pluralization, formatting
- CSS logical properties (`margin-inline-start` vs `margin-left`) auto-flip
- Tailwind CSS 3.3+ has RTL support via `rtl:` variant

### Implementation Notes

```typescript
// next.config.js
const withNextIntl = require('next-intl/plugin')()
module.exports = withNextIntl({ /* config */ })

// layout.tsx
<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

- Use `dir="rtl"` on html element for Arabic
- Tailwind: `rtl:ml-4` for RTL-specific margins
- shadcn/ui components already use logical properties (mostly RTL-ready)
- Test with Arabic text early to catch layout issues

### Fonts
- Arabic: Noto Sans Arabic or Cairo (Google Fonts)
- Load via `next/font` for optimization

---

## Summary of Key Decisions

| Area | Decision | Confidence |
|------|----------|------------|
| WhatsApp API | Evolution API | High |
| AI/LLM | OpenAI GPT-4 | High |
| Embeddings | text-embedding-3-small | High |
| Calendar | react-big-calendar | Medium |
| State Management | React Query + Realtime | High |
| i18n | next-intl | High |
| Workflow Automation | n8n Cloud | High |

All NEEDS CLARIFICATION items from Technical Context have been resolved.
