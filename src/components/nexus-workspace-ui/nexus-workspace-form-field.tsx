import type {
  ChangeEventHandler,
  InputHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import styles from "@/components/nexus-workspace-ui/nexus-workspace-form-field.module.css";

export type NexusWorkspaceFormOption = {
  label: string;
  value: string;
};

type NexusWorkspaceFormFieldProps = {
  error?: string;
  hint?: string;
  id: string;
  label: string;
  min?: InputHTMLAttributes<HTMLInputElement>["min"];
  name: string;
  onChange: ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
  options?: readonly NexusWorkspaceFormOption[];
  placeholder?: string;
  required?: boolean;
  type: "date" | "number" | "select" | "text" | "textarea" | "url";
  value: string;
  wide?: boolean;
};

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path d="m5.5 7.75 4.5 4.5 4.5-4.5" />
    </svg>
  );
}

export function NexusWorkspaceFormField({
  error,
  hint,
  id,
  label,
  min,
  name,
  onChange,
  options,
  placeholder,
  required = false,
  type,
  value,
  wide = false,
}: NexusWorkspaceFormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");
  const controlProps = {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": Boolean(error),
    id,
    name,
    onChange,
    required,
    value,
  };

  return (
    <label className={styles.field} data-wide={wide || undefined} htmlFor={id}>
      <span className={styles.label}>
        {label}
        {required ? <i aria-hidden="true">*</i> : null}
      </span>

      {type === "select" ? (
        <span className={styles.controlWrap}>
          <select
            {...(controlProps as SelectHTMLAttributes<HTMLSelectElement>)}
            className={styles.control}
          >
            <option disabled value="">
              {placeholder ?? `Pilih ${label.toLocaleLowerCase("id-ID")}`}
            </option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span aria-hidden="true" className={styles.chevron}>
            <ChevronDownIcon />
          </span>
        </span>
      ) : type === "textarea" ? (
        <textarea
          {...controlProps}
          className={styles.control}
          placeholder={placeholder}
          rows={2}
        />
      ) : (
        <input
          {...controlProps}
          className={styles.control}
          min={min}
          placeholder={placeholder}
          type={type}
        />
      )}

      {hint ? <small id={hintId}>{hint}</small> : null}
      {error ? (
        <small className={styles.error} id={errorId}>
          {error}
        </small>
      ) : null}
    </label>
  );
}
