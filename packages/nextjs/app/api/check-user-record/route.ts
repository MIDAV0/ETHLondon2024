// pages/api/checkUser.ts
import { NextResponse } from "next/server";
import supabase from "../../../services/supabaseClient";

// Adjust the path as necessary

export default async function GET(request: Request) {
  const res = await request.json(); // res now contains body

  // Ensure all required fields are provided
  if (!res.address) {
    return NextResponse.json({ status: 400, data: { error: "Error querying database" } });
  }

  const { data, error } = await supabase.from("users").select("*").eq("address", res.address);

  if (error) {
    console.error("Error querying database:", error);
    return NextResponse.json({ status: 500, data: { error: "Error querying database" } });
  }

  // Successfully queried record
  return NextResponse.json({ status: 200, data: { code: "success", detail: data } });
}
