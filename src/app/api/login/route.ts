import { NextResponse } from "next/server";

const TRON = "https://tronclass.ntou.edu.tw";
const USER = process.env.TRON_USER || "";
const PASS = process.env.TRON_PASS || "";
const UA = process.env.TRON_UA || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

// 幾個 helper regex（與你的 Python PATTERN 對齊）
const PATTERN_HIDDEN = (name: string) =>
  new RegExp(`name=["']${name}["']\\s+value=["']([^"']+)["']`, "i");
const PATTERN_FORM_ACTION = /<form[^>]+action=["']([^"']+)["']/i;

// 把 raw set-cookie 字串分成單個 cookie name=value
function splitSetCookie(raw: string | null): string[] {
  if (!raw) return [];
  // 分割時只在 cookie name= 前進行（避免 cookie value 裡的逗號被錯誤切）
  const parts = raw.split(/,(?=\s*[A-Za-z0-9_\-]+=)/);
  return parts.map((p) => p.split(";")[0].trim()).filter(Boolean);
}

function extractHidden(html: string, name: string): string | null {
  const m = PATTERN_HIDDEN(name).exec(html);
  return m ? m[1] : null;
}

function extractFormAction(html: string, baseUrl: string): string {
  const m = PATTERN_FORM_ACTION.exec(html);
  if (!m) return baseUrl;
  const action = m[1];
  try {
    return action.startsWith("http")
      ? action
      : new URL(action, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function parseCookies(cookies: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const c of cookies) {
    const [name, ...rest] = c.split("=");
    result[name.trim()] = rest.join("=");
  }
  return result;
}

export async function GET() {
  try {
    // 1) GET login page
    const loginPageResp = await fetch(`${TRON}/login?next=/user/index`, {
      headers: { "User-Agent": UA },
    });
    const html = await loginPageResp.text();
    const action = extractFormAction(html, loginPageResp.url);
    const lt = extractHidden(html, "lt");
    const execution = extractHidden(html, "execution") || "e1s1";

    if (!lt) {
      console.error("Cannot find LT token in login page");
      return NextResponse.json(
        { error: "Cannot find LT token" },
        { status: 500 },
      );
    }

    // 3) POST 表單
    const form = new URLSearchParams();
    form.set("username", USER);
    form.set("password", PASS);
    form.set("lt", lt);
    form.set("execution", execution);
    form.set("_eventId", "submit");
    form.set("submit", "登錄");

    const loginResp = await fetch(action, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: loginPageResp.url,
      },
      body: form.toString(),
      redirect: "manual", // 先不要自動跟隨，方便讀 set-cookie
    });

    // 4) 取出 set-cookie（可能包含多個，需切好）
    const rawSetCookie = loginResp.headers.get("set-cookie") || "";
    // 有時候實作會把多個 set-cookie 分散在 headers.entries()，嘗試把所有 entries 合併
    // （Node/undici 的環境下 headers.get 可能已合併／只有第一筆，這裡提供保守處理）
    const allHeaderEntries = Array.from(loginResp.headers.entries()).filter(
      ([k]) => k.toLowerCase() === "set-cookie",
    );
    let rawCombined = rawSetCookie;
    if (allHeaderEntries.length > 1) {
      rawCombined = allHeaderEntries.map(([, v]) => v).join(", ");
    }
    let cookies = splitSetCookie(rawCombined);

    // 若 server 在 redirect 的 Location 回覆更多 cookie，手動跟隨一次（並合併 cookie）
    if (loginResp.status >= 300 && loginResp.status < 400) {
      const location = loginResp.headers.get("location");
      if (location) {
        const followUrl = new URL(location, loginResp.url).toString();
        const followResp = await fetch(followUrl, {
          headers: {
            "User-Agent": UA,
            Cookie: cookies.join("; "),
            Referer: action,
          },
          redirect: "manual",
        });
        const moreRaw = followResp.headers.get("set-cookie") || "";
        if (moreRaw) {
          const more = splitSetCookie(moreRaw);
          cookies = Array.from(new Set([...cookies, ...more]));
        }
      }
    }

    return NextResponse.json({
      success: true,
      cookies: parseCookies(cookies),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 },
    );
  }
}
