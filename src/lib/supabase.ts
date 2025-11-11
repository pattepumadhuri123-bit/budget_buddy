import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Group = {
  id: string;
  name: string;
  code: string;
  created_at: string;
  created_by: string | null;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  group_id: string;
  member_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
};
