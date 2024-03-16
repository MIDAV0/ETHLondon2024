import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Next.js API route
export default async function checkUserRecord(req, res) {
  const { address } = req.query;

  // Query the user's verification status from the Supabase database
  const { data, error } = await supabase
    .from('users') // replace with your table name
    .select('verified') // select the 'verified' column
    .eq('address', address); // where address equals the provided address 

  if (error) {
    console.error('Error reading from database:', error);
    return res.status(500).json({ error: 'An error occurred while fetching data.' });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({ user: data[0] });
}