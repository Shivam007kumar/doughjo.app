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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          belt_level: string
          dough_coins: number
          streak_days: number
          total_lessons_completed: number
          total_quizzes_completed: number
          current_streak_start: string | null
          longest_streak: number
          total_study_time: number
          achievements: Json
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          belt_level?: string
          dough_coins?: number
          streak_days?: number
          total_lessons_completed?: number
          total_quizzes_completed?: number
          current_streak_start?: string | null
          longest_streak?: number
          total_study_time?: number
          achievements?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          belt_level?: string
          dough_coins?: number
          streak_days?: number
          total_lessons_completed?: number
          total_quizzes_completed?: number
          current_streak_start?: string | null
          longest_streak?: number
          total_study_time?: number
          achievements?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          difficulty: string
          content: Json
          belt_required: string
          order_index: number
          estimated_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          difficulty: string
          content: Json
          belt_required?: string
          order_index: number
          estimated_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          content?: Json
          belt_required?: string
          order_index?: number
          estimated_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          question: string
          options: Json
          correct_answer: number
          category: string
          difficulty: string
          reward: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          question: string
          options: Json
          correct_answer: number
          category: string
          difficulty: string
          reward: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          question?: string
          options?: Json
          correct_answer?: number
          category?: string
          difficulty?: string
          reward?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          progress: number
          time_spent: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          progress?: number
          time_spent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          progress?: number
          time_spent?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          selected_answer: number
          is_correct: boolean
          time_taken: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          selected_answer: number
          is_correct: boolean
          time_taken?: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          selected_answer?: number
          is_correct?: boolean
          time_taken?: number
          completed_at?: string
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: string
          requirement: Json
          reward_coins: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          category: string
          requirement: Json
          reward_coins?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: string
          requirement?: Json
          reward_coins?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
          created_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          lesson_id: string | null
          quiz_id: string | null
          session_type: string
          duration: number
          completed: boolean
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id?: string | null
          quiz_id?: string | null
          session_type: string
          duration?: number
          completed?: boolean
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string | null
          quiz_id?: string | null
          session_type?: string
          duration?: number
          completed?: boolean
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
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
  }
}