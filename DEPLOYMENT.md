# Production Deployment Checklist

## Pre-Deployment

### Environment Variables (Vercel)
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - For server-side operations
- [x] `EVOLUTION_API_URL` - Evolution API URL (https://evapi-evolution-api.g7zoro.easypanel.host)
- [x] `EVOLUTION_API_KEY` - Evolution API authentication key
- [x] `EVOLUTION_INSTANCE` - WhatsApp instance name (010)
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL (https://mr-hmid.vercel.app)

### Supabase Configuration
- [x] Database migrations applied
- [x] RLS policies enabled
- [x] pgvector extension enabled
- [x] Database functions created
- [x] Default services and schedule seeded
- [x] Admin user created
- [x] Webhook triggers for appointment status changes

### Evolution API (WhatsApp)
- [x] Evolution API instance connected (instance: 010)
- [x] WhatsApp number linked: n8n بالعربي (201027555789)
- [x] API integrated directly in Next.js API routes

## Architecture

### WhatsApp Message Flow

```
Patient sends WhatsApp message
         ↓
   Evolution API
         ↓
   Webhook to Next.js API
         ↓
   Supabase (store message)
         ↓
   Dashboard shows pending appointment
         ↓
Staff clicks Confirm/Cancel
         ↓
   Next.js API
         ↓
   Evolution API sends WhatsApp notification
```

### API Routes
- `POST /api/webhooks/evolution` - Receives incoming WhatsApp messages
- `POST /api/webhooks/n8n/appointment-confirmed` - Sends confirmation WhatsApp
- `POST /api/webhooks/n8n/appointment-cancelled` - Sends cancellation WhatsApp

## Deployment Steps

### 1. Vercel Deployment
```bash
# Already deployed to: https://mr-hmid.vercel.app
vercel deploy --prod
```

### 2. Configure Evolution API Webhook
In Evolution API Manager (https://evapi-evolution-api.g7zoro.easypanel.host/manager/):
1. Select instance "010"
2. Set webhook URL: `https://mr-hmid.vercel.app/api/webhooks/evolution`
3. Enable events: `MESSAGES_UPSERT`

## Post-Deployment Verification

### Dashboard Access
- [ ] Login works with `admin@clinic.com`
- [ ] Dashboard loads correctly
- [ ] RTL layout displays properly

### Core Features
- [ ] View appointments list and calendar
- [ ] Create new appointment
- [ ] Change appointment status
- [ ] View patient list
- [ ] View patient details
- [ ] Manage clinic schedule
- [ ] Manage blocked dates
- [ ] Manage knowledge base

### WhatsApp Integration
- [ ] Incoming messages processed
- [ ] Appointment confirmations sent via WhatsApp
- [ ] Cancellation notifications sent via WhatsApp

## Monitoring

### Vercel
- Check deployment logs: https://vercel.com/n8narabic-1472s-projects/mr-hmid

### Supabase
- Check auth logs for login issues
- Check database logs for query errors

### Evolution API
- Check instance status: https://evapi-evolution-api.g7zoro.easypanel.host/manager/

## Rollback

If issues occur:
```bash
# Revert to previous deployment
vercel rollback
```

## URLs

- **Production**: https://mr-hmid.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard/project/rmlfovshkdilhktbuxlx
- **Vercel Dashboard**: https://vercel.com/n8narabic-1472s-projects/mr-hmid
- **Evolution API Manager**: https://evapi-evolution-api.g7zoro.easypanel.host/manager/
