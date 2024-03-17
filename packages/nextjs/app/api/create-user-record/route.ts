// pages/api/createUser.ts
import { NextResponse } from "next/server";
import supabase from "../../../services/supabaseClient";

// Initialize Supabase client (replace your_supabase_url and your_supabase_anon_key with your actual Supabase project details)

export default async function POST(request: Request) {
  const res = await request.json(); // res now contains body

  // Ensure all required fields are provided
  if (!res.nullifier_hash || res.verified === undefined || !res.address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { error } = await supabase.from("users").insert([res]);

  if (error) {
    console.error("Error inserting into database:", error);
    return res.status(500).json({ error: "Error inserting into database" });
  }

  // Successfully inserted record
  return NextResponse.json({ status: 200, data: { code: "success", detail: "User record created successfully" } });
}
