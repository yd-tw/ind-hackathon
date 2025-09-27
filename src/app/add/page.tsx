"use client";
import { useState } from "react";
import db from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Save, CheckCircle, XCircle, Lightbulb } from "lucide-react";

export default function CourseConfig() {
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (res.ok) {
        return res.json();
      }
      return null;
    },
  });

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) {
        throw new Error("格式錯誤：必須是課程陣列");
      }
      parsed.forEach((course, idx) => {
        if (!course.course_name || !course.course_time) {
          throw new Error(`第 ${idx + 1} 筆缺少必要欄位`);
        }
      });
      const ref = doc(db, "users", user.userNo);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { courses: [] });
      }
      await Promise.all(
        parsed.map((course) =>
          updateDoc(ref, {
            courses: arrayUnion(course),
          }),
        ),
      );
      setMessage("✅ 課表已成功新增！");
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ 錯誤：${err.message}`);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white">
          {/* Header */}
          <div className="px-8 py-6">
            <h2 className="flex items-center gap-3 text-2xl font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Calendar className="h-5 w-5" />
              </div>
              課表設定
            </h2>
            <p className="mt-2 text-gray-700">
              輸入 JSON 格式的課程資料來設定你的課表
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6 p-8">
            {/* Input Section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                課程 JSON 資料
              </label>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={12}
                  className="w-full resize-none rounded-lg border-2 border-gray-200 bg-gray-50 p-4 font-mono text-sm transition-all duration-200 hover:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder='貼上課表 JSON 資料，格式如下：
[
  {
    "course_name": "計算機概論",
    "course_time": "102/103"
  },
  {
    "course_name": "程式設計",
    "course_time": "204/205"
  }
]'
                />
                <div className="absolute top-3 right-3">
                  <div className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    JSON
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="h-1 w-1 rounded-full bg-gray-400"></div>
                確保每個課程都包含 course_name 和 course_time 欄位
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSave}
                disabled={!input.trim()}
                className="group relative transform rounded-xl bg-blue-500 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:scale-100 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-md"
              >
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  儲存課表
                </span>
                <div className="absolute inset-0 rounded-xl bg-white opacity-0 transition-opacity group-hover:opacity-10"></div>
              </button>
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`rounded-lg border-l-4 p-4 ${
                  message.includes("✅")
                    ? "border-green-400 bg-green-50 text-green-800"
                    : "border-red-400 bg-red-50 text-red-800"
                } animate-in slide-in-from-top-2 duration-300`}
              >
                <div className="flex items-center gap-2">
                  {message.includes("✅") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <div className="font-medium">
                    {message.replace(/[✅❌]\s*/, "")}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Card */}
        <div className="mt-6 rounded-xl border border-gray-300 bg-white/60 p-6 backdrop-blur-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
            <Lightbulb className="h-4 w-4" />
            使用說明
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></div>
              <span>請確保 JSON 格式正確，使用陣列包含課程物件</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></div>
              <span>
                每個課程必須包含{" "}
                <code className="rounded bg-gray-100 px-1">course_name</code> 和{" "}
                <code className="rounded bg-gray-100 px-1">course_time</code>{" "}
                欄位
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400"></div>
              <span>課程時間格式建議使用如 "102/103" 的格式</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
