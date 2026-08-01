/**
 * Supabase şema tipleri — ÜRETİLMİŞ DOSYA, elle düzenleme.
 *
 * Yeniden üretmek için: `npm run gen:types`
 * (veya Supabase MCP · generate_typescript_types)
 *
 * Not: `products.warranty_end` aşağıda Insert/Update içinde görünüyor ama
 * veritabanında GENERATED ALWAYS kolondur — gövdeye eklersen Postgres hata
 * verir. Uygulama katmanı bu kolonu asla yazmaz.
 */

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
    PostgrestVersion: '14.15'
  }
  public: {
    Tables: {
      products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          id: string
          is_confirmed: boolean
          name: string
          notes: string | null
          price: number | null
          purchase_date: string
          receipt_id: string | null
          serial_number: string | null
          updated_at: string
          user_id: string
          warranty_end: string | null
          warranty_months: number
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_confirmed?: boolean
          name: string
          notes?: string | null
          price?: number | null
          purchase_date: string
          receipt_id?: string | null
          serial_number?: string | null
          updated_at?: string
          user_id: string
          warranty_end?: string | null
          warranty_months?: number
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_confirmed?: boolean
          name?: string
          notes?: string | null
          price?: number | null
          purchase_date?: string
          receipt_id?: string | null
          serial_number?: string | null
          updated_at?: string
          user_id?: string
          warranty_end?: string | null
          warranty_months?: number
        }
        Relationships: [
          {
            foreignKeyName: 'products_receipt_id_fkey'
            columns: ['receipt_id']
            isOneToOne: false
            referencedRelation: 'receipts'
            referencedColumns: ['id']
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          currency: string
          error_message: string | null
          file_path: string
          file_type: string | null
          id: string
          merchant: string | null
          processed_at: string | null
          purchase_date: string | null
          raw_ocr: Json | null
          retry_count: number
          status: string
          total_amount: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          error_message?: string | null
          file_path: string
          file_type?: string | null
          id?: string
          merchant?: string | null
          processed_at?: string | null
          purchase_date?: string | null
          raw_ocr?: Json | null
          retry_count?: number
          status?: string
          total_amount?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          error_message?: string | null
          file_path?: string
          file_type?: string | null
          id?: string
          merchant?: string | null
          processed_at?: string | null
          purchase_date?: string | null
          raw_ocr?: Json | null
          retry_count?: number
          status?: string
          total_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          id: string
          product_id: string
          sent_at: string
          threshold: string
          user_id: string
        }
        Insert: {
          id?: string
          product_id: string
          sent_at?: string
          threshold: string
          user_id: string
        }
        Update: {
          id?: string
          product_id?: string
          sent_at?: string
          threshold?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reminders_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reminders_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'v_products'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      v_products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string | null
          days_left: number | null
          file_path: string | null
          id: string | null
          is_confirmed: boolean | null
          merchant: string | null
          name: string | null
          notes: string | null
          price: number | null
          purchase_date: string | null
          receipt_id: string | null
          receipt_status: string | null
          serial_number: string | null
          user_id: string | null
          warranty_end: string | null
          warranty_months: number | null
          warranty_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'products_receipt_id_fkey'
            columns: ['receipt_id']
            isOneToOne: false
            referencedRelation: 'receipts'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      f_unaccent: { Args: { '': string }; Returns: string }
      get_due_reminders: {
        Args: never
        Returns: {
          brand: string
          days_left: number
          email: string
          merchant: string
          product_id: string
          product_name: string
          purchase_date: string
          threshold: string
          user_id: string
          warranty_end: string
        }[]
      }
      search_products: {
        Args: { q: string }
        Returns: {
          brand: string | null
          category: string | null
          created_at: string | null
          days_left: number | null
          file_path: string | null
          id: string | null
          is_confirmed: boolean | null
          merchant: string | null
          name: string | null
          notes: string | null
          price: number | null
          purchase_date: string | null
          receipt_id: string | null
          receipt_status: string | null
          serial_number: string | null
          user_id: string | null
          warranty_end: string | null
          warranty_months: number | null
          warranty_status: string | null
        }[]
        SetofOptions: {
          from: '*'
          to: 'v_products'
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
