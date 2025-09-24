"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
    });

    if (res.ok) {
      router.push("/");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center rounded-2xl border border-gray-200 bg-white p-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">帳號管理</h1>
        <p className="text-sm text-gray-600">點擊下方按鈕即可登出</p>

        <button
          onClick={handleLogout}
          className="mt-6 w-full cursor-pointer rounded-lg bg-red-500 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-red-600 active:scale-95"
        >
          登出
        </button>
      </div>
    </main>
  );
}
