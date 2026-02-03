# n8n Workflow Specifications

**Feature**: 001-dental-clinic-system
**Date**: 2026-02-02

This document specifies the n8n automation workflows for the Dental Clinic Management System.

---

## Overview

| # | Workflow Name | Trigger | Purpose |
|---|---------------|---------|---------|
| 1 | WhatsApp Message Handler | Evolution API Webhook | Process incoming patient messages with AI |
| 2 | Appointment Confirmation | Supabase Webhook | Send confirmation when appointment confirmed |
| 3 | Appointment Cancellation | Supabase Webhook | Send cancellation with alternatives |
| 4 | No-Show Follow-up | Supabase Webhook | Send follow-up when marked as no-show |
| 5 | Appointment Reminder | Cron (hourly) | Send reminders 24h before appointments |

---

## Workflow 1: WhatsApp Message Handler

### Trigger
**Evolution API Webhook** - Incoming message event

```json
{
  "event": "messages.upsert",
  "instance": "clinic-instance",
  "data": {
    "key": {
      "remoteJid": "971501234567@s.whatsapp.net",
      "fromMe": false,
      "id": "ABC123"
    },
    "message": {
      "conversation": "أريد حجز موعد تنظيف الأسنان يوم الاثنين"
    }
  }
}
```

### Flow

```
┌─────────────────┐
│ Webhook Trigger │
│ (Evolution API) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Phone & │
│ Message Text    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Query Supabase  │────►│ Patient Exists? │
│ patients table  │     └────────┬────────┘
└─────────────────┘              │
                          ┌──────┴──────┐
                          │             │
                         YES           NO
                          │             │
                          ▼             ▼
                    ┌──────────┐  ┌──────────────┐
                    │ Get      │  │ Create New   │
                    │ Patient  │  │ Patient      │
                    └────┬─────┘  └──────┬───────┘
                         │               │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Query Conversation     │
                    │ History (last 10 msgs) │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │ Query Knowledge Base   │
                    │ (semantic search)      │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │ AI Agent Node          │
                    │ (OpenAI GPT-4)         │
                    │                        │
                    │ Tools:                 │
                    │ - check_availability   │
                    │ - create_appointment   │
                    │ - cancel_appointment   │
                    │ - search_knowledge     │
                    └───────────┬────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
        ┌────────────────┐     ┌────────────────────┐
        │ If Booking:    │     │ Save Conversation  │
        │ Create Appt    │     │ (patient msg)      │
        │ in Supabase    │     └──────────┬─────────┘
        └────────┬───────┘                │
                 │                        │
                 └────────────┬───────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │ Send AI Response via   │
                 │ Evolution API          │
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │ Save Conversation      │
                 │ (AI response)          │
                 └────────────────────────┘
```

### AI Agent Configuration

**System Prompt**:
```
أنت مساعد افتراضي لعيادة أسنان. مهمتك هي:
1. مساعدة المرضى في حجز المواعيد
2. الإجابة على الاستفسارات العامة عن العيادة
3. معالجة طلبات الإلغاء وإعادة الجدولة

قواعد مهمة:
- رد دائماً باللغة العربية
- كن مهذباً ومهنياً
- إذا طلب المريض حجز موعد، اسأل عن:
  * الخدمة المطلوبة
  * التاريخ المفضل
  * الوقت المفضل
- إذا لم يكن الوقت متاحاً، اقترح بدائل
- للأسئلة خارج نطاق عملك، اعتذر بلطف واقترح الاتصال بالعيادة مباشرة

ساعات العمل: الأحد-الخميس 9 ص - 6 م، الجمعة 9 ص - 1 م، السبت مغلق
```

**Tools**:

1. `check_availability`
   - Input: `{ date: string, service_id?: string }`
   - Action: Call Supabase RPC `get_available_slots`
   - Output: Array of available time slots

2. `create_appointment`
   - Input: `{ patient_id: string, service_id: string, date: string, time: string }`
   - Action: INSERT into appointments with status='pending'
   - Output: Appointment ID and confirmation message

3. `cancel_appointment`
   - Input: `{ patient_id: string, appointment_id?: string }`
   - Action: UPDATE appointment status='cancelled', cancelled_by='patient'
   - Output: Cancellation confirmation

4. `search_knowledge`
   - Input: `{ query: string }`
   - Action: Generate embedding, call `search_knowledge_base` RPC
   - Output: Relevant knowledge base content

---

## Workflow 2: Appointment Confirmation

### Trigger
**Supabase Webhook** - appointments table UPDATE where status changed to 'confirmed'

```json
{
  "type": "UPDATE",
  "table": "appointments",
  "record": {
    "id": "uuid",
    "status": "confirmed",
    "patient_id": "uuid",
    "service_id": "uuid",
    "appointment_date": "2026-02-05",
    "appointment_time": "10:00:00"
  },
  "old_record": {
    "status": "pending"
  }
}
```

### Flow

```
┌─────────────────┐
│ Supabase        │
│ Webhook Trigger │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Filter: status  │
│ = 'confirmed'   │
│ AND old_status  │
│ != 'confirmed'  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Patient   │
│ Details         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Service   │
│ Details         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Format Message  │
│ (Arabic)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send WhatsApp   │
│ via Evolution   │
└─────────────────┘
```

### Message Template

