"use client";
import { Doughnut } from "react-chartjs-2";
import { DoughnutChartProps } from "@/types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  const data = {
    datasets: [
      {
        label: "Banks",
        data: [2548, 4112, 1200],
        backgroundColor: ["#0747b6", "#2265d8", "#2f91fa"],
      },
    ],
    labels: ["Bank1", "Bank2", "Bank3"],
  };
  return <Doughnut data={data}
  options={{
    cutout:'60%',
    plugins: {
        legend: {
            display: false,
        }
    }
  }}
  />;
};

export default DoughnutChart;
