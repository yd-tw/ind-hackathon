import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session")?.value;
    if (sessionCookie) {
      return NextResponse.json({ isLoggedIn: true });
    }
    return NextResponse.json({ isLoggedIn: false });
  } catch (error: any) {
    console.error("Fetch 錯誤:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
