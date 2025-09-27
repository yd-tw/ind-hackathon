import RollCalls from "@/components/RollCalls";
import Todos from "@/components/Todos";
import Courses from "@/components/Courses";
import WeatherCard from "@/components/Weather";
import BusStopQuery from "@/components/Bus";
import Curriculum from "@/components/Curriculum";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="grid auto-rows-min grid-cols-1 gap-6 md:grid-cols-6 lg:grid-cols-12">
        <div className="md:col-span-2">
          <RollCalls />
        </div>
        <div className="md:col-span-8">
          <Todos />
        </div>
        <div className="md:col-span-2">
          <WeatherCard />
        </div>
        <div className="md:col-span-2"></div>
        <div className="md:col-span-8">
          <Curriculum />
        </div>
        <div className="md:col-span-2"></div>
        <div className="md:col-span-2"></div>
        <div className="md:col-span-8">
          <Courses />
        </div>
        <div className="md:col-span-2"></div>
        <div className="md:col-span-2"></div>
        <div className="md:col-span-8">
          <BusStopQuery />
        </div>
      </div>
    </main>
  );
}
