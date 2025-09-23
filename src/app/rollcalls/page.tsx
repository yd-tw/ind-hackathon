"use client";

import { useQuery } from "@tanstack/react-query";

export default function RollCallsPage() {
  const { data, error } = useQuery({
    queryKey: ["rollcalls"],
    queryFn: async () => {
      const res = await fetch("/api/rollcalls", {
        method: "GET",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "查詢失敗");
      }
      return json;
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">使用者資料查詢</h1>
        {error && (
          <p className="mt-4 text-center text-sm text-red-600">
            ❌ {(error as Error).message}
          </p>
        )}

        {data && (
          <pre className="mt-4 max-h-96 overflow-auto rounded bg-gray-100 p-3 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
