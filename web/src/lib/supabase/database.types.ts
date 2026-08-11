/**
 * Types for the Sproutt schema (see supabase/migrations/0001_sproutt_init.sql).
 *
 * Hand-maintained. If you change the schema, either update this file or
 * regenerate it:
 *   npx supabase gen types typescript --project-id <your-project-ref> \
 *     > src/lib/supabase/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "refunded";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          trees_contributed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        // trees_contributed is intentionally absent: it's maintained by the
        // recalc triggers, and column grants stop clients writing it.
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          image_url: string | null;
          price_cents: number;
          currency: string;
          trees_per_unit: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          price_cents: number;
          currency?: string;
          trees_per_unit?: number;
          is_active?: boolean;
        };
        Update: Partial<{
          slug: string;
          name: string;
          description: string | null;
          image_url: string | null;
          price_cents: number;
          currency: string;
          trees_per_unit: number;
          is_active: boolean;
        }>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          total_cents: number;
          trees_total: number;
          created_at: string;
          updated_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: OrderStatus;
        };
        Update: Partial<{
          status: OrderStatus;
          paid_at: string | null;
        }>;
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price_cents: number;
          trees_per_unit: number;
          created_at: string;
        };
        // unit_price_cents / trees_per_unit are snapshotted server-side by the
        // order_items_snapshot trigger; anything sent from a client is ignored.
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
        };
        Update: Partial<{
          quantity: number;
        }>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      site_stats: {
        Row: { id: boolean; baseline_trees: number; updated_at: string };
        Insert: { id?: boolean; baseline_trees?: number };
        Update: Partial<{ baseline_trees: number }>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      global_trees_planted: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      my_impact: {
        Args: Record<PropertyKey, never>;
        Returns: {
          trees_contributed: number;
          orders_count: number;
          products_count: number;
        }[];
      };
    };
    Enums: {
      order_status: OrderStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
