import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session")?.value;
    console.log("Session Cookie:", sessionCookie);
    const res = await fetch("https://tronclass.ntou.edu.tw/api/todos", {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "X-SESSION-ID": sessionCookie || "",
      },
    });

    console.log("API 回應狀態:", res);

    if (!res.ok) {
      throw new Error(`API 回應錯誤: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Fetch 錯誤:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
