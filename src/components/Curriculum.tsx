"use client";

import { useEffect, useState } from "react";
import db from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";

interface Course {
  course_name: string;
  course_time: string;
}

const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
const periods = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12 節

export default function CourseTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/user");
      if (!res.ok) return null;
      return res.json();
    },
  });

  useEffect(() => {
    if (!user || !user.userNo) return; // 等 user 有資料才跑

    const fetchCourses = async () => {
      try {
        const ref = doc(db, "users", user.userNo);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error("讀取課表失敗:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]); // 依賴 user，變化時才執行

  const timetable: Record<string, string> = {};

  courses.forEach((course) => {
    const times = course.course_time.split("/");
    times.forEach((time) => {
      const day = parseInt(time[0]); // 星期
      const period = parseInt(time.slice(1)); // 第幾節
      const key = `${day}-${period}`;
      timetable[key] = course.course_name;
    });
  });

  if (userLoading || loading) return <p>讀取中...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse border border-gray-400 w-full text-center">
        <thead>
          <tr>
            <th className="border border-gray-400 p-2">節次</th>
            {weekdays.map((day, i) => (
              <th key={i} className="border border-gray-400 p-2">
                星期{day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <tr key={p}>
              <td className="border border-gray-400 p-2">{p}</td>
              {weekdays.map((_, dayIdx) => {
                const key = `${dayIdx + 1}-${p}`;
                return (
                  <td key={key} className="border border-gray-400 p-2">
                    {timetable[key] || ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
