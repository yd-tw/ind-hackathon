"use client";

import { useState } from "react";
import db from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";

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
        // 建立文件（可以給初始結構）
        await setDoc(ref, { courses: [] });
      }

      // 一次插入多筆：用 Promise.all 執行多個 updateDoc
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
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <h2 className="mb-2 text-lg font-bold">課表設定</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        className="w-full rounded border p-2 font-mono text-sm"
        placeholder='貼上課表 JSON，例如：[{"course_name":"計算機概論","course_time":"102/103"}]'
      />
      <button
        onClick={handleSave}
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        儲存
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
