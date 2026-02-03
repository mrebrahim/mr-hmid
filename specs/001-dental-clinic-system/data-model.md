# Data Model: Dental Clinic Appointment Management System

**Feature**: 001-dental-clinic-system
**Date**: 2026-02-02
**Database**: Supabase PostgreSQL with pgvector extension

## Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│     staff       │       │    patients      │       │    services     │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)          │       │ id (PK)         │
│ user_id (FK)    │       │ name             │       │ name            │
│ name            │       │ phone (UNIQUE)   │       │ name_ar         │
│ role            │       │ email            │       │ description     │
│ phone           │       │ notes            │       │ price           │
│ is_active       │       │ created_at       │       │ duration_minutes│
│ created_at      │       │ updated_at       │       │ is_active       │
└────────┬────────┘       └────────┬─────────┘       └────────┬────────┘
         │                         │                          │
         │ manages                 │ has many                 │ booked as
         ▼                         ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            appointments                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                  │
│ patient_id (FK) ──────────────────────────────────────────► patients    │
│ service_id (FK) ──────────────────────────────────────────► services    │
│ appointment_date                                                         │
│ appointment_time                                                         │
│ duration_minutes                                                         │
│ status (pending|confirmed|completed|cancelled|no_show)                   │
│ notes                                                                    │
│ reminded                                                                 │
│ cancelled_by                                                             │
│ created_at, updated_at, confirmed_at, cancelled_at                      │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ linked to
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           conversations                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                  │
│ patient_id (FK) ──────────────────────────────────────────► patients    │
│ message                                                                  │
│ sender (patient|ai_agent)                                                │
│ message_type                                                             │
│ whatsapp_message_id                                                      │
│ created_at                                                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│ clinic_schedule │       │  blocked_dates   │       │  knowledge_base │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)          │       │ id (PK)         │
│ day_of_week     │       │ blocked_date     │       │ title           │
│ start_time      │       │ reason           │       │ content         │
│ end_time        │       │ created_at       │       │ category        │
│ is_active       │       └──────────────────┘       │ embedding       │
│ slot_duration   │                                  │ is_active       │
└─────────────────┘                                  │ created_at      │
                                                     │ updated_at      │
                                                     └─────────────────┘
```

---

## Table Definitions

### 1. patients

Stores patient contact information and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | TEXT | NOT NULL | Patient full name |
| `phone` | TEXT | UNIQUE, NOT NULL | WhatsApp phone number (E.164 format) |
| `email` | TEXT | NULL | Optional email address |
| `notes` | TEXT | NULL | Staff notes about the patient |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Indexes**:
- `patients_phone_idx` UNIQUE on `phone`

**Validation Rules**:
- Phone must be in E.164 format (+971501234567)
- Name cannot be empty

---

### 2. services

Defines dental services offered by the clinic.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | TEXT | NOT NULL | Service name (English) |
| `name_ar` | TEXT | NOT NULL | Service name (Arabic) |
| `description` | TEXT | NULL | Service description |
| `price` | DECIMAL(10,2) | NULL | Price in local currency |
| `duration_minutes` | INTEGER | DEFAULT 30 | Appointment duration |
| `is_active` | BOOLEAN | DEFAULT true | Whether service is available |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |

**Validation Rules**:
- Duration must be positive (> 0)
- Price must be non-negative if set

---

### 3. appointments

Core appointment records linking patients to services.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `patient_id` | UUID | REFERENCES patients(id), NOT NULL | Patient reference |
| `service_id` | UUID | REFERENCES services(id), NOT NULL | Service reference |
| `appointment_date` | DATE | NOT NULL | Date of appointment |
| `appointment_time` | TIME | NOT NULL | Start time of appointment |
| `duration_minutes` | INTEGER | DEFAULT 30 | Actual duration (may differ from service) |
| `status` | TEXT | CHECK constraint, DEFAULT 'pending' | Appointment status |
| `notes` | TEXT | NULL | Staff notes |
| `reminded` | BOOLEAN | DEFAULT false | Whether reminder was sent |
| `cancelled_by` | TEXT | NULL | 'assistant', 'patient', or null |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `confirmed_at` | TIMESTAMPTZ | NULL | When status changed to confirmed |
| `cancelled_at` | TIMESTAMPTZ | NULL | When status changed to cancelled |

**Status Values**: `pending`, `confirmed`, `completed`, `cancelled`, `no_show`

**Indexes**:
- `appointments_patient_id_idx` on `patient_id`
- `appointments_date_idx` on `appointment_date`
- `appointments_status_idx` on `status`
- `appointments_date_time_idx` on `(appointment_date, appointment_time)`

**State Transitions**:
```
pending ──► confirmed ──► completed
   │            │
   │            ▼
   └──────► cancelled
            no_show