```
✅ تم تأكيد موعدك

📅 التاريخ: {{ $json.appointment_date | formatDate('dddd, D MMMM YYYY', 'ar') }}
⏰ الوقت: {{ $json.appointment_time | formatTime('h:mm A', 'ar') }}
🏥 الخدمة: {{ $json.service.name_ar }}

نتطلع لزيارتك!

للإلغاء أو إعادة الجدولة، راسلنا هنا.
```

---

## Workflow 3: Appointment Cancellation

### Trigger
**Supabase Webhook** - appointments table UPDATE where status changed to 'cancelled'

### Flow

```
┌─────────────────┐
│ Supabase        │
│ Webhook Trigger │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Filter: status  │
│ = 'cancelled'   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Patient & │
│ Service Details │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Next 3    │
│ Available Slots │
│ (RPC call)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Format Message  │
│ with Slots      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send WhatsApp   │
│ via Evolution   │
└─────────────────┘
```

### Message Template

```
نعتذر، تم إلغاء موعدك يوم {{ $json.appointment_date | formatDate('dddd D MMMM', 'ar') }}

هل تريد حجز موعد آخر؟ إليك بعض المواعيد المتاحة:

1️⃣ {{ $json.slots[0].date }} الساعة {{ $json.slots[0].time }}
2️⃣ {{ $json.slots[1].date }} الساعة {{ $json.slots[1].time }}
3️⃣ {{ $json.slots[2].date }} الساعة {{ $json.slots[2].time }}

رد برقم الموعد المناسب لك أو اكتب تاريخاً آخر.
```

---

## Workflow 4: No-Show Follow-up

### Trigger
**Supabase Webhook** - appointments table UPDATE where status changed to 'no_show'

### Flow

```
┌─────────────────┐
│ Supabase        │
│ Webhook Trigger │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Filter: status  │
│ = 'no_show'     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Patient & │
│ Service Details │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Next 3    │
│ Available Slots │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Format Message  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send WhatsApp   │
│ via Evolution   │
└─────────────────┘
```

### Message Template

```
مرحباً {{ $json.patient.name }}،

لاحظنا عدم حضورك لموعدك يوم {{ $json.appointment_date | formatDate('dddd D MMMM', 'ar') }}

نتمنى أن تكون بخير 🙏

هل تود إعادة جدولة الموعد؟ إليك المواعيد المتاحة:

1️⃣ {{ $json.slots[0].date }} الساعة {{ $json.slots[0].time }}
2️⃣ {{ $json.slots[1].date }} الساعة {{ $json.slots[1].time }}
3️⃣ {{ $json.slots[2].date }} الساعة {{ $json.slots[2].time }}

رد برقم الموعد لتأكيد الحجز الجديد.
```

---

## Workflow 5: Appointment Reminder

### Trigger
**Cron Schedule** - Every hour at minute 0

```
0 * * * *
```

### Flow

```
┌─────────────────┐
│ Cron Trigger    │
│ (hourly)        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Query Supabase:                     │
│ SELECT * FROM appointments          │
│ WHERE status = 'confirmed'          │
│ AND reminded = false                │
│ AND appointment_date = tomorrow     │
│ AND appointment_time BETWEEN        │
│     now() AND now() + 1 hour        │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────┐
│ Loop: For each  │
│ appointment     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Query Patient   │
│ & Service       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Format Reminder │
│ Message         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send WhatsApp   │
│ via Evolution   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update Supabase │
│ reminded = true │
└─────────────────┘
```

### Message Template

```
تذكير: لديك موعد غداً 📅

📅 {{ $json.appointment_date | formatDate('dddd D MMMM', 'ar') }}
⏰ الساعة {{ $json.appointment_time | formatTime('h:mm A', 'ar') }}
🏥 {{ $json.service.name_ar }}

هل ستحضر؟
رد بـ "نعم" للتأكيد أو "لا" لإعادة الجدولة.
```

---

## Environment Variables

All workflows require these credentials configured in n8n:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Service role key (bypasses RLS) |
| `EVOLUTION_API_URL` | Evolution API instance URL |
| `EVOLUTION_API_KEY` | Evolution API authentication key |
| `EVOLUTION_INSTANCE` | WhatsApp instance name |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 |

---

## Error Handling

All workflows implement:

1. **Retry Logic**: 3 retries with exponential backoff for API calls
2. **Error Logging**: Failed operations logged to `workflow_errors` table in Supabase
3. **Fallback**: If WhatsApp send fails, log error but don't block subsequent operations
4. **Timeout**: 30-second timeout for AI agent operations

### Error Log Schema

```sql
CREATE TABLE workflow_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name TEXT NOT NULL,
  error_message TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Testing

### Manual Testing Checklist

- [ ] Send booking request in Arabic, verify appointment created
- [ ] Send booking request in English, verify Arabic response
- [ ] Request unavailable time, verify alternatives offered
- [ ] Confirm appointment in dashboard, verify WhatsApp sent
- [ ] Cancel appointment in dashboard, verify message with alternatives
- [ ] Mark appointment as no-show, verify follow-up sent
- [ ] Wait for reminder time, verify reminder sent
- [ ] Verify no duplicate reminders sent

### Test Scenarios

1. **New Patient Booking**
   - Input: New phone number requests appointment
   - Expected: Patient created, appointment created, confirmation sent

2. **Existing Patient Booking**
   - Input: Known phone requests appointment
   - Expected: Uses existing patient record, appointment created

3. **Slot Conflict**
   - Input: Request for already-booked slot
   - Expected: AI offers alternative slots

4. **FAQ Query**
   - Input: "What are your working hours?"
   - Expected: AI responds with schedule from knowledge base
