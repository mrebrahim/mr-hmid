# Feature Specification: Dental Clinic Appointment Management System

**Feature Branch**: `001-dental-clinic-system`
**Created**: 2026-02-02
**Status**: Draft
**Input**: User description: "Dental Clinic Appointment Management System combining Next.js dashboard with n8n automation workflows and WhatsApp AI integration for appointment booking, notifications, and patient communication"

## Overview

A comprehensive dental clinic management system designed to streamline appointment scheduling and patient communication. The system consists of two integrated components:

1. **Admin Dashboard** - A web-based interface for clinic staff (assistants and administrators) to manage appointments, patients, schedules, and clinic knowledge base
2. **WhatsApp AI Agent** - An automated conversational assistant that handles patient inquiries, appointment bookings, and notifications through WhatsApp

The system supports Arabic language (RTL) as the primary interface language for patient-facing communications.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Patient Books Appointment via WhatsApp (Priority: P1)

A patient sends a WhatsApp message to the clinic's number requesting an appointment. The AI agent understands their request, checks availability, and creates a pending appointment. The patient receives confirmation once the clinic assistant approves.

**Why this priority**: This is the core value proposition - enabling 24/7 appointment booking through WhatsApp reduces phone call volume and improves patient access. Without this, the system has no primary function.

**Independent Test**: Can be fully tested by sending a WhatsApp message to book an appointment and verifying the appointment appears in the system with "pending" status.

**Acceptance Scenarios**:

1. **Given** a patient sends "I want to book a cleaning appointment for next Monday", **When** the AI agent processes the message, **Then** the agent responds with available time slots for the requested day and service type
2. **Given** a patient selects a time slot from the options provided, **When** the AI agent receives the selection, **Then** a new appointment is created with status "pending" and the patient receives a confirmation that their request is being processed
3. **Given** a new patient (phone number not in system) sends a booking request, **When** the AI agent processes the message, **Then** a new patient record is created automatically using the phone number
4. **Given** a patient requests an appointment outside clinic working hours, **When** the AI agent checks availability, **Then** the agent responds with the next available slots during working hours

---

### User Story 2 - Assistant Manages Appointments via Dashboard (Priority: P1)

A clinic assistant logs into the dashboard to view, confirm, cancel, or reschedule appointments. They can see today's schedule at a glance and take action on pending bookings.

**Why this priority**: Without staff ability to manage appointments, the booking system cannot function. This is equally critical as the patient booking flow.

**Independent Test**: Can be fully tested by logging in, viewing the appointment list, and changing an appointment status from "pending" to "confirmed".

**Acceptance Scenarios**:

1. **Given** an assistant is logged in and views the appointments page, **When** there are pending appointments, **Then** they see a list showing patient name, service, date/time, and status with action buttons
2. **Given** an assistant clicks "Confirm" on a pending appointment, **When** the status changes, **Then** the appointment status updates to "confirmed" and the patient receives a WhatsApp notification
3. **Given** an assistant clicks "Cancel" on an appointment, **When** the status changes, **Then** the appointment status updates to "cancelled" and the patient receives a WhatsApp notification with alternative available slots
4. **Given** an assistant views the calendar view, **When** they select a specific day, **Then** they see all appointments for that day organized by time

---

### User Story 3 - Patient Receives Appointment Reminder (Priority: P2)

Patients with confirmed appointments receive an automated WhatsApp reminder 24 hours before their scheduled time, with the option to confirm or cancel.

**Why this priority**: Reminders reduce no-shows significantly, directly impacting clinic efficiency. However, the system can function without reminders initially.

**Independent Test**: Can be tested by creating a confirmed appointment for tomorrow and verifying the reminder message is sent.

**Acceptance Scenarios**:

1. **Given** a patient has a confirmed appointment scheduled for tomorrow, **When** the reminder system runs, **Then** the patient receives a WhatsApp message with appointment details and confirmation prompt
2. **Given** a patient replies "yes" to a reminder, **When** the AI agent processes the response, **Then** the appointment remains confirmed and the conversation is logged
3. **Given** a patient replies "no" to a reminder, **When** the AI agent processes the response, **Then** the system offers available alternative slots for rescheduling
4. **Given** a patient has already been reminded for an appointment, **When** the reminder system runs again, **Then** no duplicate reminder is sent

---

### User Story 4 - Patient Asks General Questions via WhatsApp (Priority: P2)

A patient sends a WhatsApp message asking about clinic services, prices, working hours, or other general information. The AI agent responds using the clinic's knowledge base.

**Why this priority**: Answering FAQs reduces staff workload and improves patient experience, but the core booking functionality works without it.

**Independent Test**: Can be tested by sending a question like "What are your working hours?" and verifying an accurate response from the knowledge base.

