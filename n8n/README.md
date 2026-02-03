# n8n Workflows for Dental Clinic Management System

This directory contains the n8n automation workflows for the dental clinic system.

## Workflows Overview

| # | Workflow | File | Trigger | Purpose |
|---|----------|------|---------|---------|
| 1 | WhatsApp Message Handler | `01-whatsapp-message-handler.json` | Evolution API Webhook | Process incoming patient messages with AI |
| 2 | Appointment Confirmation | `02-appointment-confirmation.json` | Supabase Webhook | Send confirmation when appointment confirmed |
| 3 | Appointment Cancellation | `03-appointment-cancellation.json` | Supabase Webhook | Send cancellation with alternatives |
| 4 | No-Show Follow-up | `04-no-show-followup.json` | Supabase Webhook | Send follow-up when marked as no-show |
| 5 | Appointment Reminder | `05-appointment-reminder.json` | Cron (hourly) | Send reminders 24h before appointments |

## Setup Instructions

### 1. Import Workflows

1. Open your n8n instance
2. Go to Workflows > Import from File
3. Import each JSON file from this directory
4. Configure credentials (see below)

### 2. Required Credentials

Configure these credentials in n8n:

#### Supabase API
- **Type**: Supabase API
- **URL**: Your Supabase project URL
- **API Key**: Service Role Key (bypasses RLS)

#### Evolution API (HTTP Header Auth)
- **Type**: HTTP Header Auth
- **Header Name**: `apikey`
- **Header Value**: Your Evolution API key

#### OpenAI API
- **Type**: OpenAI API
- **API Key**: Your OpenAI API key

### 3. Environment Variables

Set these environment variables in n8n:

```
EVOLUTION_API_URL=https://your-evolution-instance.com
EVOLUTION_INSTANCE=clinic-instance
```

### 4. Configure Supabase Webhooks

For workflows 2, 3, and 4, create database webhooks in Supabase:

1. Go to Supabase Dashboard > Database > Webhooks
2. Create webhooks for the `appointments` table:

| Webhook | Event | n8n URL |
|---------|-------|---------|
| appointment-confirmed | UPDATE | `https://your-n8n/webhook/appointment-confirmed` |
| appointment-cancelled | UPDATE | `https://your-n8n/webhook/appointment-cancelled` |
| appointment-no-show | UPDATE | `https://your-n8n/webhook/appointment-no-show` |

### 5. Configure Evolution API Webhook

1. Access your Evolution API instance
2. Configure webhook for the `clinic-instance`:
   - URL: `https://your-n8n/webhook/whatsapp-incoming`
   - Events: `MESSAGES_UPSERT`

## Workflow Details

### Workflow 1: WhatsApp Message Handler

Handles incoming WhatsApp messages from patients:

1. Receives message via Evolution API webhook
2. Extracts phone number and message text
3. Looks up or creates patient record
4. Retrieves conversation history
5. Queries knowledge base for context
6. Sends to GPT-4 AI Agent with Arabic system prompt
7. Saves conversation (patient message + AI response)
8. Sends AI response back via WhatsApp

**AI Agent Tools**:
- `check_availability` - Query available slots
- `create_appointment` - Book new appointment
- `cancel_appointment` - Cancel existing appointment
- `search_knowledge` - Search clinic knowledge base

### Workflow 2: Appointment Confirmation

Triggered when an appointment status changes to `confirmed`:

1. Filters for status = confirmed AND old_status != confirmed
2. Queries patient and service details
3. Formats Arabic confirmation message
4. Sends via WhatsApp

### Workflow 3: Appointment Cancellation

Triggered when an appointment status changes to `cancelled`:

1. Filters for status = cancelled
2. Queries patient details
3. Fetches next 3 available slots
4. Formats Arabic cancellation message with alternatives
5. Sends via WhatsApp

### Workflow 4: No-Show Follow-up

Triggered when an appointment status changes to `no_show`:

1. Filters for status = no_show
2. Queries patient details
3. Fetches next 3 available slots
4. Formats empathetic Arabic follow-up message
5. Sends via WhatsApp

### Workflow 5: Appointment Reminder

Runs hourly to send reminders:

1. Queries confirmed appointments for tomorrow (not yet reminded)
2. Loops through each appointment
3. Formats Arabic reminder message
4. Sends via WhatsApp
5. Marks appointment as reminded

## Troubleshooting

### Messages not being received
- Verify Evolution API webhook is configured correctly
- Check n8n workflow is active
- Verify Evolution API instance is connected to WhatsApp

### AI Agent not responding
- Check OpenAI API key is valid
- Verify model is set to `gpt-4`
- Check for rate limiting

### Duplicate messages
- Ensure `whatsapp_message_id` is being saved for deduplication
- Check webhook is not triggering multiple times

## Testing

1. **Test WhatsApp flow**: Send "مرحبا" to the clinic WhatsApp number
2. **Test confirmation**: Confirm an appointment in the dashboard
3. **Test cancellation**: Cancel an appointment in the dashboard
4. **Test reminder**: Create an appointment for tomorrow and wait for the hourly cron
