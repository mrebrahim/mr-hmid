export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
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
          patient_name: string | null;
          patient_phone: string | null;
          purpose: string | null;
        };
        Insert: {
          id?: string;
          patient_id?: string | null;
          service_id?: string | null;
          appointment_date: string;
          appointment_time: string;
          duration_minutes?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          notes?: string | null;
          reminded?: boolean;
          cancelled_by?: 'assistant' | 'patient' | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          patient_name?: string | null;
          patient_phone?: string | null;
          purpose?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string | null;
          service_id?: string | null;
          appointment_date?: string;
          appointment_time?: string;
          duration_minutes?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
          notes?: string | null;
          reminded?: boolean;
          cancelled_by?: 'assistant' | 'patient' | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          patient_name?: string | null;
          patient_phone?: string | null;
          purpose?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'appointments_patient_id_fkey';
            columns: ['patient_id'];
            referencedRelation: 'patients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'appointments_service_id_fkey';
            columns: ['service_id'];
            referencedRelation: 'services';
            referencedColumns: ['id'];
          }
        ];
      };
      blocked_dates: {
        Row: {
          id: string;
          blocked_date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocked_date: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          blocked_date?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      clinic_schedule: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          slot_duration_minutes: number;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          slot_duration_minutes?: number;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          slot_duration_minutes?: number;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          patient_id: string;
          message: string;
          sender: 'patient' | 'ai_agent';
          message_type: string;
          whatsapp_message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          message: string;
          sender: 'patient' | 'ai_agent';
          message_type?: string;
          whatsapp_message_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          message?: string;
          sender?: 'patient' | 'ai_agent';
          message_type?: string;
          whatsapp_message_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_patient_id_fkey';
            columns: ['patient_id'];
            referencedRelation: 'patients';
            referencedColumns: ['id'];
          }
        ];
      };
      knowledge_base: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: 'faq' | 'service' | 'policy' | 'general' | null;
          embedding: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: 'faq' | 'service' | 'policy' | 'general' | null;
          embedding?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: 'faq' | 'service' | 'policy' | 'general' | null;
          embedding?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          name_ar: string;
          description: string | null;
          price: number | null;
          duration_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_ar: string;
          description?: string | null;
          price?: number | null;
          duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_ar?: string;
          description?: string | null;
          price?: number | null;
          duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          role: 'admin' | 'assistant' | 'doctor';
          phone: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          role: 'admin' | 'assistant' | 'doctor';
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          role?: 'admin' | 'assistant' | 'doctor';
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      get_available_slots: {
        Args: {
          p_date: string;
          p_service_id?: string;
        };
        Returns: {
          slot_time: string;
          slot_end: string;
        }[];
      };
      search_knowledge_base: {
        Args: {
          query_embedding: string;
          match_count?: number;
        };
        Returns: {
          id: string;
          title: string;
          content: string;
          category: string;
          similarity: number;
        }[];
      };
      get_appointments_for_reminder: {
        Args: Record<string, never>;
        Returns: {
          appointment_id: string;
          patient_id: string;
          patient_name: string;
          patient_phone: string;
          service_name: string;
          service_name_ar: string;
          appointment_date: string;
          appointment_time: string;
        }[];
      };
      get_conversation_history: {
        Args: {
          p_patient_id: string;
          p_limit?: number;
        };
        Returns: {
          message: string;
          sender: string;
          created_at: string;
        }[];
      };
    };
    Enums: {};
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Convenience types
export type Patient = Tables<'patients'>;
export type Service = Tables<'services'>;
export type Appointment = Tables<'appointments'>;
export type Conversation = Tables<'conversations'>;
export type ClinicSchedule = Tables<'clinic_schedule'>;
export type BlockedDate = Tables<'blocked_dates'>;
export type KnowledgeBase = Tables<'knowledge_base'>;
export type Staff = Tables<'staff'>;

export type AppointmentStatus = Appointment['status'];
export type StaffRole = Staff['role'];
export type KnowledgeBaseCategory = NonNullable<KnowledgeBase['category']>;