**Acceptance Scenarios**:

1. **Given** a patient asks "What services do you offer?", **When** the AI agent processes the question, **Then** the agent responds with a list of available dental services from the knowledge base
2. **Given** a patient asks "How much does teeth whitening cost?", **When** the AI agent processes the question, **Then** the agent responds with the service price if available in the knowledge base
3. **Given** a patient asks about clinic location or contact information, **When** the AI agent processes the question, **Then** the agent responds with the clinic profile information
4. **Given** a patient asks a question not covered in the knowledge base, **When** the AI agent cannot find relevant information, **Then** the agent politely indicates it cannot answer and suggests contacting the clinic directly

---

### User Story 5 - Assistant Manages Clinic Schedule (Priority: P2)

A clinic administrator sets up the weekly working hours, appointment slot durations, and blocks specific dates (holidays, staff absence).

**Why this priority**: Schedule management is essential for accurate availability, but default schedules can be used initially.

**Independent Test**: Can be tested by setting working hours for a day and verifying that appointment slots reflect those hours.

**Acceptance Scenarios**:

1. **Given** an administrator accesses the schedule management page, **When** they set Monday working hours as 9:00 AM to 5:00 PM, **Then** only time slots within those hours are offered for Monday appointments
2. **Given** an administrator blocks a specific date (e.g., a holiday), **When** a patient tries to book for that date, **Then** the system indicates the clinic is closed and offers alternative dates
3. **Given** an administrator sets different slot durations per service type, **When** patients book appointments, **Then** the correct duration is reserved for each service

---

### User Story 6 - Patient Cancels or Reschedules via WhatsApp (Priority: P3)

A patient with an existing appointment sends a WhatsApp message requesting to cancel or reschedule. The AI agent processes the request and updates the appointment.

**Why this priority**: Important for patient convenience but patients can also call the clinic to make changes.

**Independent Test**: Can be tested by sending a cancellation request for an existing appointment and verifying the status changes.

**Acceptance Scenarios**:

1. **Given** a patient says "I need to cancel my appointment tomorrow", **When** the AI agent processes the request, **Then** the agent finds the patient's upcoming appointment and asks for confirmation
2. **Given** a patient confirms cancellation, **When** the AI agent processes the confirmation, **Then** the appointment status changes to "cancelled" and the patient receives confirmation
3. **Given** a patient says "I need to reschedule my appointment", **When** the AI agent processes the request, **Then** the agent offers available alternative time slots

---

### User Story 7 - No-Show Follow-up (Priority: P3)

When a patient misses their appointment (marked as no-show by staff), they automatically receive a follow-up WhatsApp message offering to reschedule.

**Why this priority**: Helpful for re-engaging patients but not critical for core operations.

**Independent Test**: Can be tested by marking an appointment as "no-show" and verifying the follow-up message is sent.

**Acceptance Scenarios**:

1. **Given** an assistant marks an appointment as "no-show", **When** the status changes, **Then** the patient receives a WhatsApp message asking if they'd like to reschedule
2. **Given** a no-show patient replies with interest in rescheduling, **When** the AI agent processes the response, **Then** available time slots are offered

---

### User Story 8 - Administrator Manages Knowledge Base (Priority: P3)

A clinic administrator adds, edits, or removes FAQ entries, service descriptions, and clinic policies that the AI agent uses to answer patient questions.

**Why this priority**: Enhances AI responses but the system can work with a default/minimal knowledge base initially.

**Independent Test**: Can be tested by adding a new FAQ entry and verifying the AI agent uses it to answer relevant questions.

**Acceptance Scenarios**:

1. **Given** an administrator adds a new FAQ entry about "emergency appointments", **When** a patient asks about emergencies, **Then** the AI agent responds using the new information
2. **Given** an administrator updates a service price, **When** a patient asks about that service's cost, **Then** the AI agent provides the updated price
3. **Given** an administrator deactivates a knowledge base entry, **When** the AI agent searches for information, **Then** the deactivated entry is not used in responses

---

### User Story 9 - Staff Views Patient History (Priority: P3)

A clinic assistant views a patient's profile including their appointment history and past WhatsApp conversations to provide better service.

**Why this priority**: Improves service quality but not required for basic operations.

**Independent Test**: Can be tested by viewing a patient profile and verifying their appointment history and conversation logs are displayed.

**Acceptance Scenarios**:

1. **Given** an assistant opens a patient's profile, **When** the page loads, **Then** they see the patient's contact information, appointment history, and any notes
2. **Given** an assistant views the conversation history, **When** there are past WhatsApp exchanges, **Then** they see the message thread between the patient and AI agent

---

### User Story 10 - Dashboard Real-time Updates (Priority: P4)

