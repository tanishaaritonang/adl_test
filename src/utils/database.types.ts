export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attempts: {
        Row: {
          id: string
          user_id: string
          item_id: string
          selected_answer: string | null
          ai_feedback: string | null
          is_correct: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          selected_answer?: string | null
          ai_feedback?: string | null
          is_correct?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          selected_answer?: string | null
          ai_feedback?: string | null
          is_correct?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'attempts_item_id_fkey'
            columns: ['item_id']
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attempts_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      items: {
        Row: {
          id: string
          module_id: string
          level: string
          type: string
          question_type: string
          question: string
          options: Json | null
          answer: string | null
          explanation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          level: string
          type: string
          question_type: string
          question: string
          options?: Json | null
          answer?: string | null
          explanation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          level?: string
          type?: string
          question_type?: string
          question?: string
          options?: Json | null
          answer?: string | null
          explanation?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'items_module_id_fkey'
            columns: ['module_id']
            referencedRelation: 'modules'
            referencedColumns: ['id']
          },
        ]
      }
      module_contents: {
        Row: {
          id: string
          module_id: string
          level: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          level: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          level?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'module_contents_module_id_fkey'
            columns: ['module_id']
            referencedRelation: 'modules'
            referencedColumns: ['id']
          },
        ]
      }
      modules: {
        Row: {
          id: string
          instructor_id: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          instructor_id: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          instructor_id?: string
          title?: string
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'modules_instructor_id_fkey'
            columns: ['instructor_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      placements: {
        Row: {
          id: string
          user_id: string
          module_id: string
          level: string
          score: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          level: string
          score?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          level?: string
          score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'placements_module_id_fkey'
            columns: ['module_id']
            referencedRelation: 'modules'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'placements_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          role: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          role?: string | null
          created_at?: string | null
        }
        Relationships: []
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
