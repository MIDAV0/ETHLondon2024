import { NextApiRequest, NextApiResponse } from 'next';
import supabase from './supabaseClient';

async function createUserRecord(nullifier_hash: string, verified: boolean, address: string) {
  const { error } = await supabase
    .from('users')
    .insert([{ nullifier_hash, verified, address }]);
  return { error };
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { nullifier_hash, verified, address } = req.body;
    const { error } = await createUserRecord(nullifier_hash, verified, address);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ status: 'success' });
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

// if (process.env.NODE_ENV !== 'production') {
//   const sampleData = {
//     nullifier_hash: 'sample_hash',
//     verified: true,
//     address: 'sample_address',
//   };
//   createUserRecord(sampleData.nullifier_hash, sampleData.verified, sampleData.address).then(({ error }) => {
//     if (error) {
//       console.error('An error occurred:', error.message);
//     } else {
//       console.log('User created successfully');
//     }
//   });
// }