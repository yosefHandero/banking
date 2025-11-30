"use client";
import { Doughnut } from "react-chartjs-2";
import { DoughnutChartProps } from "@/types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { formatAmount } from "@/lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

// Generate colors dynamically based on number of accounts
const generateColors = (count: number): string[] => {
  const baseColors = ["#0747b6", "#2265d8", "#2f91fa", "#4a9eff", "#6bb3ff", "#8cc8ff"];
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
  // Handle empty accounts case
  if (!accounts || accounts.length === 0) {
    const emptyData = {
      datasets: [
        {
          label: "Banks",
          data: [1],
          backgroundColor: ["#1a1a2e"],
        },
      ],
      labels: ["No accounts"],
    };
    
    return (
      <Doughnut
        data={emptyData}
        options={{
          cutout: "60%",
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
        }}
      />
    );
  }

  // Extract account data
  const accountBalances = accounts.map((acc) => Math.abs(acc.currentBalance));
  const accountLabels = accounts.map((acc) => acc.name || acc.officialName || "Account");
  const accountColors = generateColors(accounts.length);

  const data = {
    datasets: [
      {
        label: "Banks",
        data: accountBalances,
        backgroundColor: accountColors,
        borderWidth: 0,
      },
    ],
    labels: accountLabels,
  };

  return (
    <Doughnut
      data={data}
      options={{
        cutout: "60%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function (context: any) {
                const label = context.label || "";
                const value = context.parsed || 0;
                return [
                  `${label}`,
                  `Balance: ${formatAmount(value)}`,
                ];
              },
            },
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 1,
            padding: 12,
          },
        },
        maintainAspectRatio: false,
        responsive: true,
      }}
    />
  );
};

export default DoughnutChart;
