import { NextResponse } from "next/server";

const PATTERN_HIDDEN = (name: string) =>
  new RegExp(`name=["']${name}["']\\s+value=["']([^"']+)["']`, "i");

function splitSetCookie(raw: string | null): string[] {
  if (!raw) return [];
  const parts = raw.split(/,(?=\s*[A-Za-z0-9_\-]+=)/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function extractHidden(html: string, name: string): string | null {
  const m = PATTERN_HIDDEN(name).exec(html);
  return m ? m[1] : null;
}

function extractFormAction(html: string, baseUrl: string): string {
  const PATTERN_FORM_ACTION = /<form[^>]+action=["']([^"']+)["']/i;
  const m = PATTERN_FORM_ACTION.exec(html);
  if (!m) return baseUrl;
  return new URL(m[1], baseUrl).toString();
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "缺少帳號或密碼" },
        { status: 400 }
      );
    }

    // 1) 抓登入頁面
    const loginPageResp = await fetch(
      "https://tronclass.ntou.edu.tw/login?next=/user/index"
    );
    const html = await loginPageResp.text();
    const action = extractFormAction(html, loginPageResp.url);
    const lt = extractHidden(html, "lt") || "";
    const execution = extractHidden(html, "execution") || "e1s1";

    // 2) 準備登入表單
    const form = new URLSearchParams();
    form.set("username", username);
    form.set("password", password);
    form.set("lt", lt);
    form.set("execution", execution);
    form.set("_eventId", "submit");
    form.set("submit", "登錄");

    // 3) 提交登入
    const loginResp = await fetch(action, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: loginPageResp.url,
      },
      body: form.toString(),
      redirect: "manual",
    });

    // 4) 收集 cookie
    let cookies: string[] = [];
    const rawSetCookie = loginResp.headers.get("set-cookie");
    if (rawSetCookie) {
      cookies = splitSetCookie(rawSetCookie);
    }

    // 5) 如果有 redirect，手動追隨一次，補齊 cookie
    if (loginResp.status >= 300 && loginResp.status < 400) {
      const location = loginResp.headers.get("location");
      if (location) {
        const followUrl = new URL(location, loginResp.url).toString();
        const followResp = await fetch(followUrl, {
          headers: {
            Cookie: cookies.join("; "),
            Referer: action,
          },
          redirect: "manual",
        });
        const moreRaw = followResp.headers.get("set-cookie");
        if (moreRaw) {
          console.log("Following redirect, got more cookies.");
          const more = splitSetCookie(moreRaw);
          cookies = Array.from(new Set([...cookies, ...more]));
        }
      }
    }

    // 6) 回傳時把 Cookie 設在 header
    const res = NextResponse.json({ success: true });
    for (const c of cookies) {
      res.headers.append("Set-Cookie", c + "; Path=/; HttpOnly; Secure; SameSite=Lax");
    }
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
