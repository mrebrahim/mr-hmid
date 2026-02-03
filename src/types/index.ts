/**
 * Shared TypeScript types for the dental clinic system
 */

export type {
  Patient,
  Service,
  Appointment,
  Conversation,
  ClinicSchedule,
  BlockedDate,
  KnowledgeBase,
  Staff,
  AppointmentStatus,
  StaffRole,
  KnowledgeBaseCategory,
  Database,
  Tables,
  InsertTables,
  UpdateTables,
} from '@/lib/supabase/types';

// Extended types with relations
export interface AppointmentWithRelations {
  id: string;
  patient_id: string | null;
  service_id: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  reminded: boolean;
  cancelled_by: 'assistant' | 'patient' | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  // Direct fields (from WhatsApp booking)
  patient_name: string | null;
  patient_phone: string | null;
  purpose: string | null;
  // Relations (optional - may be null for WhatsApp bookings)
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  } | null;
  service: {
    id: string;
    name: string;
    name_ar: string;
    duration_minutes: number;
    price: number | null;
  } | null;
}

export interface ConversationWithPatient {
  id: string;
  patient_id: string;
  message: string;
  sender: 'patient' | 'ai_agent';
  message_type: string;
  created_at: string;
  patient: {
    id: string;
    name: string;
    phone: string;
  };
}

// Dashboard stats
export interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalPatients: number;
  completedThisWeek: number;
}

// Time slot
export interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
}

// Form types
export interface AppointmentFormData {
  patient_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export interface PatientFormData {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface ServiceFormData {
  name: string;
  name_ar: string;
  description?: string;
  price?: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface ScheduleFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  slot_duration_minutes: number;
}

export interface BlockedDateFormData {
  blocked_date: string;
  reason?: string;
}

export interface KnowledgeBaseFormData {
  title: string;
  content: string;
  category: 'faq' | 'service' | 'policy' | 'general';
  is_active: boolean;
}

// Filter types
export interface AppointmentFilters {
  status?: string;
  date?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  patientId?: string;
  serviceId?: string;
}

export interface PatientFilters {
  search?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// WhatsApp/Evolution API types
export interface WhatsAppMessage {
  remoteJid: string;
  fromMe: boolean;
  id: string;
  message: string;
  timestamp: number;
}

export interface WhatsAppWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
    };
  };
}
