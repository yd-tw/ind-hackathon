import { ReactNode } from "react";
import RollCalls from "@/components/RollCalls";
import Todos from "@/components/Todos";
import Courses from "@/components/Courses";
import WeatherCard from "@/components/Weather";
import BusStopQuery from "@/components/Bus";
import Curriculum from "@/components/Curriculum";

// ====== 卡片佔位組件 ======
interface StatsCardProps {
  title: string;
  children?: ReactNode;
}

function StatsCard({ title, children }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-4">
      <h2 className="mb-2 text-sm font-semibold text-gray-700">{title}</h2>
      {children && <div>{children}</div>}
    </div>
  );
}

// 你可以建立不同類型的卡片
function ChartCard() {
  return (
    <StatsCard title="圖表卡片">
      <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-gray-400">
        Chart Placeholder
      </div>
    </StatsCard>
  );
}

// ====== 儀表板首頁 ======
export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-6 lg:grid-cols-8 item-center justify-center">
        <div className="md:col-span-2">
          <RollCalls />
        </div>
        <div className="md:col-span-4">
          <Todos />
        </div>
        <div className="md:col-span-2">
          <WeatherCard />
        </div>
        <div className="md:col-span-6">
          <Curriculum />
        </div>
        <div className="md:col-span-3">
          <Courses />
        </div>
        <div className="md:col-span-3">
          <BusStopQuery />
        </div>
      </div>
    </main>
  );
}
