"use client";

import { useState } from "react";
import db from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
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

      // 驗證每個物件
      parsed.forEach((course, idx) => {
        if (!course.course_name || !course.course_time) {
          throw new Error(`第 ${idx + 1} 筆缺少必要欄位`);
        }
      });

      // 存到 Firebase
      const ref = doc(db, "users", user.userNo);

      await setDoc(ref, { courses: parsed }, { merge: true });

      setMessage("✅ 課表已成功儲存！");
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ 錯誤：${err.message}`);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-2">課表設定</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        className="w-full border rounded p-2 font-mono text-sm"
        placeholder='貼上課表 JSON，例如：[{"course_name":"計算機概論","course_time":"102/103"}]'
      />
      <button
        onClick={handleSave}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        儲存
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
