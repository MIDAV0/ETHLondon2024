// pages/api/createUser.ts
import supabase from "./supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Supabase client (replace your_supabase_url and your_supabase_anon_key with your actual Supabase project details)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { nullifier_hash, verified, address } = req.body;
      // Ensure all required fields are provided
      if (!nullifier_hash || verified === undefined || !address) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { error } = await supabase.from("users").insert([{ nullifier_hash, verified, address }]);

      if (error) {
        console.error("Error inserting into database:", error);
        return res.status(500).json({ error: "Error inserting into database" });
      }

      // Successfully inserted record
      res.status(200).json({ message: "User record created successfully" });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    // Handle any requests that aren't POST
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
