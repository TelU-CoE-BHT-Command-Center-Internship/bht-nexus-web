"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import "apexcharts/dist/apexcharts.css";

/**
 * Grafik dimuat di sisi peramban saja: pustaka grafik membutuhkan DOM, dan
 * memuatnya terpisah menjaga halaman lain tidak ikut membawa berkasnya.
 */
const ApexChart = dynamic(() => import("react-apexcharts"), {
  loading: () => <div aria-hidden="true" className={styles.chartPlaceholder} />,
  ssr: false,
});

export const MONITORING_SERIES_COLOR = "#5c4fd0";
export const MONITORING_REFERENCE_COLOR = "#9aa4b5";
const TRACK_COLOR = "#e4e7ec";

export type MonitoringChartPoint = {
  id: string;
  label: string;
  /** `null` berarti nilainya belum dapat dihitung, bukan nol. */
  value: number | null;
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

/** Sumbu jumlah rekam selalu bilangan bulat; pecahan tidak punya arti di sini. */
function wholeNumberLabel(value: number | string) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? String(Math.round(numeric)) : String(value);
}

function baseOptions(reducedMotion: boolean): ApexOptions {
  return {
    chart: {
      animations: {
        animateGradually: { delay: 150, enabled: !reducedMotion },
        dynamicAnimation: { enabled: !reducedMotion, speed: 350 },
        enabled: !reducedMotion,
        easing: "easeinout",
        speed: 800,
      },
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: TRACK_COLOR,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: {
      fontFamily: "inherit",
      horizontalAlign: "left",
      markers: { size: 6 },
      position: "top",
    },
    states: { active: { filter: { type: "none" } } },
    tooltip: { style: { fontFamily: "inherit", fontSize: "12px" } },
  };
}

type ColumnChartProps = {
  categories: readonly string[];
  height?: number;
  series: readonly {
    color?: string;
    data: readonly (number | null)[];
    name: string;
  }[];
  unitSuffix?: string;
};

/** Batang vertikal berkelompok, dipakai membandingkan target dan realisasi. */
export function MonitoringColumnChart({
  categories,
  height = 220,
  series,
  unitSuffix = "",
}: ColumnChartProps) {
  const reducedMotion = useReducedMotion();
  const options: ApexOptions = {
    ...baseOptions(reducedMotion),
    colors: series.map(
      (item, index) =>
        item.color ??
        (index === 0 ? MONITORING_REFERENCE_COLOR : MONITORING_SERIES_COLOR),
    ),
    fill: { opacity: 1 },
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusApplication: "end",
        columnWidth: "70%",
        horizontal: false,
      },
    },
    stroke: { colors: ["transparent"], show: true, width: 3 },
    tooltip: {
      ...baseOptions(reducedMotion).tooltip,
      y: {
        formatter: (value: number) =>
          value === null ? "Belum dapat dihitung" : `${value}${unitSuffix}`,
      },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: [...categories],
      labels: { style: { colors: "#667085", fontSize: "12px" } },
    },
    yaxis: {
      forceNiceScale: true,
      labels: {
        formatter: wholeNumberLabel,
        style: { colors: "#667085", fontSize: "12px" },
      },
      min: 0,
    },
  };

  return (
    <ApexChart
      height={height}
      options={options}
      series={series.map((item) => ({ data: [...item.data], name: item.name }))}
      type="bar"
    />
  );
}

type BarChartProps = {
  height?: number;
  name: string;
  points: readonly MonitoringChartPoint[];
  unitSuffix?: string;
};

/** Batang mendatar, dipakai untuk sebaran dan capaian per indikator. */
export function MonitoringBarChart({
  height = 260,
  name,
  points,
  unitSuffix = "",
}: BarChartProps) {
  const reducedMotion = useReducedMotion();
  const options: ApexOptions = {
    ...baseOptions(reducedMotion),
    colors: [MONITORING_SERIES_COLOR],
    fill: { opacity: 1 },
    grid: {
      borderColor: TRACK_COLOR,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    plotOptions: {
      bar: {
        barHeight: "62%",
        borderRadius: 5,
        borderRadiusApplication: "end",
        horizontal: true,
      },
    },
    tooltip: {
      ...baseOptions(reducedMotion).tooltip,
      y: {
        formatter: (value: number) =>
          value === null ? "Belum dapat dihitung" : `${value}${unitSuffix}`,
      },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: points.map((point) => point.label),
      labels: {
        formatter: wholeNumberLabel,
        style: { colors: "#667085", fontSize: "12px" },
      },
      min: 0,
      tickAmount: Math.min(
        5,
        Math.max(
          1,
          points.reduce((max, point) => Math.max(max, point.value ?? 0), 0),
        ),
      ),
    },
    yaxis: {
      labels: { maxWidth: 240, style: { colors: "#667085", fontSize: "12px" } },
    },
  };

  return (
    <ApexChart
      height={height}
      options={options}
      series={[{ data: points.map((point) => point.value), name }]}
      type="bar"
    />
  );
}

type RadialChartProps = {
  height?: number;
  /** 0–1. Nilai di atas 1 tetap digambar penuh; teks capaian menyebut angka sebenarnya. */
  share: number;
};

/** Busur setengah lingkaran untuk proporsi indikator yang mencapai target. */
export function MonitoringRadialChart({
  height = 330,
  share,
}: RadialChartProps) {
  const reducedMotion = useReducedMotion();
  const value = Math.min(Math.max(share, 0), 1) * 100;
  const options: ApexOptions = {
    chart: {
      animations: {
        dynamicAnimation: { enabled: !reducedMotion, speed: 350 },
        enabled: !reducedMotion,
        easing: "easeinout",
        speed: 800,
      },
      fontFamily: "inherit",
      height,
      sparkline: { enabled: true },
      type: "radialBar",
    },
    colors: [MONITORING_SERIES_COLOR],
    fill: { colors: [MONITORING_SERIES_COLOR], type: "solid" },
    labels: ["Capaian"],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { show: false },
          value: {
            color: "#1d2939",
            fontSize: "36px",
            fontWeight: "600",
            formatter: (val: number) => `${Math.round(val)}%`,
            offsetY: -40,
          },
        },
        endAngle: 85,
        hollow: { size: "80%" },
        startAngle: -85,
        track: { background: TRACK_COLOR, margin: 5, strokeWidth: "100%" },
      },
    },
    stroke: { lineCap: "round" },
  };

  return (
    <ApexChart
      height={height}
      options={options}
      series={[Number(value.toFixed(2))]}
      type="radialBar"
    />
  );
}
