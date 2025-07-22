"use client";

import Box from "../box";
import React from "react";
import Chart, { Props } from "react-apexcharts";

export const SalesChart = ({
  ordersData,
}: {
  ordersData?: {
    month: string;
    count: number;
  }[];
}) => {
  const defaultData = [
    { month: "Jan", count: 31 },
    { month: "Feb", count: 40 },
    { month: "Mar", count: 28 },
    { month: "Apr", count: 51 },
    { month: "May", count: 109 },
    { month: "Jun", count: 100 },
  ];

  const data = ordersData || defaultData;

  const chartSeries: Props["series"] = [
    {
      name: "Sales",
      data: data.map((item) => item.count),
    },
  ];

  const chartOptions: Props["options"] = {
    chart: {
      type: "area",
      height: 350,
      background: "transparent",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    theme: {
      mode: "dark",
    },
    colors: ["#4ADE80"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#4ADE80",
            opacity: 0.4,
          },
          {
            offset: 100,
            color: "#4ADE80",
            opacity: 0.1,
          },
        ],
      },
    },
    grid: {
      show: true,
      borderColor: "#334155",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    xaxis: {
      categories: data.map((item) => item.month),
      labels: {
        style: {
          colors: "#94A3B8",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#94A3B8",
          fontSize: "12px",
          fontWeight: 500,
        },
        formatter: (value: number) => {
          return value.toString();
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontSize: "12px",
      },
      x: {
        show: true,
      },
      y: {
        formatter: (value: number) => {
          return `${value} sales`;
        },
      },
      marker: {
        show: true,
      },
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 280,
          },
        },
      },
    ],
  };

  return (
    <Box>
      <div className="w-full h-full">
        <Chart
          options={chartOptions}
          series={chartSeries}
          type="area"
          height="350"
          width="100%"
        />
      </div>
    </Box>
  );
};
