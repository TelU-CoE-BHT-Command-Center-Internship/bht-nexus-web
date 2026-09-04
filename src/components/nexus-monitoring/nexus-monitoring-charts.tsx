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

const MONITORING_SERIES_COLOR = "#5c4fd0";
const MONITORING_REACHED_COLOR = "#4776e6";
const MONITORING_NOT_REACHED_COLOR = "#e5a83c";
const MONITORING_UNAVAILABLE_COLOR = "#cfd4dc";
const TRACK_COLOR = "#e4e7ec";

/**
 * Warna irisan komposisi. Urutannya sengaja berselang rona supaya dua irisan
 * yang bersebelahan tidak pernah berdekatan warnanya; jumlah rumah data yang
 * mungkin muncul pada satu domain tidak melebihi panjang daftar ini.
 */
export const MONITORING_COMPOSITION_COLORS = [
  "#5c4fd0",
  "#e5a83c",
  "#3e7bfa",
  "#12a150",
  "#0ea5b7",
  "#9061c2",
] as const;

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

export type MonitoringDomainTargetPoint = {
  id: string;
  label: string;
  notReached: number;
  reached: number;
  unavailable: number;
};

/**
 * Satu batang bertumpuk per domain. Segmen abu-abu menyatakan indikator yang
 * belum dapat dihitung—bukan capaian nol—agar seluruh domain tetap mempunyai
 * slot yang siap menerima kalkulasi ketika evaluatornya tersedia.
 */
export function MonitoringDomainTargetChart({
  height = 260,
  points,
}: {
  height?: number;
  points: readonly MonitoringDomainTargetPoint[];
}) {
  const reducedMotion = useReducedMotion();
  const options: ApexOptions = {
    ...baseOptions(reducedMotion),
    chart: {
      ...baseOptions(reducedMotion).chart,
      selection: { enabled: false },
      stacked: true,
      toolbar: { show: false },
      zoom: {
        allowMouseWheelZoom: false,
        enabled: false,
        pinch: false,
      },
    },
    colors: [
      MONITORING_REACHED_COLOR,
      MONITORING_NOT_REACHED_COLOR,
      MONITORING_UNAVAILABLE_COLOR,
    ],
    dataLabels: {
      enabled: true,
      formatter: (value: number) => (value > 0 ? wholeNumberLabel(value) : ""),
      style: {
        colors: ["#ffffff", "#5f3b00", "#344054"],
        fontSize: "11px",
        fontWeight: 600,
      },
    },
    fill: { opacity: 1 },
    legend: {
      ...baseOptions(reducedMotion).legend,
      horizontalAlign: "center",
      itemMargin: { horizontal: 10, vertical: 4 },
      position: "bottom",
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusApplication: "end",
        columnWidth: "58%",
        horizontal: false,
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          dataLabels: { style: { fontSize: "10px" } },
          legend: {
            fontSize: "10px",
            itemMargin: { horizontal: 5, vertical: 3 },
          },
          plotOptions: { bar: { columnWidth: "66%" } },
          xaxis: {
            labels: {
              hideOverlappingLabels: false,
              maxHeight: 64,
              rotate: -52,
              rotateAlways: true,
              style: { fontSize: "9px" },
              trim: false,
            },
          },
        },
      },
    ],
    stroke: { show: false, width: 0 },
    tooltip: {
      ...baseOptions(reducedMotion).tooltip,
      intersect: false,
      shared: true,
      y: {
        formatter: (value: number) => `${wholeNumberLabel(value)} indikator`,
      },
    },
    xaxis: {
      axisBorder: { show: false },
      axisTicks: { show: false },
      categories: points.map((point) => point.label),
      labels: {
        hideOverlappingLabels: false,
        offsetX: 0,
        rotate: 0,
        rotateAlways: false,
        style: { colors: "#667085", fontSize: "11px" },
        trim: false,
      },
      offsetX: 0,
      tickPlacement: "on",
    },
    yaxis: {
      forceNiceScale: false,
      labels: {
        formatter: wholeNumberLabel,
        style: { colors: "#667085", fontSize: "11px" },
      },
      max: Math.max(
        1,
        ...points.map(
          (point) => point.reached + point.notReached + point.unavailable,
        ),
      ),
      min: 0,
      tickAmount: 5,
    },
  };

  return (
    <ApexChart
      height={height}
      options={options}
      series={[
        {
          data: points.map((point) => point.reached),
          name: "Memenuhi target",
        },
        {
          data: points.map((point) => point.notReached),
          name: "Belum memenuhi",
        },
        {
          data: points.map((point) => point.unavailable),
          name: "Belum dihitung",
        },
      ]}
      type="bar"
    />
  );
}

