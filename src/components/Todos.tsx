"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, FileText, Calendar, CheckSquare } from "lucide-react";

export default function Todos() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch("/api/todos", { method: "GET" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "查詢失敗");
      return json;
    },
  });

  const todos = data?.todo_list ?? [];

  return (
    <div className="flex w-full flex-col rounded-xl border border-gray-300 bg-white p-6">
      <h1 className="mb-6 text-center text-2xl font-bold">待辦事項</h1>

      {isLoading && <div className="text-center text-slate-500">載入中...</div>}

      {error && (
        <div className="text-center text-rose-600">{String(error)}</div>
      )}

      {data && (
        <section>
          <header className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">依課程與項目顯示</p>
            </div>
            <div className="text-sm text-slate-600">共 {todos.length} 項</div>
          </header>

          <ul className="space-y-4">
            {todos.length > 0 ? (
              todos.map((item: any) => <TodoCard key={item.id} item={item} />)
            ) : (
              <li className="rounded-md border border-dashed border-slate-200 p-6 text-center text-slate-500">
                尚無待辦項目
              </li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}

function TodoCard({ item }: { item: any }) {
  const end = item.end_time ? new Date(item.end_time) : null;
  const formattedEnd = end
    ? new Intl.DateTimeFormat("zh-TW", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(end)
    : "無截止日期";

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
      <div className="flex w-full flex-none items-center justify-center sm:w-14">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200">
          {item.type === "exam" ? (
            <FileText className="h-5 w-5 text-slate-700" />
          ) : item.type === "questionnaire" ? (
            <CheckSquare className="h-5 w-5 text-slate-700" />
          ) : (
            <Calendar className="h-5 w-5 text-slate-700" />
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-medium">{item.title}</h3>
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                {item.course_name}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-slate-500">
              課程代碼：{item.course_code}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedEnd}</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
                {item.type}
              </span>
              <a
                href="/todos"
                className="rounded-md border border-slate-200 px-3 py-1 text-xs transition-colors hover:bg-slate-50"
                aria-label={`檢視 ${item.title}`}
              >
                檢視
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
