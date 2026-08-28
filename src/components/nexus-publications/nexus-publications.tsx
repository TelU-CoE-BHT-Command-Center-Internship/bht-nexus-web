"use client";

import { useDeferredValue, useEffect, useState } from "react";
import styles from "@/components/nexus-publications/nexus-publications.module.css";
import {
  nexusPublicationsLiveContent as content,
  quartileLabels,
  quartileOptions,
  sortOptions,
  workTypeLabels,
  workTypeOptions,
} from "@/components/nexus-publications/nexus-publications-live-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import { NexusWorkspaceSearch } from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  type NexusWorkspaceRecordColumn,
  NexusWorkspaceRecordTable,
  NexusWorkspaceTableAction,
  NexusWorkspaceTableBadge,
  NexusWorkspaceTablePrimary,
} from "@/components/nexus-workspace-ui/nexus-workspace-records";
import {
  type NexusSelectConfig,
  NexusWorkspaceSelect,
} from "@/components/nexus-workspace-ui/nexus-workspace-select";
import { ApiRequestError } from "@/lib/api-client";
import {
  createPublication,
  deletePublication,
  getPublication,
  listPublications,
  type PublicationListMeta,
  type PublicationRecord,
  type Quartile,
  updatePublication,
  type WorkType,
} from "@/lib/api-publications";

type DrawerState =
  | { mode: "create" }
  | { mode: "edit"; record: PublicationRecord }
  | null;

type FormValues = {
  citationCount: string;
  doi: string;
  isOfficial: boolean;
  issnL: string;
  quartile: Quartile | "";
  sjr: string;
  title: string;
  venue: string;
  workType: WorkType | "";
  year: string;
};

const emptyForm: FormValues = {
  citationCount: "0",
  doi: "",
  isOfficial: false,
  issnL: "",
  quartile: "",
  sjr: "",
  title: "",
  venue: "",
  workType: "",
  year: "",
};

const workTypeFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "work-type",
  label: content.fieldWorkType,
  options: [
    { label: content.filterAllTypes, value: "all" },
    ...workTypeOptions,
  ],
};

const statusFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "status",
  label: content.columns.status,
  options: [
    { label: content.filterAllStatus, value: "all" },
    { label: content.filterOfficial, value: "true" },
    { label: content.filterUnofficial, value: "false" },
  ],
};

const quartileFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "quartile",
  label: content.columns.quartile,
  options: [
    { label: content.filterAllQuartiles, value: "all" },
    ...quartileOptions,
  ],
};

const sortConfig: NexusSelectConfig = {
  defaultValue: sortOptions[0].value,
  id: "sort",
  label: content.sortByLabel,
  options: sortOptions,
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "page-size",
  label: content.pageSizeLabel,
  options: [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ],
};

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "title", label: content.columns.title, primary: true },
  { id: "workType", label: content.columns.workType },
  { id: "year", label: content.columns.year },
  { id: "venue", label: content.columns.venue },
  { id: "quartile", label: content.columns.quartile },
  { id: "citationCount", label: content.columns.citationCount },
  { id: "status", label: content.columns.status },
  { id: "actions", label: "" },
];

function formFromRecord(record: PublicationRecord): FormValues {
  return {
    citationCount: String(record.citationCount),
    doi: record.doi ?? "",
    isOfficial: record.isOfficial,
    issnL: record.issnL ?? "",
    quartile: record.quartile ?? "",
    sjr: record.sjr === null ? "" : String(record.sjr),
    title: record.title,
    venue: record.venue ?? "",
    workType: record.workType,
    year: String(record.year),
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }
  return "Terjadi kesalahan. Coba lagi.";
}