type RadialChartProps = {
  centerLabel?: string;
  height?: number;
  nameOffsetY?: number;
  /** 0–1. Nilai di atas 1 tetap digambar penuh; teks capaian menyebut angka sebenarnya. */
  share: number;
  valueLabel?: string;
  valueOffsetY?: number;
};

/** Busur setengah lingkaran untuk proporsi indikator yang mencapai target. */
export function MonitoringRadialChart({
  centerLabel,
  height = 330,
  nameOffsetY = -14,
  share,
  valueLabel,
  valueOffsetY = -40,
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
    labels: [centerLabel ?? "Capaian"],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            color: "#667085",
            fontSize: "12px",
            fontWeight: 500,
            offsetY: nameOffsetY,
            show: Boolean(centerLabel),
          },
          value: {
            color: "#1d2939",
            fontSize: "36px",
            fontWeight: "600",
            formatter: (val: number) => valueLabel ?? `${Math.round(val)}%`,
            offsetY: valueOffsetY,
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

export type MonitoringCompositionSlice = {
  id: string;
  label: string;
  value: number;
};

/**
 * Cincin komposisi untuk nilai yang benar-benar bagian dari satu keseluruhan.
 * Angka persisnya tetap dibaca dari legenda di sebelahnya, jadi cincin ini
 * hanya menyatakan proporsi dan tidak pernah menjadi satu-satunya tempat
 * sebuah angka muncul.
 */
export function MonitoringCompositionChart({
  centerLabel,
  height = 232,
  onSelect,
  slices,
  unitLabel,
}: {
  centerLabel: string;
  height?: number;
  /** Dipanggil saat sebuah irisan ditekan; tanpa ini cincin tidak dapat ditekan. */
  onSelect?: (id: string) => void;
  slices: readonly MonitoringCompositionSlice[];
  unitLabel: string;
}) {
  const reducedMotion = useReducedMotion();
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const options: ApexOptions = {
    chart: {
      animations: {
        animateGradually: { delay: 120, enabled: !reducedMotion },
        dynamicAnimation: { enabled: !reducedMotion, speed: 350 },
        enabled: !reducedMotion,
        easing: "easeinout",
        speed: 700,
      },
      events: onSelect
        ? {
            dataPointSelection: (_event, _context, config) => {
              const index = config?.dataPointIndex;
              const slice =
                typeof index === "number" ? slices[index] : undefined;
              if (slice) onSelect(slice.id);
            },
          }
        : undefined,
      fontFamily: "inherit",
      toolbar: { show: false },
    },
    colors: [...MONITORING_COMPOSITION_COLORS],
    dataLabels: { enabled: false },
    labels: slices.map((slice) => slice.label),
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            name: {
              color: "#667085",
              fontSize: "12px",
              fontWeight: 500,
              offsetY: 18,
            },
            show: true,
            total: {
              color: "#667085",
              fontSize: "12px",
              fontWeight: 500,
              formatter: () => wholeNumberLabel(total),
              label: centerLabel,
              show: true,
              showAlways: true,
            },
            value: {
              color: "#1d2939",
              fontSize: "28px",
              fontWeight: 600,
              formatter: wholeNumberLabel,
              offsetY: -18,
            },
          },
          size: "68%",
        },
        expandOnClick: false,
      },
    },
    states: {
      active: { filter: { type: "none" } },
      hover: { filter: { type: "lighten", value: 0.12 } },
    },
    stroke: { colors: ["#ffffff"], width: 2 },
    tooltip: {
      ...baseOptions(reducedMotion).tooltip,
      y: {
        formatter: (value: number) => `${wholeNumberLabel(value)} ${unitLabel}`,
      },
    },
  };

  return (
    <ApexChart
      height={height}
      options={options}
      series={slices.map((slice) => slice.value)}
      type="donut"
    />
  );
}
