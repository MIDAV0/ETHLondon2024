// checkUserRecord.ts
import supabase from './supabaseClient';

export default async function checkUserRecord(req, res) {
  const { address } = req.query;

  // Query the user's verification status from the Supabase database
  const { data, error } = await supabase
    .from('users')
    .select('verified')
    .eq('address', address);

  if (error) {
    console.error('Error reading from database:', error);
    return res.status(500).json({ error: 'An error occurred while fetching data.' });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({ user: data[0] });
}