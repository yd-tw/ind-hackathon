import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://tronclass.ntou.edu.tw/api/my-courses?conditions=%7B%22status%22:%5B%22ongoing%22%5D,%22keyword%22:%22%22,%22classify_type%22:%22recently_started%22,%22display_studio_list%22:false%7D&fields=id,name,course_code,department(id,name),grade(id,name),klass(id,name),course_type,cover,small_cover,start_date,end_date,is_started,is_closed,academic_year_id,semester_id,credit,compulsory,second_name,display_name,created_user(id,name),org(is_enterprise_or_organization),org_id,public_scope,audit_status,audit_remark,can_withdraw_course,imported_from,allow_clone,is_instructor,is_team_teaching,is_default_course_cover,archived,instructors(id,name,email,avatar_small_url),course_attributes(teaching_class_name,is_during_publish_period,copy_status,tip,data,audience_type,graduate_method),user_stick_course_record(id)&page=1&page_size=25&showScorePassedStatus=false",
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
