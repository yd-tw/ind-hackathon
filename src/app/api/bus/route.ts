// app/api/bus/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const stopName = req.nextUrl.searchParams.get("stopName") || "海大(體育館)";

    const payload = new URLSearchParams();
    payload.append("stopName", stopName);
    payload.append("Lang", "cht");
    payload.append("apiParam", "0");
    payload.append("prj", "kl");

    const response = await axios.post(
      "https://ebus.klcba.gov.tw/IMP/jsp/rwd_api/ajax_routeFromStopId.jsp",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest",
          Cookie:
            "JSESSIONID=8AC9992BE4D8E862DB4F7DF0ACBFA7D5; _ga=GA1.1.885673886.1758944070; _ga_EV7EMNEWNH=GS2.1.s1758944070$o1$g1$t1758945626$j59$l0$h0",
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
