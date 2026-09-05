"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  nexusRoleLiveContent as content,
  roleCategoryLabels,
  roleCategoryOptions,
} from "@/components/nexus-access-policy/nexus-role-live-content";
import { NexusTablePagination } from "@/components/nexus-workspace-ui/nexus-table-pagination";
import {
  NexusWorkspaceSearch,
  NexusWorkspaceToolbar,
} from "@/components/nexus-workspace-ui/nexus-workspace-controls";
import { NexusWorkspaceDrawer } from "@/components/nexus-workspace-ui/nexus-workspace-drawer";
import {
  NexusWorkspaceButton,
  NexusWorkspaceEmptyState,
  NexusWorkspaceNotice,
} from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";
import { NexusWorkspacePage } from "@/components/nexus-workspace-ui/nexus-workspace-page";
import {
  NexusWorkspaceCatalog,
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
  createRole,
  deleteRole,
  getRole,
  grantRolePermission,
  listRolePermissionGrants,
  listRoles,
  type PermissionGrantEntry,
  type RoleCategory,
  type RoleRecord,
  revokeRolePermission,
  updateRole,
} from "@/lib/api-roles";

type DrawerState =
  | { mode: "create" }
  | { mode: "edit"; record: RoleRecord }
  | null;

type FormValues = {
  category: RoleCategory | "";
  descriptionId: string;
  displayNameId: string;
  name: string;
  priority: string;
};

const emptyForm: FormValues = {
  category: "",
  descriptionId: "",
  displayNameId: "",
  name: "",
  priority: "0",
};

const pageSizeConfig: NexusSelectConfig = {
  defaultValue: "10",
  id: "role-page-size",
  label: "Baris per halaman",
  options: [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ],
};

const typeFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "type",
  label: content.columns.type,
  options: [
    { label: content.filterAllTypes, value: "all" },
    { label: content.filterSystem, value: "system" },
    { label: content.filterCustom, value: "custom" },
  ],
};

const categoryFilterConfig: NexusSelectConfig = {
  defaultValue: "all",
  id: "category",
  label: content.columns.category,
  options: [
    { label: content.filterAllCategories, value: "all" },
    ...roleCategoryOptions,
  ],
};

const columns: readonly NexusWorkspaceRecordColumn[] = [
  { id: "name", label: content.columns.name, primary: true },
  { id: "category", label: content.columns.category },
  { id: "type", label: content.columns.type },
  { id: "priority", label: content.columns.priority },
  { id: "actions", label: content.columns.action },
];

function formFromRecord(record: RoleRecord): FormValues {
  return {
    category: record.category ?? "",
    descriptionId: record.description?.id ?? "",
    displayNameId: record.displayName?.id ?? "",
    name: record.name,
    priority: String(record.priority),
  };
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }
  return "Terjadi kesalahan. Coba lagi.";
}

function TypeBadge({ record }: { record: RoleRecord }) {
  return (
    <NexusWorkspaceTableBadge
      tone={record.type === "system" ? "info" : "neutral"}
    >
      {record.type === "system" ? content.filterSystem : content.filterCustom}
    </NexusWorkspaceTableBadge>
  );
}

