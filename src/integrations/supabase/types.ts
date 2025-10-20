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
      ai_proposals: {
        Row: {
          business_sector: string | null
          client_user_id: string
          company_id: string | null
          created_at: string | null
          created_by: string
          id: string
          profile_id: string | null
          proposal_number: string | null
          proposals: string
          service_request_id: string
          service_type: string
          specifications: string
          title: string
          updated_at: string | null
        }
        Insert: {
          business_sector?: string | null
          client_user_id: string
          company_id?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          profile_id?: string | null
          proposal_number?: string | null
          proposals: string
          service_request_id: string
          service_type: string
          specifications: string
          title: string
          updated_at?: string | null
        }
        Update: {
          business_sector?: string | null
          client_user_id?: string
          company_id?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          profile_id?: string | null
          proposal_number?: string | null
          proposals?: string
          service_request_id?: string
          service_type?: string
          specifications?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_proposals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_proposals_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      analyses: {
        Row: {
          contenu: Json
          created_at: string | null
          id: string
          profile_id: string | null
          service_request_id: string | null
          updated_at: string | null
        }
        Insert: {
          contenu: Json
          created_at?: string | null
          id?: string
          profile_id?: string | null
          service_request_id?: string | null
          updated_at?: string | null
        }
        Update: {
          contenu?: Json
          created_at?: string | null
          id?: string
          profile_id?: string | null
          service_request_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analyses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_questions: {
        Row: {
          created_at: string | null
          id: string
          order_index: number
          question_text: string
          response_type: string
          sector_id: string
          subdomain: string
          weighting: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_index: number
          question_text: string
          response_type: string
          sector_id: string
          subdomain: string
          weighting: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_index?: number
          question_text?: string
          response_type?: string
          sector_id?: string
          subdomain?: string
          weighting?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_questions_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "audit_sectors"
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
          id: string
          question_id: string
          response_value: string
          score: number | null
        }
        Insert: {
          audit_id: string
          created_at?: string | null
          id?: string
          question_id: string
          response_value: string
          score?: number | null
        }
        Update: {
          audit_id?: string
          created_at?: string | null
          id?: string
          question_id?: string
          response_value?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_responses_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "audit_questions"
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
          weighting: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index: number
          weighting: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number
          weighting?: number
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
          generated_report: string | null
          global_score: number | null
          id: string
          report_generated_at: string | null
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
          generated_report?: string | null
          global_score?: number | null
          id?: string
          report_generated_at?: string | null
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
          generated_report?: string | null
          global_score?: number | null
          id?: string
          report_generated_at?: string | null
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
      companies: {
        Row: {
          business_sector: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_individual: boolean | null
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          siret_siren: string | null
          street_address: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          business_sector?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_individual?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          siret_siren?: string | null
          street_address?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          business_sector?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_individual?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          siret_siren?: string | null
          street_address?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
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
      documents_reference: {
        Row: {
          category: string | null
          id: string
          path: string
          title: string
          uploaded_at: string | null
        }
        Insert: {
          category?: string | null
          id?: string
          path: string
          title: string
          uploaded_at?: string | null
        }
        Update: {
          category?: string | null
          id?: string
          path?: string
          title?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      emails_logs: {
        Row: {
          cc_admins: string[] | null
          created_at: string | null
          error_details: string | null
          id: string
          message: string | null
          pdf_url: string | null
          recipient: string
          related_profile: string | null
          related_request: string | null
          status: string | null
          subject: string
          type: string | null
        }
        Insert: {
          cc_admins?: string[] | null
          created_at?: string | null
          error_details?: string | null
          id?: string
          message?: string | null
          pdf_url?: string | null
          recipient: string
          related_profile?: string | null
          related_request?: string | null
          status?: string | null
          subject: string
          type?: string | null
        }
        Update: {
          cc_admins?: string[] | null
          created_at?: string | null
          error_details?: string | null
          id?: string
          message?: string | null
          pdf_url?: string | null
          recipient?: string
          related_profile?: string | null
          related_request?: string | null
          status?: string | null
          subject?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emails_logs_related_profile_fkey"
            columns: ["related_profile"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_logs_related_request_fkey"
            columns: ["related_request"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      faq: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          question: string
          reponse: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question: string
          reponse: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question?: string
          reponse?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faq_logs: {
        Row: {
          created_at: string | null
          id: string
          question: string
          reponse: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          question: string
          reponse?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          question?: string
          reponse?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      followups: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          project_id: string | null
          type: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          project_id?: string | null
          type?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          project_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "followups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "interventions"
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
      interventions: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          planning: Json | null
          quote_id: string | null
          report_pdf_url: string | null
          start_date: string | null
          status: string | null
          technician_id: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          planning?: Json | null
          quote_id?: string | null
          report_pdf_url?: string | null
          start_date?: string | null
          status?: string | null
          technician_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          planning?: Json | null
          quote_id?: string | null
          report_pdf_url?: string | null
          start_date?: string | null
          status?: string | null
          technician_id?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_user_id: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          notes: string | null
          order_id: string
          paid_at: string | null
          payment_method: string | null
          sent_at: string | null
          service_request_id: string
          status: string
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_user_id: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          order_id: string
          paid_at?: string | null
          payment_method?: string | null
          sent_at?: string | null
          service_request_id: string
          status?: string
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_user_id?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          notes?: string | null
          order_id?: string
          paid_at?: string | null
          payment_method?: string | null
          sent_at?: string | null
          service_request_id?: string
          status?: string
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_service_request_id_fkey"
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
      orders: {
        Row: {
          amount: number
          cancellation_reason: string | null
          cancelled_at: string | null
          client_user_id: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          order_number: string | null
          quote_id: string
          service_request_id: string
          started_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_user_id: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_number?: string | null
          quote_id: string
          service_request_id: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_user_id?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_number?: string | null
          quote_id?: string
          service_request_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_request_id_fkey"
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
          cgu_accepted: boolean | null
          cgu_accepted_at: string | null
          city: string | null
          company_id: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string
          first_name: string | null
          full_name: string
          id: string
          is_professional: boolean | null
          last_name: string | null
          mobile_phone: string | null
          phone: string | null
          postal_code: string | null
          profile_completed: boolean | null
          siret_siren: string | null
          street_address: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          business_sector?: string | null
          cgu_accepted?: boolean | null
          cgu_accepted_at?: string | null
          city?: string | null
          company_id?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          full_name: string
          id?: string
          is_professional?: boolean | null
          last_name?: string | null
          mobile_phone?: string | null
          phone?: string | null
          postal_code?: string | null
          profile_completed?: boolean | null
          siret_siren?: string | null
          street_address?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          business_sector?: string | null
          cgu_accepted?: boolean | null
          cgu_accepted_at?: string | null
          city?: string | null
          company_id?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          full_name?: string
          id?: string
          is_professional?: boolean | null
          last_name?: string | null
          mobile_phone?: string | null
          phone?: string | null
          postal_code?: string | null
          profile_completed?: boolean | null
          siret_siren?: string | null
          street_address?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_jalons: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          progress: number | null
          project_id: string | null
          responsible: string | null
          start_date: string | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          progress?: number | null
          project_id?: string | null
          responsible?: string | null
          start_date?: string | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          progress?: number | null
          project_id?: string | null
          responsible?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_jalons_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notes: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          project_id: string | null
          visibility: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          visibility?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string | null
          created_at: string | null
          critical_points: Json | null
          description: string | null
          end_date: string | null
          id: string
          profile_id: string | null
          progress: number | null
          request_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          critical_points?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          profile_id?: string | null
          progress?: number | null
          request_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          critical_points?: Json | null
          description?: string | null
          end_date?: string | null
          id?: string
          profile_id?: string | null
          progress?: number | null
          request_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          accepted_at: string | null
          amount: number
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          quote_number: string | null
          rejected_at: string | null
          rejection_reason: string | null
          sent_at: string | null
          service_request_id: string
          status: string | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          amount: number
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          quote_number?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          service_request_id: string
          status?: string | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          amount?: number
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          quote_number?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
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
      sector_comments: {
        Row: {
          audit_id: string
          comment: string | null
          created_at: string | null
          id: string
          sector_id: string
        }
        Insert: {
          audit_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          sector_id: string
        }
        Update: {
          audit_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          sector_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sector_comments_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sector_comments_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "audit_sectors"
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
          admin_ai_proposals: string | null
          admin_notes: string | null
          ai_specifications: string | null
          assigned_to: string | null
          business_sector: string | null
          client_user_id: string | null
          confirmed_date: string | null
          created_at: string | null
          date_status: string | null
          description: string | null
          device_info: Json | null
          estimated_cost: number | null
          estimated_duration: string | null
          id: string
          priority: string
          profile_id: string | null
          proposed_date: string | null
          quote_status: string | null
          request_number: string | null
          service_type: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          admin_ai_proposals?: string | null
          admin_notes?: string | null
          ai_specifications?: string | null
          assigned_to?: string | null
          business_sector?: string | null
          client_user_id?: string | null
          confirmed_date?: string | null
          created_at?: string | null
          date_status?: string | null
          description?: string | null
          device_info?: Json | null
          estimated_cost?: number | null
          estimated_duration?: string | null
          id?: string
          priority?: string
          profile_id?: string | null
          proposed_date?: string | null
          quote_status?: string | null
          request_number?: string | null
          service_type: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          admin_ai_proposals?: string | null
          admin_notes?: string | null
          ai_specifications?: string | null
          assigned_to?: string | null
          business_sector?: string | null
          client_user_id?: string | null
          confirmed_date?: string | null
          created_at?: string | null
          date_status?: string | null
          description?: string | null
          device_info?: Json | null
          estimated_cost?: number | null
          estimated_duration?: string | null
          id?: string
          priority?: string
          profile_id?: string | null
          proposed_date?: string | null
          quote_status?: string | null
          request_number?: string | null
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
      workflow_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ai_proposal_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_request_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
