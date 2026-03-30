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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements_cache: {
        Row: {
          current_streak: number
          last_7_days: Json
          longest_streak: number
          total_reads: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_7_days?: Json
          longest_streak?: number
          total_reads?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_7_days?: Json
          longest_streak?: number
          total_reads?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      engagement_events: {
        Row: {
          event_at: string
          event_day: string
          event_type: Database["public"]["Enums"]["engagement_event_type_enum"]
          id: string
          issue_id: string
          meta: Json | null
          newsletter_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          event_at?: string
          event_day?: string
          event_type: Database["public"]["Enums"]["engagement_event_type_enum"]
          id?: string
          issue_id: string
          meta?: Json | null
          newsletter_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          event_at?: string
          event_day?: string
          event_type?: Database["public"]["Enums"]["engagement_event_type_enum"]
          id?: string
          issue_id?: string
          meta?: Json | null
          newsletter_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engagement_events_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "newsletter_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "engagement_events_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_sources: {
        Row: {
          id: string
          issue_id: string
          published_at: string | null
          source_name: string
          title: string
          topic_key: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          id?: string
          issue_id: string
          published_at?: string | null
          source_name: string
          title: string
          topic_key: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          id?: string
          issue_id?: string
          published_at?: string | null
          source_name?: string
          title?: string
          topic_key?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_sources_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "newsletter_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_issues: {
        Row: {
          created_at: string
          delivered_at_utc: string | null
          error_message: string | null
          generation_status: Database["public"]["Enums"]["generation_status_enum"]
          html_body: string
          id: string
          newsletter_id: string
          scheduled_for_utc: string
          subject: string
          text_body: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at_utc?: string | null
          error_message?: string | null
          generation_status?: Database["public"]["Enums"]["generation_status_enum"]
          html_body: string
          id?: string
          newsletter_id: string
          scheduled_for_utc: string
          subject: string
          text_body: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at_utc?: string | null
          error_message?: string | null
          generation_status?: Database["public"]["Enums"]["generation_status_enum"]
          html_body?: string
          id?: string
          newsletter_id?: string
          scheduled_for_utc?: string
          subject?: string
          text_body?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_issues_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_topics: {
        Row: {
          allocated_seconds: number
          created_at: string
          id: string
          newsletter_id: string
          sort_order: number
          specific_details: string | null
          topic_key: string
          topic_label: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allocated_seconds: number
          created_at?: string
          id?: string
          newsletter_id: string
          sort_order?: number
          specific_details?: string | null
          topic_key: string
          topic_label: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allocated_seconds?: number
          created_at?: string
          id?: string
          newsletter_id?: string
          sort_order?: number
          specific_details?: string | null
          topic_key?: string
          topic_label?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_topics_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          created_at: string
          delivery_email: string
          frequency: Database["public"]["Enums"]["frequency_enum"]
          id: string
          is_paused: boolean
          last_sent_at_utc: string | null
          next_send_at_utc: string | null
          primary_goal: string | null
          read_time_minutes: number
          send_time_local: string
          timezone: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_email: string
          frequency: Database["public"]["Enums"]["frequency_enum"]
          id?: string
          is_paused?: boolean
          last_sent_at_utc?: string | null
          next_send_at_utc?: string | null
          primary_goal?: string | null
          read_time_minutes: number
          send_time_local: string
          timezone: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_email?: string
          frequency?: Database["public"]["Enums"]["frequency_enum"]
          id?: string
          is_paused?: boolean
          last_sent_at_utc?: string | null
          next_send_at_utc?: string | null
          primary_goal?: string | null
          read_time_minutes?: number
          send_time_local?: string
          timezone?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscription_tier: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          ended_at: string | null
          id: string
          started_at: string | null
          status: string
          stripe_subscription_id: string | null
          tier: string
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status: string
          stripe_subscription_id?: string | null
          tier: string
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_user_id_fkey"
            columns: ["user_id"]
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
      [_ in never]: never
    }
    Enums: {
      engagement_event_type_enum: "open" | "click" | "read_in_app"
      frequency_enum: "daily" | "mwf" | "weekly" | "biweekly" | "monthly"
      generation_status_enum: "queued" | "generated" | "sent" | "failed"
      subscription_status_enum:
        | "none"
        | "trialing"
        | "active"
        | "canceled"
        | "past_due"
      subscription_tier_enum: "basic" | "minimum" | "premium"
      theme_enum: "dark" | "light"
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
      engagement_event_type_enum: ["open", "click", "read_in_app"],
      frequency_enum: ["daily", "mwf", "weekly", "biweekly", "monthly"],
      generation_status_enum: ["queued", "generated", "sent", "failed"],
      subscription_status_enum: [
        "none",
        "trialing",
        "active",
        "canceled",
        "past_due",
      ],
      subscription_tier_enum: ["basic", "minimum", "premium"],
      theme_enum: ["dark", "light"],
    },
  },
} as const
