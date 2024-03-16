// pages/api/checkUser.ts
import supabase from "./supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

// Adjust the path as necessary

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { address } = req.query;

      // Ensure the address is provided
      if (!address) {
        return res.status(400).json({ error: "Address query parameter is required" });
      }

      // Query the user's verification status from the Supabase database
      const { data, error } = await supabase.from("users").select("verified").eq("address", address);

      if (error) {
        console.error("Error reading from database:", error);
        return res.status(500).json({ error: "An error occurred while fetching data." });
      }

      if (data.length === 0) {
        return res.status(404).json({ error: "User not found." });
      }

      return res.status(200).json({ user: data[0] });
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    // Handle any requests that aren't GET
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