When appointments are created or modified (via WhatsApp or by other staff), the dashboard updates in real-time without requiring page refresh.

**Why this priority**: Nice-to-have feature that improves user experience but staff can manually refresh.

**Independent Test**: Can be tested by having one user create an appointment while another user watches the dashboard for automatic updates.

**Acceptance Scenarios**:

1. **Given** an assistant has the dashboard open, **When** a new appointment is created via WhatsApp, **Then** the appointment appears on their screen without refreshing
2. **Given** an assistant has the appointments list open, **When** another staff member changes an appointment status, **Then** the status badge updates automatically

---

### Edge Cases

- What happens when two patients try to book the same time slot simultaneously? The first confirmed booking takes the slot; the second patient is offered alternative times.
- How does the system handle WhatsApp messages in languages other than Arabic? The AI agent should attempt to understand and respond, defaulting to Arabic if unsure.
- What happens when the clinic's WhatsApp connection is lost? Incoming messages queue until connection is restored; dashboard shows connection status warning.
- How does the system handle appointment conflicts when staff manually creates an appointment for an already-booked slot? The system warns the staff member about the conflict before allowing the booking.
- What happens when a patient sends media (images, voice notes) instead of text? The AI agent acknowledges receipt and requests the patient to describe their request in text.
- How does the system handle multiple appointments for the same patient on the same day? Allowed, with each appointment tracked separately.
- What happens when a patient sends a message outside of the AI's capabilities? The AI gracefully indicates it cannot help with that request and suggests contacting the clinic directly.

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization
- **FR-001**: System MUST require staff authentication before accessing the dashboard
- **FR-002**: System MUST support role-based access with at least two roles: administrator and assistant
- **FR-003**: Administrators MUST be able to manage staff accounts
- **FR-004**: Assistants MUST be able to view and manage appointments but NOT access administrative settings

#### Patient Management
- **FR-005**: System MUST automatically create a patient record when a new phone number sends a WhatsApp message
- **FR-006**: System MUST store patient name, phone number (unique identifier), email (optional), and notes
- **FR-007**: Staff MUST be able to view patient profiles with appointment history
- **FR-008**: Staff MUST be able to add notes to patient records
- **FR-009**: System MUST store WhatsApp conversation history linked to patient records

#### Appointment Management
- **FR-010**: System MUST support appointment statuses: pending, confirmed, completed, cancelled, no_show
- **FR-011**: System MUST store appointment date, time, duration, service type, patient reference, and notes
- **FR-012**: Staff MUST be able to confirm pending appointments (triggering notification)
- **FR-013**: Staff MUST be able to cancel appointments (triggering notification with alternatives)
- **FR-014**: Staff MUST be able to mark appointments as completed or no-show
- **FR-015**: System MUST track who cancelled an appointment (staff or patient)
- **FR-016**: System MUST prevent double-booking of the same time slot (warn staff if attempting)
- **FR-017**: Staff MUST be able to create appointments manually through the dashboard
- **FR-018**: Staff MUST be able to edit appointment details (date, time, service, notes)

#### Schedule Management
- **FR-019**: Administrators MUST be able to set clinic working hours for each day of the week
- **FR-020**: Administrators MUST be able to block specific dates (holidays, closures)
- **FR-021**: System MUST respect working hours when calculating available appointment slots
- **FR-022**: System MUST respect blocked dates when calculating availability
- **FR-023**: Administrators MUST be able to set default appointment slot duration
- **FR-024**: Administrators MUST be able to set different durations per service type

#### Services Management
- **FR-025**: Administrators MUST be able to define clinic services with name (Arabic and English), description, price, and duration
- **FR-026**: Services MUST be able to be activated or deactivated
- **FR-027**: Deactivated services MUST NOT appear in booking options

#### WhatsApp AI Agent
- **FR-028**: System MUST receive and process incoming WhatsApp messages
- **FR-029**: AI agent MUST understand appointment booking requests and extract: preferred date/time, service type
- **FR-030**: AI agent MUST check appointment availability before offering slots
- **FR-031**: AI agent MUST create appointments with "pending" status when patient confirms a slot
- **FR-032**: AI agent MUST understand cancellation and rescheduling requests
- **FR-033**: AI agent MUST answer general inquiries using the knowledge base
- **FR-034**: AI agent MUST maintain conversation context within a session
- **FR-035**: AI agent MUST respond in Arabic for patient communications
- **FR-036**: System MUST send appointment confirmation notifications when status changes to "confirmed"
- **FR-037**: System MUST send cancellation notifications with alternative slots when status changes to "cancelled"
- **FR-038**: System MUST send no-show follow-up messages when status changes to "no_show"
- **FR-039**: System MUST send appointment reminders 24 hours before confirmed appointments
- **FR-040**: System MUST track which appointments have been reminded to prevent duplicates