export function NexusRoleManagementLive() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const isSearchUpdating = search !== deferredSearch;
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSizeValue, setPageSizeValue] = useState("10");

  const [records, setRecords] = useState<RoleRecord[]>([]);
  const [total, setTotal] = useState(0);
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

  const [permissions, setPermissions] = useState<PermissionGrantEntry[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [pendingPermissionId, setPendingPermissionId] = useState<string | null>(
    null,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: resets page to 1 whenever a filter changes, deps aren't read in the body
  useEffect(() => {
    setPage(1);
  }, [deferredSearch, typeFilter, categoryFilter]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reloadToken is a manual refetch trigger, not read in the body
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    listRoles({ limit: Number(pageSizeValue), page })
      .then((result) => {
        if (cancelled) return;
        const filtered = result.data.filter(
          (role) =>
            (typeFilter === "all" || role.type === typeFilter) &&
            (categoryFilter === "all" || role.category === categoryFilter) &&
            (deferredSearch.trim() === "" ||
              role.name
                .toLocaleLowerCase()
                .includes(deferredSearch.trim().toLocaleLowerCase())),
        );
        setRecords(filtered);
        setTotal(result.meta.total);
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
    typeFilter,
    categoryFilter,
    page,
    pageSizeValue,
    reloadToken,
  ]);

  function reload() {
    setReloadToken((token) => token + 1);
  }

  // ponytail: server caps limit at 100 and this list has no pagination of its
  // own yet, so a permission catalog past 100 entries would silently truncate
  // here. Add pagination to this section if the catalog grows past that.
  function loadPermissions(rolePublicId: string) {
    setPermissionsLoading(true);
    setPermissionsError(null);
    listRolePermissionGrants(rolePublicId, { limit: 100 })
      .then((result) => setPermissions(result.data))
      .catch((error: unknown) => setPermissionsError(errorMessage(error)))
      .finally(() => setPermissionsLoading(false));
  }

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setPermissions([]);
    setDrawer({ mode: "create" });
  }

  async function openEdit(publicId: string) {
    setFormError(null);
    try {
      const record = await getRole(publicId);
      setForm(formFromRecord(record));
      setDrawer({ mode: "edit", record });
      loadPermissions(publicId);
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }

  function closeDrawer() {
    setDrawer(null);
    setConfirmingDeleteId(null);
    setPermissions([]);
    setPermissionsError(null);
  }

  function validateForm(): string | null {
    if (form.name.trim() === "") return "Nama peran wajib diisi.";
    if (!/^[a-z][a-z0-9_.]*$/.test(form.name.trim())) {
      return content.namePattern;
    }
    const priorityValue = Number(form.priority);
    if (!Number.isInteger(priorityValue) || priorityValue < 0) {
      return "Prioritas tidak valid.";
    }
    return null;
  }

  async function handleSubmit() {
    const validationError = validateForm();
    if (validationError !== null) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      category: form.category === "" ? null : form.category,
      description:
        form.descriptionId.trim() === ""
          ? undefined
          : { id: form.descriptionId.trim() },
      displayName:
        form.displayNameId.trim() === ""
          ? undefined
          : { id: form.displayNameId.trim() },
      name: form.name.trim(),
      priority: Number(form.priority),
    };

    try {
      if (drawer?.mode === "edit") {
        await updateRole(drawer.record.publicId, payload);
      } else {
        await createRole(payload);
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
      await deleteRole(drawer.record.publicId);
      closeDrawer();
      reload();
    } catch (error) {
      setFormError(errorMessage(error));
      setIsSubmitting(false);
    }
  }

  async function togglePermission(entry: PermissionGrantEntry) {
    if (drawer?.mode !== "edit") return;
    setPendingPermissionId(entry.permissionPublicId);
    setPermissionsError(null);
    try {
      if (entry.granted) {
        await revokeRolePermission(
          drawer.record.publicId,
          entry.permissionPublicId,
        );
      } else {
        await grantRolePermission(
          drawer.record.publicId,
          entry.permissionPublicId,
        );
      }
      setPermissions((current) =>
        current.map((item) =>
          item.permissionPublicId === entry.permissionPublicId
            ? { ...item, granted: !item.granted }
            : item,
        ),
      );
    } catch (error) {
      setPermissionsError(errorMessage(error));
    } finally {
      setPendingPermissionId(null);
    }
  }

  const hasActiveFilters =
    search.length > 0 || typeFilter !== "all" || categoryFilter !== "all";

  function resetFilters() {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setPage(1);
  }

  const rows = records.map((record) => ({
    cells: {
      actions: (
        <NexusWorkspaceTableAction
          label={`Ubah ${record.name}`}
          onClick={() => openEdit(record.publicId)}
        >
          Ubah
        </NexusWorkspaceTableAction>
      ),
      category: (
        <span>
          {record.category
            ? roleCategoryLabels[record.category]
            : content.noCategory}
        </span>
      ),
      name: (
        <NexusWorkspaceTablePrimary
          onClick={() => openEdit(record.publicId)}
          subtitle={record.displayName?.id}
          title={record.name}
        />
      ),
      priority: record.priority,
      type: <TypeBadge record={record} />,
    },
    id: record.publicId,
    mobile: (
      <NexusWorkspaceTableAction
        label={`Ubah ${record.name}`}
        onClick={() => openEdit(record.publicId)}
      >
        {record.name}
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
      descriptionId="role-management-description"
      title="Peran & Hak Akses"
      titleId="role-management-title"
    >
      {loadError !== null ? (
        <NexusWorkspaceNotice tone="danger">{loadError}</NexusWorkspaceNotice>
      ) : null}

      <NexusWorkspaceCatalog labelledBy="role-management-title">
        <NexusWorkspaceToolbar>
          <NexusWorkspaceSearch
            label={content.searchLabel}
            name="search"
            onValueChange={setSearch}
            placeholder={content.searchPlaceholder}
            value={search}
          />
          <NexusWorkspaceSelect
            config={typeFilterConfig}
            isOpen={openSelectId === "type"}
            name="filter-type"
            onOpenChange={(open) => setOpenSelectId(open ? "type" : null)}
            onValueChange={setTypeFilter}
            value={typeFilter}
          />
          <NexusWorkspaceSelect
            config={categoryFilterConfig}
            isOpen={openSelectId === "category"}
            name="filter-category"
            onOpenChange={(open) => setOpenSelectId(open ? "category" : null)}
            onValueChange={setCategoryFilter}
            value={categoryFilter}
          />
        </NexusWorkspaceToolbar>

        <NexusWorkspaceRecordTable
          caption={content.tableCaption}
          columns={columns}
          empty={
            <NexusWorkspaceEmptyState
              description={
                hasActiveFilters
                  ? content.emptyDescription
                  : content.emptyTrueDescription
              }
              onResetFilters={hasActiveFilters ? resetFilters : undefined}
              title={
                hasActiveFilters ? content.emptyTitle : content.emptyTrueTitle
              }
            />
          }
          isLoading={isLoading || isSearchUpdating}
          pagination={
            <NexusTablePagination
              currentPage={page}
              itemCount={total}
              navigationLabel="Navigasi halaman peran"
              nextPageLabel="Halaman berikutnya"
              onPageChange={setPage}
              onPageSizeChange={setPageSizeValue}
              pageLabel="Halaman"
              pageSizeConfig={pageSizeConfig}
              pageSizeValue={pageSizeValue}
              previousPageLabel="Halaman sebelumnya"
              rangePrefix="Menampilkan"
              totalUnit={content.resultUnit}
            />
          }
          rows={rows}
        />
      </NexusWorkspaceCatalog>

      {drawer !== null ? (
        <NexusWorkspaceDrawer
          closeLabel={content.drawerCloseLabel}
          description={content.description}
          eyebrow={
            drawer.mode === "edit" ? content.editEyebrow : content.newEyebrow
          }
          onClose={closeDrawer}
          title={
            drawer.mode === "edit" ? drawer.record.name : content.newEyebrow
          }
        >
          <div>
            {formError !== null ? (
              <NexusWorkspaceNotice tone="danger">
                {formError}
              </NexusWorkspaceNotice>
            ) : null}

            <NexusWorkspaceFormField
              hint={content.namePattern}
              id="role-name"
              label={content.fieldName}
              name="name"
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
              type="text"
              value={form.name}
              wide
            />
            <NexusWorkspaceFormField
              id="role-display-name"
              label={content.fieldDisplayNameId}
              name="displayNameId"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  displayNameId: event.target.value,
                }))
              }
              type="text"
              value={form.displayNameId}
              wide
            />
            <NexusWorkspaceFormField
              id="role-description"
              label={content.fieldDescriptionId}
              name="descriptionId"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  descriptionId: event.target.value,
                }))
              }
              type="text"
              value={form.descriptionId}
              wide
            />
            <NexusWorkspaceFormField
              id="role-category"
              label={content.fieldCategory}
              name="category"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as RoleCategory,
                }))
              }
              options={roleCategoryOptions}
              type="select"
              value={form.category}
            />
            <NexusWorkspaceFormField
              id="role-priority"
              label={content.fieldPriority}
              min={0}
              name="priority"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priority: event.target.value,
                }))
              }
              type="number"
              value={form.priority}
            />

            {confirmingDeleteId !== null ? (
              <NexusWorkspaceNotice tone="danger">
                {content.deleteConfirmPrompt}
              </NexusWorkspaceNotice>
            ) : null}

            <div>
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

            {drawer.mode === "edit" ? (
              <section aria-labelledby="role-permissions-title">
                <h3 id="role-permissions-title">{content.permissionsTitle}</h3>
                {permissionsError !== null ? (
                  <NexusWorkspaceNotice tone="danger">
                    {permissionsError}
                  </NexusWorkspaceNotice>
                ) : null}
                {permissionsLoading ? (
                  <p>{content.savingLabel}</p>
                ) : permissions.length === 0 ? (
                  <p>{content.permissionsEmptyLabel}</p>
                ) : (
                  <ul>
                    {permissions.map((entry) => (
                      <li key={entry.permissionPublicId}>
                        <label>
                          <input
                            checked={entry.granted}
                            disabled={
                              pendingPermissionId === entry.permissionPublicId
                            }
                            onChange={() => togglePermission(entry)}
                            type="checkbox"
                          />
                          <span>{entry.name}</span>
                          {entry.description?.id ? (
                            <small>{entry.description.id}</small>
                          ) : null}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}
          </div>
        </NexusWorkspaceDrawer>
      ) : null}
    </NexusWorkspacePage>
  );
}
