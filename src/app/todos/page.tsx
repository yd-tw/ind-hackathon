"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/todos", {
        method: "GET",
        credentials: "include", // 讓瀏覽器自動帶 Cookie
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "查詢失敗");
      }
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">使用者資料查詢</h1>

        <button
          onClick={handleFetch}
          disabled={loading}
          className="w-full rounded-md bg-green-600 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "查詢中..." : "查詢 Profile"}
        </button>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">❌ {error}</p>
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
