"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temperature_2m: number;
  apparent_temperature: number;
  uv_index: number;
  nextHourPrecip: number; // 未來一小時降雨機率
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=25.150916&longitude=121.7799635&current=temperature_2m,apparent_temperature,uv_index&hourly=precipitation_probability&forecast_days=1&timezone=auto",
        );
        const data = await res.json();

        if (data.current && data.hourly) {
          setWeather({
            temperature_2m: data.current.temperature_2m,
            apparent_temperature: data.current.apparent_temperature,
            uv_index: data.current.uv_index,
            nextHourPrecip: data.hourly.precipitation_probability[0], // 取下一小時
          });
        }
      } catch (err) {
        console.error("載入天氣資料失敗:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-bold text-gray-800">基隆天氣狀況</h2>
      {loading && <p className="text-gray-500">載入中...</p>}
      {weather && (
        <ul className="space-y-2 text-gray-700">
          <li>🌡️ 溫度：{weather.temperature_2m} °C</li>
          <li>🤔 體感溫度：{weather.apparent_temperature} °C</li>
          <li>☔ 未來一小時降雨機率：{weather.nextHourPrecip} %</li>
          <li>🔆 紫外線指數：{weather.uv_index}</li>
        </ul>
      )}
    </div>
  );
}
