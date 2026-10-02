"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import styles from "@/components/nexus-cluster-scope/nexus-cluster-manager.module.css";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import {
  useNexusWorkspaceProceed,
  useNexusWorkspaceUnsavedChanges,
} from "@/components/nexus-workspace-ui/nexus-workspace-unsaved-changes";
import { apiErrorMessage } from "@/lib/api-client";
import {
  createDivision,
  listDivisions,
  type NexusDivision,
  updateDivision,
} from "@/lib/api-divisions";
import { listAllMembers, type MemberSummary } from "@/lib/api-members";

const emptyDraft = {
  code: "",
  description: "",
  leaderMemberPublicId: "",
  name: "",
};

export function NexusClusterManager() {
  const router = useRouter();
  const proceed = useNexusWorkspaceProceed();
  const [open, setOpen] = useState(false);
  const [divisions, setDivisions] = useState<NexusDivision[]>([]);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [editing, setEditing] = useState<string>();
  const [draft, setDraft] = useState(emptyDraft);
  const [initial, setInitial] = useState(emptyDraft);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useNexusWorkspaceUnsavedChanges({
    isDirty: open && JSON.stringify(draft) !== JSON.stringify(initial),
    title: "Perubahan klaster belum disimpan",
    description:
      "Simpan perubahan klaster sebelum meninggalkan formulir, atau buang perubahan untuk melanjutkan.",
    confirmLabel: "Buang perubahan",
  });

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setLoaded(false);
    Promise.all([listDivisions(), listAllMembers()])
      .then(([rows, people]) => {
        if (cancelled) return;
        setDivisions(rows);
        setMembers(people);
        setLoaded(true);
        setError("");
      })
      .catch((reason) => {
        if (!cancelled)
          setError(
            apiErrorMessage(
              reason,
              "Daftar klaster belum dapat dimuat. Tutup lalu buka kembali untuk mencoba lagi.",
            ),
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function select(row?: NexusDivision) {
    proceed(() => {
      const next = row
        ? {
            code: row.code ?? "",
            description: row.description ?? "",
            leaderMemberPublicId: row.leader?.publicId ?? "",
            name: row.name,
          }
        : emptyDraft;
      setEditing(row?.publicId);
      setInitial(next);
      setDraft(next);
      setError("");
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !loaded) return;
    if (!draft.name.trim()) {
      setError("Nama klaster wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = {
        name: draft.name.trim(),
        code: draft.code.trim() || null,
        description: draft.description.trim() || null,
      };
      if (editing)
        await updateDivision(editing, {
          ...body,
          leaderMemberPublicId: draft.leaderMemberPublicId || null,
        });
      else await createDivision(body);
      setInitial(draft);
      setOpen(false);
      setNotice(
        editing
          ? "Perubahan klaster tersimpan."
          : "Klaster berhasil ditambahkan. Pilih klaster ini saat menambah atau mengubah profil anggota.",
      );
      router.refresh();
    } catch (reason) {
      setError(
        apiErrorMessage(
          reason,
          "Klaster belum dapat disimpan. Periksa isian lalu coba lagi.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.manager}>
      <NexusWorkspaceButton
        onClick={() => {
          setEditing(undefined);
          setDraft(emptyDraft);
          setInitial(emptyDraft);
          setError("");
          setOpen(true);
        }}
        type="button"
      >
        Kelola klaster
      </NexusWorkspaceButton>
      {notice ? (
        <NexusWorkspaceNotice tone="success">{notice}</NexusWorkspaceNotice>
      ) : null}
      {open ? (
        <NexusWorkspaceDrawer
          title="Kelola klaster"
          eyebrow="Keanggotaan CoE BHT"
          description="Tambah klaster, ubah namanya, dan pilih ketuanya. Keanggotaan diatur melalui Tambah anggota atau Ubah profil pada direktori anggota."
          closeLabel="Tutup pengaturan klaster"
          onClose={() => {
            if (!saving) proceed(() => setOpen(false));
          }}
        >
          {loading ? <output>Memuat klaster dan anggota…</output> : null}
          <div className={styles.choices}>
            <NexusWorkspaceButton
              disabled={saving || loading}
              onClick={() => select()}
              type="button"
              tone={editing ? "secondary" : "primary"}
            >
              Tambah klaster
            </NexusWorkspaceButton>
            {divisions.map((row) => (
              <NexusWorkspaceButton
                disabled={saving || loading}
                key={row.publicId}
                onClick={() => select(row)}
                type="button"
                tone={editing === row.publicId ? "primary" : "secondary"}
              >
                {row.name}
              </NexusWorkspaceButton>
            ))}
          </div>
          <form className={styles.form} onSubmit={save} noValidate>
            <h3>{editing ? "Ubah klaster" : "Klaster baru"}</h3>
            <NexusWorkspaceFormField
              id="cluster-name"
              label="Nama klaster"
              name="name"
              type="text"
              required
              value={draft.name}
              disabled={saving || loading}
              onChange={(event) =>
                setDraft({ ...draft, name: event.currentTarget.value })
              }
            />
            <NexusWorkspaceFormField
              id="cluster-code"
              label="Kode klaster"
              name="code"
              type="text"
              hint="Opsional, maksimal 32 karakter."
              value={draft.code}
              disabled={saving || loading}
              onChange={(event) =>
                setDraft({ ...draft, code: event.currentTarget.value })
              }
            />
            <NexusWorkspaceFormField
              id="cluster-description"
              label="Keterangan"
              name="description"
              type="textarea"
              value={draft.description}
              disabled={saving || loading}
              onChange={(event) =>
                setDraft({ ...draft, description: event.currentTarget.value })
              }
            />
            {editing ? (
              <NexusWorkspaceFormField
                id="cluster-leader"
                label="Ketua klaster"
                name="leaderMemberPublicId"
                type="select"
                hint="Pilihan berisi anggota klaster ini. Berikan juga peran Ketua klaster pada akun orang tersebut melalui Administrasi agar batas aksesnya berlaku."
                options={[
                  { value: "", label: "Belum ditetapkan" },
                  ...members
                    .filter((person) => person.division?.publicId === editing)
                    .map((person) => ({
                      value: person.publicId,
                      label: person.name,
                    })),
                ]}
                value={draft.leaderMemberPublicId}
                disabled={saving || loading}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    leaderMemberPublicId: event.currentTarget.value,
                  })
                }
              />
            ) : (
              <p>
                Setelah klaster dibuat, masukkan anggotanya melalui profil
                anggota. Kemudian buka kembali pengaturan ini untuk memilih
                ketua.
              </p>
            )}
            {error ? (
              <NexusWorkspaceNotice tone="danger">{error}</NexusWorkspaceNotice>
            ) : null}
            <NexusWorkspaceButton
              disabled={saving || !loaded}
              tone="primary"
              type="submit"
            >
              {saving ? "Menyimpan…" : "Simpan klaster"}
            </NexusWorkspaceButton>
          </form>
        </NexusWorkspaceDrawer>
      ) : null}
    </div>
  );
}
