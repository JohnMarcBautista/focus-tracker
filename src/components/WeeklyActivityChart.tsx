"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { subDays, format, addDays } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ActivityData {
  day: string; // e.g., "2025-02-23" (as returned from Supabase)
  total_duration: number; // in seconds
}

interface WeeklyActivityChartProps {
  data: ActivityData[];
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  // Generate labels for the past 7 days (oldest to newest)
  const today = new Date();
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    labels.push(format(d, "MM/dd (EEE)")); // e.g., "02/23 (Sat)"
  }

  // Build a mapping from the returned data.
  // Use addDays to adjust each date as needed.
  const activityMap: { [key: string]: number } = {};
  data.forEach((item) => {
    // Add one day to the date from Supabase
    const dayLabel = format(addDays(new Date(item.day), 1), "MM/dd (EEE)");
    // Convert seconds to minutes
    activityMap[dayLabel] = item.total_duration / 60;
  });

  // Create the durations array aligned with the labels.
  // If a day is missing in the map, default to 0.
  const durations = labels.map((label) => activityMap[label] || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Focus Time (minutes)",
        data: durations,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number) {
            return `${value}m`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}
