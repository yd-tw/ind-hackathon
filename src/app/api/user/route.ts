import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session")?.value;
    const res = await fetch("https://tronclass.ntou.edu.tw/user/index", {
      method: "GET",
      headers: {
        Accept: "text/html",
        "X-SESSION-ID": sessionCookie || "",
      },
    });

    const html = await res.text();

    // 找到 "var globalData =" 的位置
    const startIndex = html.indexOf("var globalData =");
    if (startIndex === -1) {
      return NextResponse.json(
        { error: "globalData not found" },
        { status: 404 },
      );
    }

    // 找到第一個 { 的位置
    const firstBrace = html.indexOf("{", startIndex);
    if (firstBrace === -1) {
      return NextResponse.json(
        { error: "globalData object not found" },
        { status: 404 },
      );
    }

    // 用堆疊方式配對大括號，直到找到正確的結尾 }
    let depth = 0;
    let endIndex = -1;
    for (let i = firstBrace; i < html.length; i++) {
      if (html[i] === "{") depth++;
      if (html[i] === "}") depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }

    if (endIndex === -1) {
      return NextResponse.json(
        { error: "globalData not closed" },
        { status: 500 },
      );
    }

    let raw = html.slice(firstBrace, endIndex + 1);

    // --- 清理成合法 JSON ---
    let jsonStr = raw
      .replace(/\bNone\b/g, "null") // None -> null
      .replace(/,\s*([}\]])/g, "$1") // 移除尾逗號
      .replace(/(\w+)\s*:/g, '"$1":'); // key: -> "key":

    const globalData = JSON.parse(jsonStr);

    return NextResponse.json(globalData.user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
