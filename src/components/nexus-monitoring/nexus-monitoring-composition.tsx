"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import styles from "@/components/nexus-monitoring/nexus-monitoring.module.css";
import {
  MONITORING_COMPOSITION_COLORS,
  MonitoringCompositionChart,
} from "@/components/nexus-monitoring/nexus-monitoring-charts";
import { MonitoringChartFrame } from "@/components/nexus-monitoring/nexus-monitoring-ui";

/**
 * Satu bagian dari sebuah keseluruhan. `share` sudah dihitung di tempat
 * datanya disusun supaya cincin dan legenda tidak pernah membulatkan
 * proporsi yang sama dengan dua cara berbeda.
 */
export type MonitoringCompositionItem = {
  /** Keterangan pendek di bawah nama, misalnya jumlah indikator terkait. */
  detail: string;
  href?: string;
  id: string;
  label: string;
  share: number;
  value: number;
};

function percentLabel(share: number) {
  return `${Math.round(share * 100)}%`;
}

/**
 * Cincin komposisi beserta legendanya. Legenda memuat angka aslinya, sehingga
 * seluruh isi kartu tetap terbaca tanpa warna—cincin hanya menambahkan
 * proporsinya. Baris legenda yang mempunyai alamat menjadi jalan masuk ke
 * rumah datanya, sama seperti irisan cincin yang ditekan.
 */
export function MonitoringComposition({
  centerLabel,
  chartLabel,
  items,
  unitLabel,
}: {
  centerLabel: string;
  chartLabel: string;
  items: readonly MonitoringCompositionItem[];
  unitLabel: string;
}) {
  const router = useRouter();

  const slices = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        label: item.label,
        value: item.value,
      })),
    [items],
  );

  const hasLinks = items.some((item) => item.href);

  const openSource = useCallback(
    (id: string) => {
      const href = items.find((item) => item.id === id)?.href;
      if (href) router.push(href);
    },
    [items, router],
  );

  return (
    <div className={styles.composition}>
      <div className={styles.compositionChart} data-clickable={hasLinks}>
        <MonitoringChartFrame fluid label={chartLabel}>
          <MonitoringCompositionChart
            centerLabel={centerLabel}
            onSelect={hasLinks ? openSource : undefined}
            slices={slices}
            unitLabel={unitLabel}
          />
        </MonitoringChartFrame>
      </div>

      <ul className={styles.compositionLegend}>
        {items.map((item, index) => (
          <li className={styles.compositionRow} key={item.id}>
            <span
              aria-hidden="true"
              className={styles.compositionDot}
              data-empty={item.value === 0}
              style={
                item.value === 0
                  ? undefined
                  : {
                      background:
                        MONITORING_COMPOSITION_COLORS[
                          index % MONITORING_COMPOSITION_COLORS.length
                        ],
                    }
              }
            />
            <span className={styles.compositionCopy}>
              <strong>
                {item.href ? (
                  <Link href={item.href} prefetch={false}>
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </strong>
              <span>{item.detail}</span>
            </span>
            <span className={styles.compositionValue}>
              <strong>{item.value}</strong>
              <span>{percentLabel(item.share)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