```

**Validation Rules**:
- Appointment date cannot be in the past (on create)
- Time must be within clinic working hours
- No overlapping appointments for same time slot

---

### 4. conversations

Stores WhatsApp message history for patient communication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `patient_id` | UUID | REFERENCES patients(id), NOT NULL | Patient reference |
| `message` | TEXT | NOT NULL | Message content |
| `sender` | TEXT | CHECK constraint, NOT NULL | Message sender |
| `message_type` | TEXT | DEFAULT 'text' | Type: text, image, audio, etc. |
| `whatsapp_message_id` | TEXT | NULL | Evolution API message ID |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Message timestamp |

**Sender Values**: `patient`, `ai_agent`

**Indexes**:
- `conversations_patient_id_idx` on `patient_id`
- `conversations_created_at_idx` on `created_at DESC`

---

### 5. clinic_schedule

Defines clinic operating hours for each day of the week.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `day_of_week` | INTEGER | CHECK (0-6), NOT NULL | 0=Sunday, 6=Saturday |
| `start_time` | TIME | NOT NULL | Opening time |
| `end_time` | TIME | NOT NULL | Closing time |
| `is_active` | BOOLEAN | DEFAULT true | Whether clinic is open this day |
| `slot_duration_minutes` | INTEGER | DEFAULT 30 | Default slot duration |

**Indexes**:
- `clinic_schedule_day_idx` UNIQUE on `day_of_week`

**Validation Rules**:
- end_time must be after start_time
- day_of_week must be 0-6
- slot_duration must be positive

---

### 6. blocked_dates

Stores dates when the clinic is closed (holidays, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `blocked_date` | DATE | UNIQUE, NOT NULL | The blocked date |
| `reason` | TEXT | NULL | Reason for closure |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |

**Indexes**:
- `blocked_dates_date_idx` UNIQUE on `blocked_date`

---

### 7. knowledge_base

Stores FAQ and clinic information for the AI agent's RAG system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `title` | TEXT | NOT NULL | Entry title/question |
| `content` | TEXT | NOT NULL | Entry content/answer |
| `category` | TEXT | NULL | Category for organization |
| `embedding` | VECTOR(1536) | NULL | Semantic embedding for search |
| `is_active` | BOOLEAN | DEFAULT true | Whether entry is active |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Category Values**: `faq`, `service`, `policy`, `general`

**Indexes**:
- `knowledge_base_embedding_idx` using ivfflat on `embedding` with `vector_cosine_ops`
- `knowledge_base_category_idx` on `category`
- `knowledge_base_active_idx` on `is_active`

---

### 8. staff

Stores clinic staff members with their roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `user_id` | UUID | REFERENCES auth.users(id), UNIQUE | Supabase Auth user reference |
| `name` | TEXT | NOT NULL | Staff member name |
| `role` | TEXT | CHECK constraint, NOT NULL | Staff role |
| `phone` | TEXT | NULL | Contact phone number |
| `is_active` | BOOLEAN | DEFAULT true | Whether staff is active |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |

**Role Values**: `admin`, `assistant`, `doctor`

**Indexes**:
- `staff_user_id_idx` UNIQUE on `user_id`
- `staff_role_idx` on `role`

---

## Row Level Security (RLS) Policies

### patients
- **SELECT**: Staff can view all patients
- **INSERT**: Staff can create patients (AI agent via service role)
- **UPDATE**: Staff can update patients
- **DELETE**: Disabled (soft delete via is_active flag not implemented)

### appointments
- **SELECT**: Staff can view all appointments
- **INSERT**: Staff and service role (n8n) can create
- **UPDATE**: Staff can update
- **DELETE**: Disabled (use status=cancelled)

### conversations
- **SELECT**: Staff can view all conversations
- **INSERT**: Service role only (n8n)
- **UPDATE**: Disabled
- **DELETE**: Disabled

### knowledge_base
- **SELECT**: All authenticated users (needed for RAG)
- **INSERT/UPDATE/DELETE**: Admin role only

### clinic_schedule, blocked_dates, services
- **SELECT**: All authenticated users
- **INSERT/UPDATE/DELETE**: Admin role only

### staff
- **SELECT**: All authenticated users
- **INSERT/UPDATE/DELETE**: Admin role only

---

## Database Functions

### get_available_slots(date, service_id)

Returns available appointment slots for a given date and service.

```sql
CREATE OR REPLACE FUNCTION get_available_slots(
  p_date DATE,
  p_service_id UUID
)
RETURNS TABLE (slot_time TIME, slot_end TIME)
AS $$
  -- Implementation queries clinic_schedule, blocked_dates, and appointments
  -- Returns time slots not blocked and not already booked