#### Knowledge Base
- **FR-041**: Administrators MUST be able to create, edit, and delete knowledge base entries
- **FR-042**: Knowledge base entries MUST have title, content, and category (FAQ, service, policy, general)
- **FR-043**: Knowledge base entries MUST be able to be activated or deactivated
- **FR-044**: AI agent MUST search the knowledge base to answer patient questions
- **FR-045**: System MUST use semantic search to find relevant knowledge base entries

#### Dashboard Views
- **FR-046**: Dashboard home MUST display today's appointment summary (total, by status)
- **FR-047**: Dashboard home MUST display this week's and this month's statistics
- **FR-048**: Dashboard home MUST display a recent activity feed
- **FR-049**: Appointments page MUST support calendar view (weekly/daily)
- **FR-050**: Appointments page MUST support list view with filters (date range, status, patient search)
- **FR-051**: Dashboard MUST display appointment cards with patient info, service, time, status, and action buttons
- **FR-052**: Dashboard MUST support sending custom WhatsApp messages to patients

#### Settings & Configuration
- **FR-053**: Administrators MUST be able to configure clinic profile (name, address, phone)
- **FR-054**: Dashboard MUST display WhatsApp connection status
- **FR-055**: Dashboard MUST display automation workflow status

#### Localization
- **FR-056**: Dashboard MUST support Arabic language with RTL layout
- **FR-057**: Patient-facing WhatsApp messages MUST be in Arabic
- **FR-058**: Dashboard MUST support switching between Arabic and English

### Key Entities

- **Patient**: Represents a clinic patient. Contains contact information (phone as unique identifier, name, email), notes, and relationships to their appointments and conversation history.

- **Appointment**: Represents a scheduled clinic visit. Contains date, time, duration, service type, status (pending/confirmed/completed/cancelled/no_show), notes, reminder tracking, and references to the patient and service.

- **Conversation**: Represents a WhatsApp message in the chat history. Contains message text, sender type (patient or AI), timestamp, and reference to the patient.

- **Clinic Schedule**: Represents the clinic's operating hours. Contains day of week, start time, end time, active status, and slot duration.

- **Blocked Date**: Represents a date when the clinic is closed. Contains the date and optional reason.

- **Service**: Represents a dental service offered. Contains name (Arabic and English), description, price, duration, and active status.

- **Staff**: Represents clinic staff members. Contains name, role (admin/assistant/doctor), contact info, and active status.

- **Knowledge Base Entry**: Represents information for the AI agent. Contains title, content, category, active status, and semantic embedding for search.

## Assumptions

1. **WhatsApp Business Account**: The clinic has or will obtain a WhatsApp Business API account for automated messaging
2. **Single Clinic**: This system is designed for a single dental clinic location (not multi-branch)
3. **Single Doctor**: Appointments are not assigned to specific doctors; there is one dentist or appointments are pooled
4. **Time Zone**: The clinic operates in a single time zone (Gulf Standard Time assumed for Arabic-speaking region)
5. **Appointment Slots**: Appointments are booked in discrete time slots, not arbitrary times
6. **No Payment Processing**: The system does not handle payments; patients pay at the clinic
7. **No Medical Records**: The system manages appointments only, not dental records or treatment history
8. **Staff Access**: All staff access the dashboard from the clinic network or authorized devices
9. **Message Language**: Primary patient communication is in Arabic; the AI agent defaults to Arabic
10. **Working Hours**: Typical dental clinic hours (e.g., 9 AM - 6 PM, closed Fridays or Sundays depending on region)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Patients can book an appointment through WhatsApp in under 3 messages (request, slot selection, confirmation)
- **SC-002**: Staff can confirm or cancel an appointment in under 3 clicks from the dashboard
- **SC-003**: 90% of patient inquiries receive a relevant response from the AI agent without human intervention
- **SC-004**: Appointment reminder delivery rate is above 95% (messages sent successfully)
- **SC-005**: No-show rate decreases by 25% compared to baseline (measured after 3 months)
- **SC-006**: System handles 500 appointments per month without performance degradation
- **SC-007**: Staff onboarding time is under 30 minutes to learn basic dashboard operations
- **SC-008**: Dashboard loads and displays today's appointments in under 3 seconds
- **SC-009**: AI agent responds to patient messages within 5 seconds on average
- **SC-010**: 95% of scheduled notifications (confirmations, reminders, cancellations) are delivered within 1 minute of trigger
- **SC-011**: System supports 10 concurrent dashboard users without slowdown
- **SC-012**: Patient data and conversation history is retained for at least 2 years
