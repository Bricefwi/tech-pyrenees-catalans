export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_criteria: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          max_score: number
          name: string
          order_index: number
          sector_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_score?: number
          name: string
          order_index: number
          sector_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_score?: number
          name?: string
          order_index?: number
          sector_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_criteria_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "audit_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_questions: {
        Row: {
          created_at: string | null
          criterion_id: string
          id: string
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          criterion_id: string
          id?: string
          options?: Json | null
          order_index: number
          question_text: string
          question_type?: string
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          criterion_id?: string
          id?: string
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_questions_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "audit_criteria"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_recommendations: {
        Row: {
          audit_id: string
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          sector: string
          title: string
          tools_suggested: Json | null
        }
        Insert: {
          audit_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          sector: string
          title: string
          tools_suggested?: Json | null
        }
        Update: {
          audit_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          sector?: string
          title?: string
          tools_suggested?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_recommendations_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_responses: {
        Row: {
          audit_id: string
          created_at: string | null
          criterion: string
          id: string
          question_id: string
          question_text: string
          response: string | null
          score: number | null
          sector: string
        }
        Insert: {
          audit_id: string
          created_at?: string | null
          criterion: string
          id?: string
          question_id: string
          question_text: string
          response?: string | null
          score?: number | null
          sector: string
        }
        Update: {
          audit_id?: string
          created_at?: string | null
          criterion?: string
          id?: string
          question_id?: string
          question_text?: string
          response?: string | null
          score?: number | null
          sector?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_responses_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_sectors: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      audited_companies: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          sector: string
          size: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          sector: string
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          sector?: string
          size?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audits: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_question_index: number | null
          current_sector: string | null
          global_score: number | null
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_question_index?: number | null
          current_sector?: string | null
          global_score?: number | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_question_index?: number | null
          current_sector?: string | null
          global_score?: number | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "audited_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_conversations: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          id: string
          messages: Json
          service_request_id: string | null
          updated_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          service_request_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          service_request_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_conversations_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      intervention_dates: {
        Row: {
          created_at: string | null
          created_by: string
          duration_hours: number | null
          id: string
          notes: string | null
          scheduled_date: string
          service_request_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          duration_hours?: number | null
          id?: string
          notes?: string | null
          scheduled_date: string
          service_request_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          duration_hours?: number | null
          id?: string
          notes?: string | null
          scheduled_date?: string
          service_request_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intervention_dates_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_admin: boolean | null
          read: boolean | null
          sender_id: string
          service_request_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          read?: boolean | null
          sender_id: string
          service_request_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          read?: boolean | null
          sender_id?: string
          service_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_sector: string | null
          company_address: string | null
          company_name: string | null
          created_at: string | null
          email: string
          first_name: string | null
          full_name: string
          id: string
          is_professional: boolean | null
          last_name: string | null
          mobile_phone: string | null
          phone: string | null
          profile_completed: boolean | null
          siret_siren: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_sector?: string | null
          company_address?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          full_name: string
          id?: string
          is_professional?: boolean | null
          last_name?: string | null
          mobile_phone?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          siret_siren?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_sector?: string | null
          company_address?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          full_name?: string
          id?: string
          is_professional?: boolean | null
          last_name?: string | null
          mobile_phone?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          siret_siren?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          service_request_id: string
          status: string | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          service_request_id: string
          status?: string | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          service_request_id?: string
          status?: string | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      sector_scores: {
        Row: {
          audit_id: string
          created_at: string | null
          id: string
          max_score: number
          score: number
          sector: string
        }
        Insert: {
          audit_id: string
          created_at?: string | null
          id?: string
          max_score: number
          score: number
          sector: string
        }
        Update: {
          audit_id?: string
          created_at?: string | null
          id?: string
          max_score?: number
          score?: number
          sector?: string
        }
        Relationships: [
          {
            foreignKeyName: "sector_scores_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          business_sector: string | null
          client_user_id: string | null
          created_at: string | null
          description: string | null
          device_info: Json | null
          estimated_cost: number | null
          estimated_duration: string | null
          id: string
          priority: string
          profile_id: string | null
          service_type: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          business_sector?: string | null
          client_user_id?: string | null
          created_at?: string | null
          description?: string | null
          device_info?: Json | null
          estimated_cost?: number | null
          estimated_duration?: string | null
          id?: string
          priority?: string
          profile_id?: string | null
          service_type: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          business_sector?: string | null
          client_user_id?: string | null
          created_at?: string | null
          description?: string | null
          device_info?: Json | null
          estimated_cost?: number | null
          estimated_duration?: string | null
          id?: string
          priority?: string
          profile_id?: string | null
          service_type?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client"],
    },
  },
} as const
