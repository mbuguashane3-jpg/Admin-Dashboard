import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn('⚠️  Supabase credentials not configured. Using mock data mode.');
}

// Mock client for development when Supabase is not configured
const createMockClient = () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Mock mode') })
      })
    })
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Mock mode') }),
    getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Mock mode') })
  }
});

// Client for public use (subject to RLS)
export const supabase = supabaseUrl && !supabaseUrl.includes('placeholder') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = supabaseUrl && !supabaseUrl.includes('placeholder')
  ? createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey)
  : createMockClient() as any;
