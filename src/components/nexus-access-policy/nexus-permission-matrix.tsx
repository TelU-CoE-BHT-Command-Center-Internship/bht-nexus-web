"use client";

import {
  type NexusPermissionId,
  nexusAccessActions,
  nexusAccessModules,
} from "@/components/nexus-access-policy/nexus-access-policy";
import styles from "@/components/nexus-access-policy/nexus-permission-matrix.module.css";
import { DashboardShellIcon } from "@/components/nexus-dashboard-shell/nexus-dashboard-shell-icons";

type NexusPermissionMatrixProps = {
  granted: ReadonlySet<NexusPermissionId>;
  isReadOnly: boolean;
  onToggle: (permissionId: NexusPermissionId, isGranted: boolean) => void;
  roleLabel: string;
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m3.4 8.4 3 3 6.2-6.6" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="M4.2 8h7.6" />
    </svg>
  );
}

function accessSwitchLabel(
  actionPhrase: string,
  moduleLabel: string,
  roleLabel: string,
) {
  return `Izinkan peran ${roleLabel} ${actionPhrase} ${moduleLabel}`;
}

/**
 * Seluruh area label menjadi target klik, sehingga mematikan izin sama mudahnya
 * dengan menyalakannya. Lebar teks keadaan dikunci agar kendali tidak bergeser
 * ketika labelnya berubah dari Nonaktif menjadi Aktif.
 */
function AccessSwitch({
  isGranted,
  isReadOnly,
  label,
  onToggle,
  title,
}: {
  isGranted: boolean;
  isReadOnly: boolean;
  label: string;
  onToggle: (isGranted: boolean) => void;
  title?: string;
}) {
  return (
    <label className={styles.switchWrap} data-disabled={isReadOnly}>
      <input
        aria-label={label}
        checked={isGranted}
        className={styles.switchInput}
        disabled={isReadOnly}
        onChange={(event) => onToggle(event.currentTarget.checked)}
        type="checkbox"
      />
      {title ? <span className={styles.switchTitle}>{title}</span> : null}
      <span aria-hidden="true" className={styles.switchTrack}>
        <span className={styles.switchKnob}>
          <span className={styles.switchOn}>
            <CheckIcon />
          </span>
          <span className={styles.switchOff}>
            <DashIcon />
          </span>
        </span>
      </span>
      <span aria-hidden="true" className={styles.switchState}>
        {isGranted ? "Aktif" : "Nonaktif"}
      </span>
    </label>
  );
}

/**
 * Matriks hak akses bawaan peran. Kombinasi modul dan tindakan yang tidak
 * berlaku ditandai sebagai tidak tersedia, bukan sebagai izin nonaktif, supaya
 * tidak ada kendali yang bisa dinyalakan tanpa fungsi yang mendasarinya.
 */
export function NexusPermissionMatrix({
  granted,
  isReadOnly,
  onToggle,
  roleLabel,
}: NexusPermissionMatrixProps) {
  return (
    <>
      <div className={styles.desktopMatrix}>
        <table>
          <caption className={styles.visuallyHidden}>
            {`Hak akses bawaan peran ${roleLabel} untuk setiap modul dan tindakan`}
          </caption>
          <thead>
            <tr>
              <th scope="col">Modul / Fungsi</th>
              {nexusAccessActions.map((action) => (
                <th data-action={action.id} key={action.id} scope="col">
                  {action.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nexusAccessModules.map((module) => (
              <tr key={module.id}>
                <th scope="row">
                  <span aria-hidden="true" className={styles.moduleIcon}>
                    <DashboardShellIcon name={module.icon} />
                  </span>
                  <span className={styles.moduleCopy}>
                    <strong>{module.label}</strong>
                    <small>{module.description}</small>
                  </span>
                </th>
                {nexusAccessActions.map((action) => {
                  const permission = module.permissions.find(
                    (candidate) => candidate.action === action.id,
                  );
                  return (
                    <td data-action={action.id} key={action.id}>
                      {permission ? (
                        <AccessSwitch
                          isGranted={granted.has(permission.id)}
                          isReadOnly={isReadOnly}
                          label={accessSwitchLabel(
                            action.controlPhrase,
                            module.label,
                            roleLabel,
                          )}
                          onToggle={(isGranted) =>
                            onToggle(permission.id, isGranted)
                          }
                        />
                      ) : (
                        <span className={styles.notApplicable}>
                          <span aria-hidden="true">—</span>
                          <span className={styles.visuallyHidden}>
                            {`${action.label} tidak berlaku untuk ${module.label}`}
                          </span>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileMatrix}>
        {nexusAccessModules.map((module) => (
          <article className={styles.moduleCard} key={module.id}>
            <header>
              <span aria-hidden="true" className={styles.moduleIcon}>
                <DashboardShellIcon name={module.icon} />
              </span>
              <div>
                <h4>{module.label}</h4>
                <p>{module.description}</p>
              </div>
            </header>
            <ul>
              {nexusAccessActions.map((action) => {
                const permission = module.permissions.find(
                  (candidate) => candidate.action === action.id,
                );
                if (!permission) return null;
                return (
                  <li key={action.id}>
                    <AccessSwitch
                      isGranted={granted.has(permission.id)}
                      isReadOnly={isReadOnly}
                      label={accessSwitchLabel(
                        action.controlPhrase,
                        module.label,
                        roleLabel,
                      )}
                      onToggle={(isGranted) =>
                        onToggle(permission.id, isGranted)
                      }
                      title={action.label}
                    />
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}
