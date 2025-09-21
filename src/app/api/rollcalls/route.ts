import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://tronclass.ntou.edu.tw/api/radar/rollcalls",
      {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "X-SESSION-ID": process.env.SESSION!,
        },
      },
    );

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
