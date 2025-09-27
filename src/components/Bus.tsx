"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";

interface PathInfo {
  StopName: string;
  Dest: string;
  CarNo: string;
  Time: string;
  Dept: string;
  PathName: string;
}

interface BusStop {
  name_cht: string;
  StopLocationId: number;
  pathInfo: PathInfo[];
}

interface BusResponse {
  result: boolean;
  data: BusStop[];
}

// API 請求函數
const fetchBusData = async (): Promise<BusResponse> => {
  const res = await fetch("/api/bus");
  if (!res.ok) throw new Error("Failed to fetch bus data");
  return res.json();
};

const BusCard = ({ stop }: { stop: BusStop }) => {
  return (
    <div className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-6">
      <h2 className="mb-2 text-lg font-semibold">{stop.name_cht}</h2>
      <div className="divide-y divide-gray-300">
        {stop.pathInfo.map((path, idx) => (
          <div key={idx} className="flex justify-between py-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{path.PathName}</span>
              <span className="text-xs text-gray-600">
                {path.Dept} → {path.Dest}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm">{path.Time}</span>
              <span className="text-xs text-gray-500">{path.CarNo || "—"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function BusStops() {
  const { data, isLoading, error } = useQuery<BusResponse>({
    queryKey: ["busData"],
    queryFn: fetchBusData,
  });

  if (isLoading) return <div className="p-4">載入中...</div>;
  if (error) return <div className="p-4 text-red-600">載入失敗</div>;

  return (
    <div className="m-6 mx-auto flex flex-row gap-6">
      {data?.data.map((stop) => (
        <BusCard key={stop.StopLocationId} stop={stop} />
      ))}
    </div>
  );
}
