"use client";

import { useQuery } from "@tanstack/react-query";

export default function Courses() {
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses", { method: "GET" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "查詢失敗");
      return json;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center border-gray-300 text-gray-600">
        載入中...
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="mb-6 text-center text-2xl font-bold">課程列表</h1>

      <div className="space-y-4">
        {data?.courses?.map((course: any) => (
          <div
            key={course.id}
            className="rounded-2xl border border-gray-300 bg-white p-4"
          >
            {/* 標題區塊 */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{course.display_name}</h2>
              <span className="text-sm text-gray-500">
                {course.course_code}
              </span>
            </div>

            {/* 基本資訊 */}
            <div className="mb-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div>系所：{course.department?.name}</div>
              <div>年級：{course.grade?.name}</div>
              <div>學分：{course.credit}</div>
              <div>
                期間：{course.start_date} ~ {course.end_date}
              </div>
            </div>

            {/* 授課教師 */}
            <div className="mb-3 flex items-center gap-2">
              {course.instructors.map((ins: any) => (
                <div
                  key={ins.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border text-xs text-gray-600"
                >
                  {ins.name[0]}
                </div>
              ))}
              <span className="text-sm text-gray-700">
                {course.instructors.map((i: any) => i.name).join("、")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
