import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Auth is now handled by Supabase. Use /login and /register pages." },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Auth is now handled by Supabase. Use /login and /register pages." },
    { status: 410 }
  );
}