// app/api/tron-login/route.ts
import { NextResponse } from "next/server";

const TRON = "https://tronclass.ntou.edu.tw";
const USER = process.env.TRON_USER || "";
const PASS = process.env.TRON_PASS || "";
const UA = process.env.TRON_UA || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

if (!USER || !PASS) {
  // 開發時方便快速失敗
  console.warn("TRON_USER or TRON_PASS not set in env");
}

// 幾個 helper regex（與你的 Python PATTERN 對齊）
const PATTERN_LT_ANY = /(LT[^"'\s<>]+)/i;
const PATTERN_HIDDEN = (name: string) => new RegExp(`name=["']${name}["']\\s+value=["']([^"']+)["']`, "i");
const PATTERN_FORM_ACTION = /<form[^>]+action=["']([^"']+)["']/i;

// 把 raw set-cookie 字串分成單個 cookie name=value
function splitSetCookie(raw: string | null): string[] {
  if (!raw) return [];
  // 分割時只在 cookie name= 前進行（避免 cookie value 裡的逗號被錯誤切）
  const parts = raw.split(/,(?=\s*[A-Za-z0-9_\-]+=)/);
  return parts.map(p => p.split(";")[0].trim()).filter(Boolean);
}

function extractLt(html: string): string | null {
  // 先試 name="lt" 的 hidden input，若沒有再 fallback 到 LTxxxx pattern（與 Python 一致）
  const m1 = PATTERN_HIDDEN("lt").exec(html);
  if (m1) return m1[1];
  const m2 = PATTERN_LT_ANY.exec(html);
  return m2 ? m2[1] : null;
}

function extractExecution(html: string): string | null {
  const m = PATTERN_HIDDEN("execution").exec(html);
  return m ? m[1] : null;
}

function extractFormAction(html: string, baseUrl: string): string {
  const m = PATTERN_FORM_ACTION.exec(html);
  if (!m) return baseUrl;
  const action = m[1];
  try {
    return action.startsWith("http") ? action : new URL(action, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

export async function GET() {
  const debug: Record<string, any> = {};
  try {
    // 1) GET login page
    const loginPageResp = await fetch(`${TRON}/login?next=/user/index`, {
      headers: { "User-Agent": UA },
    });
    const loginHtml = await loginPageResp.text();
    debug.loginPageStatus = loginPageResp.status;
    debug.loginUrl = String(loginPageResp.url);
    // console log server-side 可看到詳細內容（不要把密碼 / cookie 回傳到前端）
    console.log("Login page snippet:", loginHtml.slice(0, 800));

    // 2) 解析 lt / execution / form action（採用 Python 同樣的 LT fallback）
    const lt = extractLt(loginHtml);
    const execution = extractExecution(loginHtml) || "e1s1";
    const action = extractFormAction(loginHtml, loginPageResp.url);
    debug.lt = Boolean(lt);
    debug.execution = execution;
    debug.action = action;

    if (!lt) {
      console.error("Cannot find LT token in login page");
      return NextResponse.json({ error: "Cannot find LT token", debug }, { status: 500 });
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

    debug.loginRespStatus = loginResp.status;
    // 4) 取出 set-cookie（可能包含多個，需切好）
    const rawSetCookie = loginResp.headers.get("set-cookie") || "";
    // 有時候實作會把多個 set-cookie 分散在 headers.entries()，嘗試把所有 entries 合併
    // （Node/undici 的環境下 headers.get 可能已合併／只有第一筆，這裡提供保守處理）
    const allHeaderEntries = Array.from(loginResp.headers.entries()).filter(([k]) => k.toLowerCase() === "set-cookie");
    let rawCombined = rawSetCookie;
    if (allHeaderEntries.length > 1) {
      rawCombined = allHeaderEntries.map(([, v]) => v).join(", ");
    }
    debug.rawSetCookie = rawCombined.slice(0, 1000);
    let cookies = splitSetCookie(rawCombined);
    debug.cookieNames = cookies.map(c => c.split("=")[0]);

    // 若 server 在 redirect 的 Location 回覆更多 cookie，手動跟隨一次（並合併 cookie）
    if (loginResp.status >= 300 && loginResp.status < 400) {
      const location = loginResp.headers.get("location");
      if (location) {
        const followUrl = new URL(location, loginResp.url).toString();
        const followResp = await fetch(followUrl, {
          headers: { "User-Agent": UA, Cookie: cookies.join("; "), Referer: action },
          redirect: "manual",
        });
        const moreRaw = followResp.headers.get("set-cookie") || "";
        if (moreRaw) {
          const more = splitSetCookie(moreRaw);
          cookies = Array.from(new Set([...cookies, ...more]));
        }
      }
    }

    const cookieHeader = cookies.join("; ");
    debug.cookieHeaderPreview = cookieHeader.slice(0, 200);

    // 5) 使用 cookie 去呼叫受保護 API
    const apiResp = await fetch(`${TRON}/api/user/recently-visited-courses`, {
      headers: {
        "User-Agent": UA,
        Cookie: cookieHeader,
        Referer: TRON + "/",
        Accept: "application/json, text/plain, */*",
      },
    });

    const ct = apiResp.headers.get("content-type") || "";
    debug.apiStatus = apiResp.status;
    debug.apiContentType = ct;

    if (ct.includes("application/json")) {
      const data = await apiResp.json();
      // 注意不要把 cookie 或密碼回傳給前端；只回傳必要資料與 debug（不含敏感值）
      return NextResponse.json({ success: true, data });
    } else {
      const text = await apiResp.text();
      console.error("API returned non-json (start):", text.slice(0, 800));
      debug.apiTextStart = text.slice(0, 800);
      return NextResponse.json({ error: "API did not return JSON", debug }, { status: 502 });
    }
  } catch (err: any) {
    console.error("Error during tron login flow:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
