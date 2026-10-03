import type { NexusRecordTrailState } from "@/components/nexus-official-records/nexus-record-trail";
import detail from "@/components/nexus-workspace-ui/nexus-workspace-detail.module.css";

/**
 * Riwayat koreksi langsung pada rekam resmi: siapa yang mengoreksi, kapan,
 * nilai barunya, dan alasannya. Bagian ini hanya muncul bila rekam pernah
 * dikoreksi.
 */
export function NexusRecordTrailCorrections({
  sectionIndex,
  titleId,
  trail,
}: {
  sectionIndex: string;
  titleId: string;
  trail: NexusRecordTrailState;
}) {
  if (trail.state !== "ready" || trail.corrections.length === 0) return null;

  return (
    <section aria-labelledby={titleId} className={detail.detailSection}>
      <div className={detail.sectionHeading}>
        <div>
          <span className={detail.sectionIndex}>{sectionIndex}</span>
          <h3 id={titleId}>Riwayat koreksi</h3>
        </div>
        <p>Koreksi langsung oleh petugas</p>
      </div>
      <ol className={detail.correctionHistory}>
        {trail.corrections.map((correction) => (
          <li key={correction.id}>
            <strong>{correction.corrector}</strong>
            <span className={detail.correctionMeta}>
              {correction.correctedAt}
            </span>
            <ul>
              {correction.changes.map((change) => (
                <li key={change.label}>
                  {change.label} menjadi {change.value}
                </li>
              ))}
            </ul>
            <p>{correction.reason}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
