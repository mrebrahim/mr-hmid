# Quickstart Guide: Dental Clinic Management System

**Feature**: 001-dental-clinic-system
**Date**: 2026-02-02

This guide walks through setting up the development environment for the Dental Clinic Appointment Management System.

---

## Prerequisites

- **Node.js** 18.x or higher
- **pnpm** (recommended) or npm
- **Git**
- **Supabase CLI** (optional, for local development)
- **n8n Cloud account** or self-hosted n8n instance
- **Evolution API** instance (self-hosted or cloud)
- **OpenAI API key** (for GPT-4 and embeddings)

---

## 1. Project Setup

### Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd dental-clinic-system

# Install dependencies
pnpm install

# Copy environment template
cp .env.local.example .env.local
```

### Environment Variables

Edit `.env.local` with your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI (for embeddings edge function)
OPENAI_API_KEY=sk-...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 2. Supabase Setup

### Option A: Supabase Cloud (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your keys
3. Enable the **pgvector** extension:
   - Go to Database > Extensions
   - Search for "vector" and enable it

### Option B: Local Development

```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db push
```

### Apply Migrations

Run migrations in order (via Supabase Dashboard SQL Editor or CLI):

```bash
# Using Supabase CLI
supabase db push
```

Or manually execute each migration file from `supabase/migrations/`.

### Seed Initial Data

```bash
# Run seed script
supabase db reset --seed
```

Or execute `supabase/seed.sql` manually.

---

## 3. Next.js Dashboard Setup

### Install shadcn/ui Components

```bash
# Initialize shadcn/ui
pnpm dlx shadcn@latest init

# Install required components
pnpm dlx shadcn@latest add button card input label select table tabs badge calendar dialog dropdown-menu form toast sidebar
```

### Generate Supabase Types

```bash
# Generate TypeScript types from database schema
pnpm supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 4. n8n Workflow Setup

### n8n Cloud Setup

1. Sign up at [n8n.io](https://n8n.io)
2. Create a new workflow for each of the 5 workflows
3. Configure credentials:
   - **Supabase**: URL + Service Role Key
   - **HTTP Request** (for Evolution API): Base URL + API Key
   - **OpenAI**: API Key

### Import Workflows

1. Open each workflow JSON from `n8n/workflows/`
2. In n8n, click Import > From File
3. Configure credentials in each node
4. Activate the workflow

### Configure Supabase Webhooks

For each webhook-triggered workflow (2, 3, 4):

1. Go to Supabase Dashboard > Database > Webhooks
2. Create webhook:
   - Table: `appointments`
   - Events: UPDATE
   - URL: Your n8n webhook URL
   - Add header: `Authorization: Bearer your-n8n-webhook-secret`

---

## 5. Evolution API Setup

### Self-Hosted (Docker)

```bash
# Run Evolution API
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=your-api-key \
  atendai/evolution-api:latest
```

### Connect WhatsApp

1. Access Evolution API at `http://localhost:8080`
2. Create a new instance named `clinic-instance`
3. Scan QR code with WhatsApp Business app
4. Configure webhook URL to point to n8n workflow 1

### Webhook Configuration

```json
{
  "url": "https://your-n8n-url/webhook/whatsapp-incoming",
  "webhook_by_events": true,
  "events": ["MESSAGES_UPSERT"]
}
```

---

## 6. Testing the Setup

### Test Supabase Connection

```typescript
// In browser console or test file
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data, error } = await supabase.from('services').select('*')
console.log(data) // Should show dental services
```

### Test WhatsApp Flow

1. Send a message to the clinic WhatsApp number: "مرحبا"
2. Verify n8n workflow receives the webhook
3. Check response is sent back via Evolution API

### Test Dashboard

1. Create a test staff account:
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO staff (user_id, name, role)
   SELECT id, 'Test Admin', 'admin'
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```
2. Log in to the dashboard
3. Verify you can see the appointments page

---

## 7. Development Workflow

### Code Structure

```
src/
├── app/                 # Next.js pages
├── components/          # React components
│   ├── ui/             # shadcn/ui (don't modify)
│   └── [feature]/      # Feature components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configs
└── types/              # TypeScript types
```

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Building for Production

```bash
pnpm build
```

---

## 8. Common Issues

### "relation does not exist" Error
- Ensure migrations have been applied
- Check you're connected to the correct database

### WhatsApp Messages Not Received
- Verify Evolution API webhook is configured
- Check n8n workflow is active
- Verify Evolution API instance is connected

### AI Agent Not Responding
- Check OpenAI API key is valid
- Verify n8n AI Agent node has correct model selected
- Check for rate limiting

### RTL Layout Issues
- Ensure `dir="rtl"` is set on html element for Arabic
- Use Tailwind `rtl:` variants for directional styles

---

## 9. Deployment Checklist

- [ ] Supabase project created and migrations applied
- [ ] Environment variables configured in Vercel/hosting
- [ ] n8n workflows imported and credentials configured
- [ ] Evolution API connected and webhook set
- [ ] Supabase webhooks configured for n8n
- [ ] Initial services and schedule seeded
- [ ] Admin user created
- [ ] SSL/HTTPS enabled for all endpoints
- [ ] Test end-to-end booking flow

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [n8n Documentation](https://docs.n8n.io)
- [Evolution API Docs](https://doc.evolution-api.com)
- [OpenAI API Reference](https://platform.openai.com/docs)