export function NexusPublications() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [workType, setWorkType] = useState("all");
  const [isOfficialFilter, setIsOfficialFilter] = useState("all");
  const [quartileFilter, setQuartileFilter] = useState("all");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>(
    sortOptions[0].value,
  );
  const [page, setPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");

  const [openSelectId, setOpenSelectId] = useState<string | null>(null);

  const [records, setRecords] = useState<PublicationRecord[]>([]);
  const [meta, setMeta] = useState<PublicationListMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: resets page to 1 whenever a filter changes, deps aren't read in the body
  useEffect(() => {
    setPage(1);
  }, [deferredSearch, workType, isOfficialFilter, quartileFilter, sortBy]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadToken is a manual refetch trigger, not read in the body
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    listPublications({
      isOfficial:
        isOfficialFilter === "all" ? undefined : isOfficialFilter === "true",
      limit: Number(pageSizeValue),
      page,
      quartile:
        quartileFilter === "all" ? undefined : (quartileFilter as Quartile),
      search: deferredSearch.trim() === "" ? undefined : deferredSearch.trim(),
      sortBy,
      sortOrder: "desc",
      workType: workType === "all" ? undefined : (workType as WorkType),
    })
      .then((result) => {
        if (cancelled) return;
        setRecords(result.data);
        setMeta(result.meta);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(errorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    deferredSearch,
    workType,
    isOfficialFilter,
    quartileFilter,
    sortBy,
    page,
    pageSizeValue,
    reloadToken,
  ]);

  function reload() {
    setReloadToken((token) => token + 1);
  }

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setDrawer({ mode: "create" });
  }

  async function openEdit(recordId: string) {
    setFormError(null);
    try {
      const record = await getPublication(recordId);
      setForm(formFromRecord(record));
      setDrawer({ mode: "edit", record });
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }

  function closeDrawer() {
    setDrawer(null);
    setConfirmingDeleteId(null);
  }

  function validateForm(): string | null {
    if (form.title.trim() === "") return "Judul wajib diisi.";
    if (form.workType === "") return "Jenis karya wajib dipilih.";
    const yearValue = Number(form.year);
    if (!Number.isInteger(yearValue) || yearValue < 1900 || yearValue > 2100) {
      return "Tahun terbit tidak valid.";
    }
    const citationValue = Number(form.citationCount);
    if (!Number.isInteger(citationValue) || citationValue < 0) {
      return "Jumlah sitasi tidak valid.";
    }
    if (form.sjr.trim() !== "") {
      const sjrValue = Number(form.sjr);
      if (!Number.isFinite(sjrValue) || sjrValue < 0) {
        return "SJR tidak valid.";
      }
    }
    return null;
  }

  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError !== null) {
      setFormError(validationError);
      return;
    }
    if (form.workType === "") return;

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      citationCount: Number(form.citationCount),
      doi: form.doi.trim() === "" ? null : form.doi.trim(),
      isOfficial: form.isOfficial,
      issnL: form.issnL.trim() === "" ? null : form.issnL.trim(),
      quartile: form.quartile === "" ? null : form.quartile,
      sjr: form.sjr.trim() === "" ? null : Number(form.sjr),
      title: form.title.trim(),
      venue: form.venue.trim() === "" ? null : form.venue.trim(),
      workType: form.workType,
      year: Number(form.year),
    };

    try {
      if (drawer?.mode === "edit") {
        await updatePublication(drawer.record.publicId, payload);
      } else {
        await createPublication(payload);
      }
      closeDrawer();
      reload();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (drawer?.mode !== "edit") return;
    if (confirmingDeleteId !== drawer.record.publicId) {
      setConfirmingDeleteId(drawer.record.publicId);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await deletePublication(drawer.record.publicId);
      closeDrawer();
      reload();
    } catch (error) {
      setFormError(errorMessage(error));
      setIsSubmitting(false);
    }
  }

  const rows = records.map((record) => ({
    cells: {
      actions: (
        <NexusWorkspaceTableAction
          label={`Ubah ${record.title}`}
          onClick={() => openEdit(record.publicId)}
        >
          Ubah
        </NexusWorkspaceTableAction>
      ),
      citationCount: record.citationCount,
      quartile:
        record.quartile === null ? (
          content.noQuartile
        ) : (
          <NexusWorkspaceTableBadge tone="neutral">
            {quartileLabels[record.quartile]}
          </NexusWorkspaceTableBadge>
        ),
      status: (
        <NexusWorkspaceTableBadge
          tone={record.isOfficial ? "success" : "neutral"}
        >
          {record.isOfficial ? content.official : content.unofficial}
        </NexusWorkspaceTableBadge>
      ),
      title: (
        <NexusWorkspaceTablePrimary
          onClick={() => openEdit(record.publicId)}
          title={record.title}
        />
      ),
      venue: record.venue ?? "—",
      workType: workTypeLabels[record.workType],
      year: record.year,
    },
    id: record.publicId,
    mobile: (
      <NexusWorkspaceTableAction
        label={`Ubah ${record.title}`}
        onClick={() => openEdit(record.publicId)}
      >
        {record.title}
      </NexusWorkspaceTableAction>
    ),
  }));

  return (
    <NexusWorkspacePage
      actions={
        <NexusWorkspaceButton onClick={openCreate} tone="primary" type="button">
          {content.createLabel}
        </NexusWorkspaceButton>
      }
      description={content.description}
      descriptionId="publications-description"
      title={content.title}
      titleId="publications-title"
    >
      {loadError !== null ? (
        <NexusWorkspaceNotice tone="danger">{loadError}</NexusWorkspaceNotice>
      ) : null}

      <div className={styles.toolbar}>
        <NexusWorkspaceSearch
          label={content.searchLabel}
          name="search"
          onValueChange={setSearch}
          placeholder={content.searchPlaceholder}
          value={search}
        />
        <NexusWorkspaceSelect
          config={workTypeFilterConfig}
          isOpen={openSelectId === "work-type"}
          name="filter-work-type"
          onOpenChange={(open) => setOpenSelectId(open ? "work-type" : null)}
          onValueChange={setWorkType}
          value={workType}
        />
        <NexusWorkspaceSelect
          config={statusFilterConfig}
          isOpen={openSelectId === "status"}
          name="filter-status"
          onOpenChange={(open) => setOpenSelectId(open ? "status" : null)}
          onValueChange={setIsOfficialFilter}
          value={isOfficialFilter}
        />
        <NexusWorkspaceSelect
          config={quartileFilterConfig}
          isOpen={openSelectId === "quartile"}
          name="filter-quartile"
          onOpenChange={(open) => setOpenSelectId(open ? "quartile" : null)}
          onValueChange={setQuartileFilter}
          value={quartileFilter}
        />
        <NexusWorkspaceSelect
          config={sortConfig}
          isOpen={openSelectId === "sort"}
          name="filter-sort"
          onOpenChange={(open) => setOpenSelectId(open ? "sort" : null)}
          onValueChange={(value) =>
            setSortBy(value as (typeof sortOptions)[number]["value"])
          }
          value={sortBy}
        />
      </div>

      <NexusWorkspaceRecordTable
        caption={content.tableCaption}
        columns={columns}
        empty={
          <NexusWorkspaceEmptyState
            description={content.emptyDescription}
            title={content.emptyTitle}
          />
        }
        isLoading={isLoading}
        pagination={
          <NexusTablePagination
            currentPage={page}
            itemCount={meta?.total ?? 0}
            navigationLabel={content.navigationLabel}
            nextPageLabel={content.nextPageLabel}
            onPageChange={setPage}
            onPageSizeChange={setPageSizeValue}
            pageLabel={content.pageLabel}
            pageSizeConfig={pageSizeConfig}
            pageSizeValue={pageSizeValue}
            previousPageLabel={content.previousPageLabel}
            rangePrefix={content.rangePrefix}
            totalUnit={content.resultUnit}
          />
        }
        rows={rows}
      />

      {drawer !== null ? (
        <NexusWorkspaceDrawer
          closeLabel={content.drawerCloseLabel}
          description={content.description}
          eyebrow={
            drawer.mode === "edit" ? content.editEyebrow : content.newEyebrow
          }
          onClose={closeDrawer}
          title={
            drawer.mode === "edit" ? drawer.record.title : content.newEyebrow
          }
        >
          <div className={styles.form}>
            {formError !== null ? (
              <NexusWorkspaceNotice tone="danger">
                {formError}
              </NexusWorkspaceNotice>
            ) : null}

            <NexusWorkspaceFormField
              id="publication-title"
              label={content.fieldTitle}
              name="title"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              type="text"
              value={form.title}
              wide
            />

            <NexusWorkspaceFormField
              id="publication-work-type"
              label={content.fieldWorkType}
              name="workType"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  workType: event.target.value as WorkType,
                }))
              }
              options={workTypeOptions}
              required
              type="select"
              value={form.workType}
            />

            <NexusWorkspaceFormField
              id="publication-year"
              label={content.fieldYear}
              min={1900}
              name="year"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  year: event.target.value,
                }))
              }
              required
              type="number"
              value={form.year}
            />

            <NexusWorkspaceFormField
              id="publication-venue"
              label={content.fieldVenue}
              name="venue"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  venue: event.target.value,
                }))
              }
              type="text"
              value={form.venue}
            />

            <NexusWorkspaceFormField
              id="publication-doi"
              label={content.fieldDoi}
              name="doi"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  doi: event.target.value,
                }))
              }
              type="text"
              value={form.doi}
            />

            <NexusWorkspaceFormField
              id="publication-issn-l"
              label={content.fieldIssnL}
              name="issnL"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  issnL: event.target.value,
                }))
              }
              type="text"
              value={form.issnL}
            />

            <NexusWorkspaceFormField
              id="publication-quartile"
              label={content.fieldQuartile}
              name="quartile"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  quartile: event.target.value as Quartile,
                }))
              }
              options={quartileOptions}
              type="select"
              value={form.quartile}
            />

            <NexusWorkspaceFormField
              id="publication-sjr"
              label={content.fieldSjr}
              min={0}
              name="sjr"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sjr: event.target.value,
                }))
              }
              type="number"
              value={form.sjr}
            />

            <NexusWorkspaceFormField
              id="publication-citation-count"
              label={content.fieldCitationCount}
              min={0}
              name="citationCount"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  citationCount: event.target.value,
                }))
              }
              type="number"
              value={form.citationCount}
            />

            <label className={styles.checkboxField}>
              <input
                checked={form.isOfficial}
                name="isOfficial"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isOfficial: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>{content.fieldIsOfficial}</span>
            </label>

            {confirmingDeleteId !== null ? (
              <NexusWorkspaceNotice tone="danger">
                {content.deleteConfirmPrompt}
              </NexusWorkspaceNotice>
            ) : null}

            <div className={styles.formActions}>
              {drawer.mode === "edit" ? (
                <NexusWorkspaceButton
                  disabled={isSubmitting}
                  onClick={handleDelete}
                  tone="danger"
                  type="button"
                >
                  {confirmingDeleteId !== null
                    ? content.deleteConfirmLabel
                    : content.removeLabel}
                </NexusWorkspaceButton>
              ) : null}
              <NexusWorkspaceButton
                disabled={isSubmitting}
                onClick={handleSubmit}
                tone="primary"
                type="button"
              >
                {isSubmitting ? content.savingLabel : content.saveLabel}
              </NexusWorkspaceButton>
            </div>
          </div>
        </NexusWorkspaceDrawer>
      ) : null}
    </NexusWorkspacePage>
  );
}