$$
LANGUAGE sql;
```

### search_knowledge_base(query_embedding, limit)

Performs semantic search on knowledge base entries.

```sql
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
)
RETURNS TABLE (id UUID, title TEXT, content TEXT, similarity FLOAT)
AS $$
  SELECT id, title, content, 1 - (embedding <=> query_embedding) as similarity
  FROM knowledge_base
  WHERE is_active = true
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$
LANGUAGE sql;
```

---

## Triggers

### update_updated_at

Updates `updated_at` timestamp on row modification.

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to: patients, appointments, knowledge_base
```

### set_confirmed_at

Sets `confirmed_at` when appointment status changes to confirmed.

```sql
CREATE OR REPLACE FUNCTION set_appointment_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at = now();
  END IF;
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Initial Seed Data

### Default Clinic Schedule
```sql
INSERT INTO clinic_schedule (day_of_week, start_time, end_time, is_active) VALUES
(0, '09:00', '18:00', true),  -- Sunday
(1, '09:00', '18:00', true),  -- Monday
(2, '09:00', '18:00', true),  -- Tuesday
(3, '09:00', '18:00', true),  -- Wednesday
(4, '09:00', '18:00', true),  -- Thursday
(5, '09:00', '13:00', true),  -- Friday (half day)
(6, '00:00', '00:00', false); -- Saturday (closed)
```

### Default Services
```sql
INSERT INTO services (name, name_ar, duration_minutes, price) VALUES
('Dental Checkup', 'فحص الأسنان', 30, 150),
('Teeth Cleaning', 'تنظيف الأسنان', 45, 200),
('Tooth Filling', 'حشو الأسنان', 60, 300),
('Root Canal', 'علاج العصب', 90, 800),
('Tooth Extraction', 'خلع الأسنان', 30, 250),
('Teeth Whitening', 'تبييض الأسنان', 60, 500),
('Dental X-Ray', 'أشعة سينية', 15, 100);
```

### Default Knowledge Base Entries
```sql
INSERT INTO knowledge_base (title, content, category) VALUES
('Working Hours', 'The clinic is open Sunday to Thursday from 9 AM to 6 PM, Friday from 9 AM to 1 PM, and closed on Saturday.', 'general'),
('ساعات العمل', 'العيادة مفتوحة من الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً، الجمعة من 9 صباحاً حتى 1 ظهراً، ومغلقة يوم السبت.', 'general'),
('Emergency Appointments', 'For dental emergencies, please call the clinic directly. We reserve slots for urgent cases.', 'policy');
```
