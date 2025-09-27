"use client";

import { useQuery } from "@tanstack/react-query";
import { FileX } from "lucide-react";

export default function RollCalls() {
  const { data, error } = useQuery({
    queryKey: ["rollcalls"],
    queryFn: async () => {
      const res = await fetch("/api/rollcalls", { method: "GET" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "查詢失敗");
      }
      return json;
    },
  });

  return (
    <div className="flex w-full max-w-md flex-col rounded-2xl border border-gray-300 bg-white p-6">
      <h1 className="mb-6 text-center text-2xl font-bold">點名系統</h1>

      {/* 無資料狀態 */}
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-10">
        <FileX className="mb-3 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">目前沒有任何點名</p>
      </div>
    </div>
  );
}
