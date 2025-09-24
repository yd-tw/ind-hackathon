import { NextResponse } from "next/server";

export async function POST() {
  const response = new NextResponse(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  response.cookies.set("session", "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}
