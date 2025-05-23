export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          initial_balance: number
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          name: string
          type: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          name?: string
          type?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      clients_suppliers: {
        Row: {
          created_at: string
          id: string
          name: string
          observations: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          observations?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          observations?: string | null
          type?: string
        }
        Relationships: []
      }
      payable_accounts: {
        Row: {
          category_id: string
          created_at: string
          due_date: string
          id: string
          installment_type: string
          installments: number | null
          is_paid: boolean
          observations: string | null
          paid_date: string | null
          parent_id: string | null
          recurrence_count: number | null
          recurrence_type: string | null
          supplier_id: string
          value: number
        }
        Insert: {
          category_id: string
          created_at?: string
          due_date: string
          id?: string
          installment_type: string
          installments?: number | null
          is_paid?: boolean
          observations?: string | null
          paid_date?: string | null
          parent_id?: string | null
          recurrence_count?: number | null
          recurrence_type?: string | null
          supplier_id: string
          value: number
        }
        Update: {
          category_id?: string
          created_at?: string
          due_date?: string
          id?: string
          installment_type?: string
          installments?: number | null
          is_paid?: boolean
          observations?: string | null
          paid_date?: string | null
          parent_id?: string | null
          recurrence_count?: number | null
          recurrence_type?: string | null
          supplier_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payable_accounts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payable_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "payable_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payable_accounts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "clients_suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      receivable_accounts: {
        Row: {
          category_id: string
          client_id: string
          created_at: string
          due_date: string
          id: string
          installment_type: string
          installments: number | null
          is_received: boolean
          observations: string | null
          parent_id: string | null
          received_date: string | null
          recurrence_count: number | null
          recurrence_type: string | null
          value: number
        }
        Insert: {
          category_id: string
          client_id: string
          created_at?: string
          due_date: string
          id?: string
          installment_type: string
          installments?: number | null
          is_received?: boolean
          observations?: string | null
          parent_id?: string | null
          received_date?: string | null
          recurrence_count?: number | null
          recurrence_type?: string | null
          value: number
        }
        Update: {
          category_id?: string
          client_id?: string
          created_at?: string
          due_date?: string
          id?: string
          installment_type?: string
          installments?: number | null
          is_received?: boolean
          observations?: string | null
          parent_id?: string | null
          received_date?: string | null
          recurrence_count?: number | null
          recurrence_type?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "receivable_accounts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivable_accounts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivable_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "receivable_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          category_id: string
          client_supplier_id: string
          created_at: string
          id: string
          observations: string | null
          payment_date: string
          source_id: string | null
          source_type: string
          type: string
          value: number
        }
        Insert: {
          category_id: string
          client_supplier_id: string
          created_at?: string
          id?: string
          observations?: string | null
          payment_date: string
          source_id?: string | null
          source_type: string
          type: string
          value: number
        }
        Update: {
          category_id?: string
          client_supplier_id?: string
          created_at?: string
          id?: string
          observations?: string | null
          payment_date?: string
          source_id?: string | null
          source_type?: string
          type?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_supplier_id_fkey"
            columns: ["client_supplier_id"]
            isOneToOne: false
            referencedRelation: "clients_suppliers"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
