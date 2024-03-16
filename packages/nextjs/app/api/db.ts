// db.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function createUserRecord(nullifier_hash: string, verified: boolean, address: string) {
  const { error } = await supabase
    .from('users')
    .insert([{ nullifier_hash, verified, address }]);
  
  if (error) {
    console.error('Error inserting into database:', error);
    throw error;
  }
}