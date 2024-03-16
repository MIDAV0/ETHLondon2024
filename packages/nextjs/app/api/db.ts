// db.ts
import supabase from './supabaseClient';

export async function createUserRecord(nullifier_hash: string, verified: boolean, address: string) {
  const { error } = await supabase
    .from('users')
    .insert([{ nullifier_hash, verified, address }]);

  if (error) {
    console.error('Error inserting into database:', error);
    throw error;
  }
}