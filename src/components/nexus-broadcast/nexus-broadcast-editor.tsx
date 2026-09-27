"use client";

import { Fragment, Slice } from "@tiptap/pm/model";
import {
  type EditorState,
  NodeSelection,
  Plugin,
  TextSelection,
} from "@tiptap/pm/state";
import { dropPoint } from "@tiptap/pm/transform";
import type { EditorView } from "@tiptap/pm/view";
import {
  type Editor,
  EditorContent,
  Extension,
  type JSONContent,
  mergeAttributes,
  Node,
  NodeViewWrapper,
  type ReactNodeViewProps,
  ReactNodeViewRenderer,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import {
  type ChangeEvent,
  createContext,
  type KeyboardEvent,
  type DragEvent as ReactDragEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type Ref,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";
import {
  BROADCAST_HEADING_LEVELS,
  BROADCAST_IMAGE_NODE,
  BROADCAST_IMAGE_SIZES,
  BROADCAST_IMAGE_WIDTH,
  type BroadcastImageAlign,
  broadcastImageAlign,
  clampBroadcastImageWidth,
  initialBroadcastImageWidth,
  normalizeBroadcastLinkInput,
  parseBroadcastLinkUrl,
} from "@/components/nexus-broadcast/nexus-broadcast-content";
import { NexusBroadcastDialog } from "@/components/nexus-broadcast/nexus-broadcast-dialog";
import styles from "@/components/nexus-broadcast/nexus-broadcast-editor.module.css";
import { NexusBroadcastEmailFooterCopy } from "@/components/nexus-broadcast/nexus-broadcast-email";
import {
  NexusBroadcastIcon,
  type NexusBroadcastIconName,
} from "@/components/nexus-broadcast/nexus-broadcast-icons";
import {
  BROADCAST_IMAGE_ACCEPT,
  BROADCAST_IMAGE_ALT_MAX_LENGTH,
  type BroadcastImageRegistry,
  type BroadcastLocalImage,
  formatBroadcastFileSize,
  loadBroadcastImage,
  validateBroadcastImageFile,
} from "@/components/nexus-broadcast/nexus-broadcast-model";
import { NexusWorkspaceButton } from "@/components/nexus-workspace-ui/nexus-workspace-elements";
import { NexusWorkspaceFormField } from "@/components/nexus-workspace-ui/nexus-workspace-form-field";

/* ------------------------------------------------------------------ */
/* Gambar di dalam isi pesan                                           */
/* ------------------------------------------------------------------ */

type BroadcastImageNodeContextValue = {
  images: BroadcastImageRegistry;
  onEditAlt: (position: number) => void;
};

const BroadcastImageNodeContext =
  createContext<BroadcastImageNodeContextValue | null>(null);

const alignOptions: readonly {
  icon: NexusBroadcastIconName;
  label: string;
  value: BroadcastImageAlign;
}[] = [
  { icon: "imageLeft", label: "Gambar di kiri, teks di kanan", value: "left" },
  { icon: "imageCenter", label: "Gambar di tengah", value: "center" },
  {
    icon: "imageRight",
    label: "Gambar di kanan, teks di kiri",
    value: "right",
  },
];

function imageAttributes(node: ReactNodeViewProps["node"]) {
  const align = broadcastImageAlign(node.attrs.align);
  return {
    align,
    alt: typeof node.attrs.alt === "string" ? node.attrs.alt.trim() : "",
    imageId: typeof node.attrs.imageId === "string" ? node.attrs.imageId : "",
    width: clampBroadcastImageWidth(Number(node.attrs.width), align),
  };
}

function keepEditorSelection(event: { preventDefault: () => void }) {
  event.preventDefault();
}

function BroadcastImageNodeView({
  deleteNode,
  editor,
  getPos,
  node,
  selected,
  updateAttributes,
}: ReactNodeViewProps) {
  const context = useContext(BroadcastImageNodeContext);
  const { align, alt, imageId, width } = imageAttributes(node);
  const image = context?.images[imageId];
  const figureRef = useRef<HTMLDivElement>(null);
  const [liveWidth, setLiveWidth] = useState<number | null>(null);
  const imageName = image?.name ?? "yang dipilih";

  function editAlt() {
    const position = getPos();
    if (typeof position === "number") context?.onEditAlt(position);
  }

  function changeAlign(next: BroadcastImageAlign) {
    const nextWidth =
      next !== "center" && width > BROADCAST_IMAGE_WIDTH.floatMax ? 50 : width;
    updateAttributes({
      align: next,
      width: clampBroadcastImageWidth(nextWidth, next),
    });
  }

  function changeSize(nextWidth: number) {
    /* Gambar besar di kiri atau kanan menyisakan kolom teks yang terlalu sempit. */
    const nextAlign =
      nextWidth > BROADCAST_IMAGE_WIDTH.floatMax ? "center" : align;
    updateAttributes({
      align: nextAlign,
      width: clampBroadcastImageWidth(nextWidth, nextAlign),
    });
  }

  function startResize(
    event: ReactPointerEvent<HTMLSpanElement>,
    side: "left" | "right",
  ) {
    const outer = figureRef.current?.closest<HTMLElement>(
      `.node-${BROADCAST_IMAGE_NODE}`,
    );
    const prose = editor.view.dom;
    const proseStyle = window.getComputedStyle(prose);
    const contentWidth =
      prose.clientWidth -
      Number.parseFloat(proseStyle.paddingLeft) -
      Number.parseFloat(proseStyle.paddingRight);
    if (!outer || contentWidth <= 0) return;

    event.preventDefault();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startWidth = outer.getBoundingClientRect().width;
    /* Gambar di tengah melebar ke dua sisi sekaligus. */
    const factor = (side === "right" ? 1 : -1) * (align === "center" ? 2 : 1);
    let latest = width;
    handle.setPointerCapture(event.pointerId);

    const move = (moveEvent: PointerEvent) => {
      latest = clampBroadcastImageWidth(
        ((startWidth + (moveEvent.clientX - startX) * factor) / contentWidth) *
          100,
        align,
      );
      outer.style.setProperty("--image-width", `${latest}%`);
      setLiveWidth(latest);
    };
    const finish = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", finish);
      handle.removeEventListener("pointercancel", finish);
      setLiveWidth(null);
      updateAttributes({ width: latest });
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
  }

  function handleToolbarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      editor.commands.focus();
    }
  }

  const shownWidth = liveWidth ?? width;
  const resizeSides: ("left" | "right")[] =
    align === "center"
      ? ["left", "right"]
      : align === "left"
        ? ["right"]
        : ["left"];

  return (
    <NodeViewWrapper
      className={styles.imageFrame}
      data-selected={selected || undefined}
      ref={figureRef}
    >
      {image ? (
        <Image
          alt={alt}
          className={styles.imageElement}
          draggable={false}
          height={image.height}
          src={image.objectUrl}
          unoptimized
          width={image.width}
        />
      ) : (
        <div className={styles.imageMissing}>
          <NexusBroadcastIcon name="image" />
          <span>Gambar tidak lagi tersedia. Hapus lalu sisipkan kembali.</span>
        </div>
      )}

      {image && !alt ? (
        <button
          className={styles.altChip}
          onClick={editAlt}
          onMouseDown={keepEditorSelection}
          type="button"
        >
          <NexusBroadcastIcon name="exclamation" />
          Tambahkan deskripsi
        </button>
      ) : null}

      {image
        ? resizeSides.map((side) => (
            <span
              aria-hidden="true"
              className={styles.resizeHandle}
              data-side={side}
              key={side}
              onPointerDown={(event) => startResize(event, side)}
              role="presentation"
              title="Tarik untuk mengubah ukuran"
            />
          ))
        : null}

      {liveWidth !== null ? (
        <span aria-hidden="true" className={styles.resizeBadge}>
          {shownWidth}%
        </span>
      ) : null}

      {selected ? (
        <div
          aria-label={`Pengaturan gambar ${imageName}`}
          className={styles.imageToolbar}
          data-align={align}
          onKeyDown={handleToolbarKeyDown}
          role="toolbar"
        >
          {image ? (
            <>
              <span className={styles.imageToolGroup}>
                {alignOptions.map((option) => (
                  <button
                    aria-label={option.label}
                    aria-pressed={align === option.value}
                    className={styles.imageTool}
                    key={option.value}
                    onClick={() => changeAlign(option.value)}
                    onMouseDown={keepEditorSelection}
                    title={option.label}
                    type="button"
                  >
                    <NexusBroadcastIcon name={option.icon} />
                  </button>
                ))}
              </span>
              <span className={styles.imageToolGroup}>
                {BROADCAST_IMAGE_SIZES.map((size) => (
                  <button
                    aria-label={`Ukuran ${size.label.toLocaleLowerCase("id-ID")}, ${size.width}% lebar isi`}
                    aria-pressed={shownWidth === size.width}
                    className={styles.imageTool}
                    data-text=""
                    key={size.width}
                    onClick={() => changeSize(size.width)}
                    onMouseDown={keepEditorSelection}
                    title={`${size.label} (${size.width}% lebar isi)`}
                    type="button"
                  >
                    {size.label}
                  </button>
                ))}
              </span>
              <span className={styles.imageToolGroup}>
                <button
                  className={styles.imageTool}
                  data-text=""
                  onClick={editAlt}
                  onMouseDown={keepEditorSelection}
                  type="button"
                >
                  {alt ? "Ubah deskripsi" : "Deskripsi"}
                </button>
              </span>
            </>
          ) : null}
          <span className={styles.imageToolGroup}>
            <button
              aria-label={`Hapus gambar ${imageName}`}
              className={styles.imageTool}
              data-tone="danger"
              onClick={deleteNode}
              onMouseDown={keepEditorSelection}
              title="Hapus gambar"
              type="button"
            >
              <NexusBroadcastIcon name="trash" />
            </button>
          </span>
        </div>
      ) : null}

      {/* Hanya tampil pada kertas sempit, tempat gambar kiri dan kanan memenuhi lebar. */}
      {selected && image && align !== "center" ? (
        <p className={styles.imageNarrowNote}>
          Di layar lebar, gambar ini berada di{" "}
          {align === "left" ? "kiri" : "kanan"} teks. Di layar kecil, gambar
          tampil selebar isi pesan.
        </p>
      ) : null}
    </NodeViewWrapper>
  );
}

/**
 * Gambar merujuk berkas lokal melalui ID, bukan alamat. Dokumen editor tidak
 * pernah menyimpan alamat sementara peramban, dan gambar dari tempelan web
 * yang tidak membawa ID tersebut tidak ikut masuk.
 */
const BroadcastImageNode = Node.create({
  addAttributes() {
    return {
      align: {
        default: "center",
        parseHTML: (element) =>
          broadcastImageAlign(element.getAttribute("data-align")),
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") ?? "",
      },
      imageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-broadcast-image-id"),
        renderHTML: (attributes) => ({
          "data-broadcast-image-id": attributes.imageId,
        }),
      },
      width: {
        default: 100,
        parseHTML: (element) => Number(element.getAttribute("data-width")),
        renderHTML: (attributes) => ({ "data-width": attributes.width }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(BroadcastImageNodeView, {
      attrs: ({ node }) => {
        const align = broadcastImageAlign(node.attrs.align);
        return {
          "data-align": align,
          style: `--image-width: ${clampBroadcastImageWidth(Number(node.attrs.width), align)}%`,
        };
      },
      className: styles.imageNode,
    });
  },
  atom: true,
  draggable: false,
  group: "block",
  name: BROADCAST_IMAGE_NODE,
  parseHTML() {
    return [{ tag: "img[data-broadcast-image-id]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },
  selectable: true,
});

/* ------------------------------------------------------------------ */
/* Perilaku editor                                                     */
/* ------------------------------------------------------------------ */

type BroadcastEditorBehaviorOptions = {
  onFiles: (files: File[], position?: number) => void;
  onLinkShortcut: () => void;
};

function fileList(list: FileList | null | undefined) {
  return Array.from(list ?? []);
}

/**
 * Pengetikan tepat di akhir tautan tidak ikut menjadi tautan, sama seperti
 * pengolah dokumen pada umumnya. Tautan tetap dapat diubah dari tengahnya.
 */
function insertTextOutsideLinkEnd(
  view: EditorView,
  from: number,
  to: number,
  text: string,
) {
  const { state } = view;
  const linkType = state.schema.marks.link;
  if (!linkType) return false;

  const $from = state.doc.resolve(from);
  const marks = state.storedMarks ?? $from.marks();
  const link = linkType.isInSet(marks);
  if (!link) return false;
  if (from === to && $from.nodeAfter && link.isInSet($from.nodeAfter.marks)) {
    return false;
  }

  const transaction = state.tr.insertText(text, from, to);
  transaction.removeMark(from, from + text.length, linkType);
  view.dispatch(transaction);
  return true;
}

/**
 * Gambar yang dilepas di tengah paragraf ditempatkan di batas paragraf
 * terdekat, bukan memotong kalimat: separuh atas paragraf menaruhnya di
 * atas, separuh bawah di bawah.
 */
function imageDropPosition(view: EditorView, position: number) {
  const imageType = view.state.schema.nodes[BROADCAST_IMAGE_NODE];
  if (!imageType) return position;
  const slice = new Slice(Fragment.from(imageType.create()), 0, 0);
  return dropPoint(view.state.doc, position, slice) ?? position;
}

/** Posisi tepat setelah gambar yang sedang dipilih, bila ada. */
function positionAfterSelectedImage(state: EditorState) {
  const { selection } = state;
  return selection instanceof NodeSelection &&
    selection.node.type.name === BROADCAST_IMAGE_NODE
    ? selection.to
    : null;
}

/**
 * Mengetik ketika gambar sedang dipilih melanjutkan tulisan di bawah gambar,
 * bukan menggantikan gambar. Gambar tetap dapat dihapus dengan tombol hapus.
 */
function continueTypingAfterImage(view: EditorView, text: string) {
  const { state } = view;
  const after = positionAfterSelectedImage(state);
  const paragraph = state.schema.nodes.paragraph;
  if (after === null || !paragraph) return false;

  const next = state.doc.resolve(after).nodeAfter;
  const transaction = state.tr;
  if (next?.type === paragraph && next.content.size === 0) {
    transaction.insertText(text, after + 1);
  } else {
    transaction.insert(after, paragraph.create(null, state.schema.text(text)));
  }
  transaction.setSelection(
    TextSelection.create(transaction.doc, after + 1 + text.length),
  );
  view.dispatch(transaction.scrollIntoView());
  return true;
}

const BroadcastEditorBehavior =
  Extension.create<BroadcastEditorBehaviorOptions>({
    addKeyboardShortcuts() {
      return {
        "Mod-k": () => {
          this.options.onLinkShortcut();
          return true;
        },
      };
    },
    addOptions() {
      return {
        onFiles: () => undefined,
        onLinkShortcut: () => undefined,
      };
    },
    addProseMirrorPlugins() {
      const options = this.options;
      return [
        new Plugin({
          props: {
            handleDrop(view, event, _slice, moved) {
              const files = fileList(event.dataTransfer?.files);
              if (moved || files.length === 0) return false;
              event.preventDefault();
              const position = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })?.pos;
              options.onFiles(
                files,
                typeof position === "number"
                  ? imageDropPosition(view, position)
                  : undefined,
              );
              return true;
            },
            handlePaste(_view, event) {
              const types = Array.from(event.clipboardData?.types ?? []);
              const hasText =
                types.includes("text/plain") || types.includes("text/html");
              const files = fileList(event.clipboardData?.files);
              if (hasText || files.length === 0) return false;
              options.onFiles(files);
              return true;
            },
            handleTextInput(view, from, to, text) {
              return (
                continueTypingAfterImage(view, text) ||
                insertTextOutsideLinkEnd(view, from, to, text)
              );
            },
            /*
             * Judul utama dan judul tingkat rendah dari dokumen lain
             * diselaraskan dengan dua gaya judul yang tersedia.
             */
            transformPastedHTML(html) {
              return html
                .replace(/<(\/?)h1(?=[\s>])/gi, "<$1h2")
                .replace(/<(\/?)h[4-6](?=[\s>])/gi, "<$1h3");
            },
          },
        }),
      ];
    },
    name: "broadcastEditorBehavior",
  });

/*
 * Hanya pola daftar ("- " dan "1. ") yang berubah otomatis saat diketik,
 * sama seperti pengolah dokumen. Pola Markdown lain tidak diaktifkan agar
 * tanda bintang atau pagar yang diketik penulis tetap menjadi teks biasa.
 */
const EDITOR_INPUT_RULES = ["bulletList", "orderedList"];
const EDITOR_PASTE_RULES = ["link"];

function createBroadcastExtensions(callbacks: BroadcastEditorBehaviorOptions) {
  return [
    StarterKit.configure({
      blockquote: false,
      code: false,
      codeBlock: false,
      heading: {
        levels: [
          BROADCAST_HEADING_LEVELS.title,
          BROADCAST_HEADING_LEVELS.subtitle,
        ],
      },
      horizontalRule: false,
      link: {
        autolink: true,
        defaultProtocol: "https",
        enableClickSelection: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: null,
        },
        isAllowedUri: (url) => normalizeBroadcastLinkInput(url) !== null,
        linkOnPaste: true,
        openOnClick: false,
        shouldAutoLink: (url) => normalizeBroadcastLinkInput(url) !== null,
      },
      strike: false,
      underline: false,
    }),
    BroadcastImageNode,
    BroadcastEditorBehavior.configure(callbacks),
  ];
}

/* ------------------------------------------------------------------ */
/* Keadaan perkakas                                                    */
/* ------------------------------------------------------------------ */

type BroadcastBlockStyle = "paragraph" | "subtitle" | "title";

const blockStyleOptions: readonly {
  label: string;
  value: BroadcastBlockStyle;
}[] = [
  { label: "Teks biasa", value: "paragraph" },
  { label: "Judul besar", value: "title" },
  { label: "Subjudul", value: "subtitle" },
];

function applyBlockStyle(editor: Editor, style: BroadcastBlockStyle) {
  const chain = editor.chain().focus();
  if (style === "paragraph") chain.setParagraph().run();
  else chain.setHeading({ level: BROADCAST_HEADING_LEVELS[style] }).run();
}

function toolbarSnapshot(editor: Editor | null) {
  if (!editor) return null;
  const blockStyle: BroadcastBlockStyle = editor.isActive("heading", {
    level: BROADCAST_HEADING_LEVELS.title,
  })
    ? "title"
    : editor.isActive("heading", { level: BROADCAST_HEADING_LEVELS.subtitle })
      ? "subtitle"
      : "paragraph";

  return {
    blockStyle,
    canRedo: editor.can().redo(),
    canSubtitle: editor
      .can()
      .setHeading({ level: BROADCAST_HEADING_LEVELS.subtitle }),
    canTitle: editor
      .can()
      .setHeading({ level: BROADCAST_HEADING_LEVELS.title }),
    canUndo: editor.can().undo(),
    isBold: editor.isActive("bold"),
    isBulletList: editor.isActive("bulletList"),
    isEmpty: editor.isEmpty,
    isItalic: editor.isActive("italic"),
    isLink: editor.isActive("link"),
    isOrderedList: editor.isActive("orderedList"),
  };
}

const subscribeToNothing = () => () => undefined;

/** Nama tombol pintas mengikuti sistem operasi pengguna. */
function useShortcutModifier() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl+"),
    () => "Ctrl+",
  );
}

type ToolbarButtonProps = {
  disabled?: boolean;
  icon: NexusBroadcastIconName;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  shortcut?: string;
};

function ToolbarButton({
  disabled = false,
  icon,
  label,
  onClick,
  pressed,
  shortcut,
}: ToolbarButtonProps) {
  const tooltip = shortcut ? `${label} (${shortcut})` : label;
  return (
    <button
      aria-keyshortcuts={shortcut?.replace("⌘", "Meta+")}
      aria-label={label}
      aria-pressed={pressed}
      className={styles.toolButton}
      data-toolbar-item=""
      disabled={disabled}
      onClick={onClick}
      onMouseDown={keepEditorSelection}
      type="button"
    >
      <NexusBroadcastIcon name={icon} />
      <span aria-hidden="true" className={styles.tooltip}>
        {tooltip}
      </span>
    </button>
  );
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return <div className={styles.toolGroup}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Dialog tautan, gambar, dan deskripsi                                */
/* ------------------------------------------------------------------ */

type LinkDialogState = {
  href: string;
  mode: "edit" | "insert";
  needsText: boolean;
};

function BroadcastLinkDialog({
  onApply,
  onClose,
  onRemove,
  state,
}: {
  onApply: (href: string, text?: string) => void;
  onClose: () => void;
  onRemove: () => void;
  state: LinkDialogState;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const technicalId = useId();
  const [href, setHref] = useState(state.href);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<{ href?: string; text?: string }>({});
  const normalizedPreview = normalizeBroadcastLinkInput(href);

  function submit() {
    const normalized = normalizeBroadcastLinkInput(href);
    const nextErrors = {
      ...(normalized
        ? {}
        : {
            href: href.trim()
              ? "Alamat belum dapat dipakai. Gunakan alamat web lengkap, misalnya yang diawali https://."
              : "Alamat tautan wajib diisi.",
          }),
      ...(state.needsText && !text.trim()
        ? { text: "Teks tautan wajib diisi." }
        : {}),
    };
    setErrors(nextErrors);
    if (!normalized || nextErrors.text) {
      if (!normalized) inputRef.current?.focus();
      return;
    }
    onApply(normalized, state.needsText ? text.trim() : undefined);
  }

  return (
    <NexusBroadcastDialog
      closeLabel="Tutup pengaturan tautan"
      description={
        state.needsText
          ? "Tulis kata yang akan diklik penerima, lalu tempel alamat webnya."
          : "Teks yang Anda pilih akan menjadi tautan yang dapat diklik penerima."
      }
      footer={
        <>
          {state.mode === "edit" ? (
            <NexusWorkspaceButton
              data-align="start"
              onClick={onRemove}
              type="button"
            >
              <NexusBroadcastIcon name="unlink" />
              Hapus tautan
            </NexusWorkspaceButton>
          ) : null}
          <NexusWorkspaceButton onClick={onClose} type="button">
            Batal
          </NexusWorkspaceButton>
          <NexusWorkspaceButton tone="primary" type="submit">
            {state.mode === "edit" ? "Simpan tautan" : "Sisipkan tautan"}
          </NexusWorkspaceButton>
        </>
      }
      icon="link"
      initialFocusRef={inputRef}
      onClose={onClose}
      onSubmit={submit}
      size="compact"
      title={state.mode === "edit" ? "Ubah tautan" : "Sisipkan tautan"}
    >
      <label className={styles.dialogField} htmlFor={`${technicalId}-href`}>
        <span>
          Alamat tautan <i aria-hidden="true">*</i>
        </span>
        <span className={styles.inputWithIcon}>
          <NexusBroadcastIcon name="link" />
          <input
            aria-describedby={`${technicalId}-href-hint${errors.href ? ` ${technicalId}-href-error` : ""}`}
            aria-invalid={Boolean(errors.href)}
            aria-required="true"
            autoComplete="url"
            id={`${technicalId}-href`}
            inputMode="url"
            onChange={(event) => setHref(event.target.value)}
            placeholder="https://"
            ref={inputRef}
            spellCheck={false}
            type="text"
            value={href}
          />
        </span>
        <small id={`${technicalId}-href-hint`}>
          {normalizedPreview && normalizedPreview !== href.trim()
            ? `Akan dipakai sebagai ${normalizedPreview}`
            : "Salin alamat dari kolom alamat peramban, lalu tempel di sini."}
        </small>
        {errors.href ? (
          <small className={styles.fieldError} id={`${technicalId}-href-error`}>
            {errors.href}
          </small>
        ) : null}
      </label>
      {state.needsText ? (
        <label className={styles.dialogField} htmlFor={`${technicalId}-text`}>
          <span>
            Teks tautan <i aria-hidden="true">*</i>
          </span>
          <input
            aria-describedby={
              errors.text ? `${technicalId}-text-error` : undefined
            }
            aria-invalid={Boolean(errors.text)}
            aria-required="true"
            id={`${technicalId}-text`}
            onChange={(event) => setText(event.target.value)}
            placeholder="Contoh: formulir pendaftaran"
            type="text"
            value={text}
          />
          {errors.text ? (
            <small
              className={styles.fieldError}
              id={`${technicalId}-text-error`}
            >
              {errors.text}
            </small>
          ) : null}
        </label>
      ) : null}
    </NexusBroadcastDialog>
  );
}

function BroadcastImageDialog({
  onClose,
  onInsert,
}: {
  onClose: () => void;
  onInsert: (
    image: BroadcastLocalImage,
    alt: string,
    align: BroadcastImageAlign,
  ) => void;
}) {
  const technicalId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<BroadcastLocalImage | null>(null);
  const [pending, setPending] = useState<BroadcastLocalImage | null>(null);
  const [alt, setAlt] = useState("");
  const [align, setAlign] = useState<BroadcastImageAlign>("center");
  const [fileError, setFileError] = useState("");
  const [altError, setAltError] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  /* Gambar yang batal disisipkan tidak meninggalkan alamat sementara. */
  useEffect(
    () => () => {
      if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.objectUrl);
    },
    [],
  );

  function replacePending(next: BroadcastLocalImage | null) {
    if (pendingRef.current) URL.revokeObjectURL(pendingRef.current.objectUrl);
    pendingRef.current = next;
    setPending(next);
  }

  async function readFile(file?: File) {
    if (!file) return;
    const error = validateBroadcastImageFile(file);
    if (error) {
      setFileError(error);
      return;
    }

    setIsReading(true);
    const image = await loadBroadcastImage(file);
    setIsReading(false);
    if (!image) {
      setFileError("Gambar tidak dapat dibaca. Pilih berkas lain.");
      return;
    }
    setFileError("");
    replacePending(image);
  }

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    void readFile(file);
  }

  function dropFile(event: ReactDragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void readFile(event.dataTransfer.files?.[0]);
  }

  function submit() {
    if (!pending) {
      setFileError("Pilih gambar terlebih dahulu.");
      fileInputRef.current?.focus();
      return;
    }
    if (!alt.trim()) {
      setAltError("Deskripsi gambar wajib diisi.");
      return;
    }
    const image = pending;
    pendingRef.current = null;
    onInsert(image, alt.trim(), align);
  }

  return (
    <NexusBroadcastDialog
      closeLabel="Tutup penyisipan gambar"
      description="Gambar disisipkan di posisi kursor. Ukuran dan posisinya dapat diatur lagi setelah gambar diklik."
      footer={
        <>
          <NexusWorkspaceButton onClick={onClose} type="button">
            Batal
          </NexusWorkspaceButton>
          <NexusWorkspaceButton
            disabled={isReading}
            tone="primary"
            type="submit"
          >
            Sisipkan gambar
          </NexusWorkspaceButton>
        </>
      }
      icon="image"
      initialFocusRef={fileInputRef}
      onClose={onClose}
      onSubmit={submit}
      title="Sisipkan gambar"
    >
      {/* Seluruh area dapat diklik untuk memilih berkas atau menjadi tempat melepas gambar. */}
      <label
        className={styles.dropzone}
        data-dragging={isDragging || undefined}
        data-filled={pending ? "" : undefined}
        onDragLeave={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Element && event.currentTarget.contains(next)) {
            return;
          }
          setIsDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={dropFile}
      >
        <input
          accept={BROADCAST_IMAGE_ACCEPT}
          aria-describedby={`${technicalId}-file-hint${fileError ? ` ${technicalId}-file-error` : ""}`}
          aria-invalid={Boolean(fileError)}
          aria-label={pending ? `Ganti gambar ${pending.name}` : "Pilih gambar"}
          className={styles.visuallyHidden}
          onChange={chooseFile}
          ref={fileInputRef}
          type="file"
        />
        {pending ? (
          <Image
            alt=""
            className={styles.dropzonePreview}
            height={pending.height}
            src={pending.objectUrl}
            unoptimized
            width={pending.width}
          />
        ) : (
          <span aria-hidden="true" className={styles.dropzoneIcon}>
            <NexusBroadcastIcon name="image" />
          </span>
        )}
        <span className={styles.dropzoneCopy}>
          <strong>
            {pending
              ? pending.name
              : "Tarik gambar ke sini atau pilih dari perangkat"}
          </strong>
          <span id={`${technicalId}-file-hint`}>
            {pending
              ? `${formatBroadcastFileSize(pending.size)} · ${pending.width} × ${pending.height} piksel`
              : "Format JPG atau PNG, maksimal 1 MB."}
          </span>
          <span className={styles.fileButton}>
            <NexusBroadcastIcon name="upload" />
            {pending ? "Ganti gambar" : "Pilih gambar"}
          </span>
        </span>
      </label>
      {isReading ? (
        <p aria-live="polite" className={styles.dialogNote}>
          Membaca gambar…
        </p>
      ) : null}
      {fileError ? (
        <p
          className={styles.fieldError}
          id={`${technicalId}-file-error`}
          role="alert"
        >
          {fileError}
        </p>
      ) : null}
      <NexusWorkspaceFormField
        error={altError || undefined}
        hint="Jelaskan isi gambar secara singkat. Deskripsi dibaca penerima yang gambarnya tidak termuat atau yang memakai pembaca layar."
        id={`${technicalId}-alt`}
        label="Deskripsi gambar"
        name="broadcast-image-alt"
        onChange={(event) => {
          setAlt(event.target.value.slice(0, BROADCAST_IMAGE_ALT_MAX_LENGTH));
          if (altError) setAltError("");
        }}
        placeholder="Contoh: Poster seminar kesehatan 2026"
        required
        type="text"
        value={alt}
      />
      <fieldset className={styles.alignPicker}>
        <legend>Posisi gambar</legend>
        {alignOptions.map((option) => (
          <label
            data-checked={align === option.value || undefined}
            key={option.value}
          >
            <input
              checked={align === option.value}
              name={`${technicalId}-align`}
              onChange={() => setAlign(option.value)}
              type="radio"
              value={option.value}
            />
            <NexusBroadcastIcon name={option.icon} />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    </NexusBroadcastDialog>
  );
}

function BroadcastAltDialog({
  imageName,
  initialAlt,
  onClose,
  onSave,
}: {
  imageName: string;
  initialAlt: string;
  onClose: () => void;
  onSave: (alt: string) => void;
}) {
  const technicalId = useId();
  const [alt, setAlt] = useState(initialAlt);
  const [error, setError] = useState("");

  return (
    <NexusBroadcastDialog
      closeLabel="Tutup deskripsi gambar"
      description={`Deskripsi untuk ${imageName}. Deskripsi dibaca penerima yang gambarnya tidak termuat.`}
      footer={
        <>
          <NexusWorkspaceButton onClick={onClose} type="button">
            Batal
          </NexusWorkspaceButton>
          <NexusWorkspaceButton tone="primary" type="submit">
            Simpan deskripsi
          </NexusWorkspaceButton>
        </>
      }
      icon="image"
      onClose={onClose}
      onSubmit={() => {
        if (!alt.trim()) {
          setError("Deskripsi gambar wajib diisi.");
          return;
        }
        onSave(alt.trim());
      }}
      size="compact"
      title="Deskripsi gambar"
    >
      <NexusWorkspaceFormField
        error={error || undefined}
        hint="Jelaskan isi gambar secara singkat."
        id={`${technicalId}-alt`}
        label="Deskripsi gambar"
        name="broadcast-image-alt-edit"
        onChange={(event) => {
          setAlt(event.target.value.slice(0, BROADCAST_IMAGE_ALT_MAX_LENGTH));
          if (error) setError("");
        }}
        required
        type="text"
        value={alt}
      />
    </NexusBroadcastDialog>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export type BroadcastEditorHandle = {
  focus: () => void;
  /** Memilih gambar pertama yang belum lengkap dan membuka perbaikannya. */
  reviewImages: () => void;
  /** Memilih tautan pertama yang alamatnya bermasalah lalu membuka dialognya. */
  reviewLinks: () => void;
};

type NexusBroadcastEditorProps = {
  describedBy: string;
  hasError: boolean;
  images: BroadcastImageRegistry;
  labelId: string;
  onContentChange: (content: JSONContent) => void;
  onImageAdd: (image: BroadcastLocalImage) => void;
  ref?: Ref<BroadcastEditorHandle>;
  /** Judul email, ditampilkan di kertas tulis seperti pada email yang diterima. */
  subject: string;
};

type AltDialogState = { alt: string; imageName: string; position: number };

function imageNodeContent(
  image: BroadcastLocalImage,
  alt: string,
  align: BroadcastImageAlign,
) {
  return {
    attrs: {
      align,
      alt,
      imageId: image.id,
      width: clampBroadcastImageWidth(
        align === "center"
          ? initialBroadcastImageWidth(image.width)
          : Math.min(initialBroadcastImageWidth(image.width), 40),
        align,
      ),
    },
    type: BROADCAST_IMAGE_NODE,
  };
}

export function NexusBroadcastEditor({
  describedBy,
  hasError,
  images,
  labelId,
  onContentChange,
  onImageAdd,
  ref,
  subject,
}: NexusBroadcastEditorProps) {
  const technicalId = useId();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [activeToolIndex, setActiveToolIndex] = useState(0);
  const [linkDialog, setLinkDialog] = useState<LinkDialogState | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [altDialog, setAltDialog] = useState<AltDialogState | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "danger" | "info";
  } | null>(null);
  const modifier = useShortcutModifier();

  const onContentChangeRef = useRef(onContentChange);
  const onImageAddRef = useRef(onImageAdd);
  const imagesRef = useRef(images);
  const openLinkDialogRef = useRef<() => void>(() => undefined);
  const insertFilesRef = useRef<(files: File[], position?: number) => void>(
    () => undefined,
  );

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
    onImageAddRef.current = onImageAdd;
    imagesRef.current = images;
  }, [images, onContentChange, onImageAdd]);

  /*
   * Opsi editor dibuat sekali. `useEditor` membandingkan identitas opsi pada
   * setiap render, sehingga ekstensi dan atribut baru tiap render akan
   * menyetel ulang editor tanpa perlu.
   */
  const [extensions] = useState(() =>
    createBroadcastExtensions({
      onFiles: (files, position) => insertFilesRef.current(files, position),
      onLinkShortcut: () => openLinkDialogRef.current(),
    }),
  );
  const [editorProps] = useState(() => ({
    attributes: {
      "aria-labelledby": labelId,
      "aria-multiline": "true",
      "aria-required": "true",
      class: styles.prose,
      role: "textbox",
      spellcheck: "true",
    },
  }));

  const editor = useEditor({
    editorProps,
    enableInputRules: EDITOR_INPUT_RULES,
    enablePasteRules: EDITOR_PASTE_RULES,
    extensions,
    immediatelyRender: false,
    injectCSS: false,
    onUpdate: ({ editor: currentEditor }) => {
      onContentChangeRef.current(currentEditor.getJSON());
    },
  });

  /*
   * Cuplikan keadaan hanya diperbarui setelah transaksi pertama, sehingga
   * pemilih membaca editor dari lingkup komponen. Tanpa itu perkakas tetap
   * nonaktif sampai penulis mengeklik bidang tulis.
   */
  const toolbar = useEditorState({
    editor,
    selector: () => toolbarSnapshot(editor),
  });

  /* Keterangan dan status galat berubah tanpa membuat ulang editor. */
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const element = editor.view.dom;
    element.setAttribute("aria-describedby", describedBy);
    element.setAttribute("aria-invalid", String(hasError));
  }, [describedBy, editor, hasError]);

  function openLinkDialog() {
    if (!editor) return;
    const isLink = editor.isActive("link");
    if (isLink) editor.chain().extendMarkRange("link").run();
    const href = isLink ? String(editor.getAttributes("link").href ?? "") : "";
    setLinkDialog({
      href,
      mode: isLink ? "edit" : "insert",
      needsText: editor.state.selection.empty && !isLink,
    });
  }

  function insertImages(
    accepted: readonly BroadcastLocalImage[],
    position?: number,
  ) {
    if (!editor || editor.isDestroyed || accepted.length === 0) return;
    flushSync(() => {
      for (const image of accepted) onImageAddRef.current(image);
    });
    const content = accepted.map((image) =>
      imageNodeContent(image, "", "center"),
    );
    const target = position ?? positionAfterSelectedImage(editor.state);
    const chain = editor.chain().focus();
    /* Isi dapat berubah selama gambar dibaca; posisi dijaga tetap di dalam dokumen. */
    if (typeof target === "number") {
      chain.insertContentAt(
        Math.min(target, editor.state.doc.content.size),
        content,
      );
    } else chain.insertContent(content);
    chain.run();
  }

  async function insertFiles(files: File[], position?: number) {
    const errors: string[] = [];
    const accepted: BroadcastLocalImage[] = [];

    for (const file of files) {
      const error = validateBroadcastImageFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        continue;
      }
      const image = await loadBroadcastImage(file);
      if (image) accepted.push(image);
      else errors.push(`${file.name}: gambar tidak dapat dibaca.`);
    }

    insertImages(accepted, position);
    setNotice(
      errors.length > 0
        ? { message: errors.join(" "), tone: "danger" }
        : accepted.length > 0
          ? {
              message: `${accepted.length} gambar disisipkan. Klik gambar untuk mengatur posisi, ukuran, dan deskripsinya.`,
              tone: "info",
            }
          : null,
    );
  }

  openLinkDialogRef.current = openLinkDialog;
  insertFilesRef.current = (files, position) => {
    void insertFiles(files, position);
  };

  function openAltDialog(position: number) {
    if (!editor) return;
    const node = editor.state.doc.nodeAt(position);
    if (node?.type.name !== BROADCAST_IMAGE_NODE) return;
    const imageId = String(node.attrs.imageId ?? "");
    setAltDialog({
      alt: String(node.attrs.alt ?? ""),
      imageName: imagesRef.current[imageId]?.name ?? "gambar ini",
      position,
    });
  }

  useImperativeHandle(ref, () => ({
    focus: () => editor?.chain().focus().run(),
    reviewImages: () => {
      if (!editor) return;
      let found: { available: boolean; position: number } | null = null;
      editor.state.doc.descendants((node, position) => {
        if (found) return false;
        if (node.type.name !== BROADCAST_IMAGE_NODE) return true;
        const imageId = String(node.attrs.imageId ?? "");
        const alt = String(node.attrs.alt ?? "").trim();
        const available = Boolean(imagesRef.current[imageId]);
        if (!available || !alt) found = { available, position };
        return false;
      });
      const target = found as { available: boolean; position: number } | null;
      if (!target) return;
      editor
        .chain()
        .focus()
        .setNodeSelection(target.position)
        .scrollIntoView()
        .run();
      if (target.available) openAltDialog(target.position);
    },
    reviewLinks: () => {
      if (!editor) return;
      let found: { from: number; to: number } | null = null;
      editor.state.doc.descendants((node, position) => {
        if (found) return false;
        if (!node.isText) return true;
        const link = node.marks.find((mark) => mark.type.name === "link");
        if (link && !parseBroadcastLinkUrl(String(link.attrs.href ?? ""))) {
          found = { from: position, to: position + node.nodeSize };
        }
        return false;
      });
      const target = found as { from: number; to: number } | null;
      if (!target) return;
      editor
        .chain()
        .focus()
        .setTextSelection(target)
        .extendMarkRange("link")
        .scrollIntoView()
        .run();
      openLinkDialog();
    },
  }));

  /* Hanya satu perkakas yang menjadi urutan Tab; panah berpindah antarperkakas. */
  useLayoutEffect(() => {
    const items = Array.from(
      toolbarRef.current?.querySelectorAll<HTMLElement>(
        "[data-toolbar-item]:not(:disabled)",
      ) ?? [],
    );
    const activeIndex = Math.min(activeToolIndex, items.length - 1);
    items.forEach((item, index) => {
      item.tabIndex = index === activeIndex ? 0 : -1;
    });
  });

  function toolbarItems() {
    return Array.from(
      toolbarRef.current?.querySelectorAll<HTMLElement>(
        "[data-toolbar-item]:not(:disabled)",
      ) ?? [],
    );
  }

  function handleToolbarKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "End", "Home"].includes(event.key)) {
      return;
    }
    const items = toolbarItems();
    const current = items.indexOf(document.activeElement as HTMLElement);
    if (current < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + items.length) %
            items.length;
    setActiveToolIndex(next);
    items[next]?.focus();
  }

  const isReady = Boolean(editor && toolbar);
  const run = (command: (current: Editor) => void) => () => {
    if (editor) command(editor);
  };

  return (
    <BroadcastImageNodeContext.Provider
      value={{ images, onEditAlt: openAltDialog }}
    >
      <div className={styles.editorFrame} data-invalid={hasError || undefined}>
        <div
          aria-label="Format isi pesan"
          className={styles.toolbar}
          onFocus={(event) => {
            const index = toolbarItems().indexOf(event.target as HTMLElement);
            if (index >= 0) setActiveToolIndex(index);
          }}
          onKeyDown={handleToolbarKeyDown}
          ref={toolbarRef}
          role="toolbar"
        >
          <ToolbarGroup>
            <span className={styles.styleSelect}>
              <label
                className={styles.visuallyHidden}
                htmlFor={`${technicalId}-block-style`}
              >
                Gaya teks
              </label>
              <select
                data-toolbar-item=""
                disabled={!isReady}
                id={`${technicalId}-block-style`}
                onChange={(event) => {
                  if (!editor) return;
                  applyBlockStyle(
                    editor,
                    event.target.value as BroadcastBlockStyle,
                  );
                }}
                onKeyDown={(event) => {
                  /* Panah kiri/kanan dipakai untuk berpindah antarperkakas. */
                  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                  }
                }}
                value={toolbar?.blockStyle ?? "paragraph"}
              >
                {blockStyleOptions.map((option) => (
                  <option
                    disabled={
                      (option.value === "title" &&
                        toolbar?.canTitle === false) ||
                      (option.value === "subtitle" &&
                        toolbar?.canSubtitle === false)
                    }
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </span>
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton
              disabled={!isReady}
              icon="bold"
              label="Tebal"
              onClick={run((current) =>
                current.chain().focus().toggleBold().run(),
              )}
              pressed={toolbar?.isBold ?? false}
              shortcut={`${modifier}B`}
            />
            <ToolbarButton
              disabled={!isReady}
              icon="italic"
              label="Miring"
              onClick={run((current) =>
                current.chain().focus().toggleItalic().run(),
              )}
              pressed={toolbar?.isItalic ?? false}
              shortcut={`${modifier}I`}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton
              disabled={!isReady}
              icon="bulletList"
              label="Daftar berpoin"
              onClick={run((current) =>
                current.chain().focus().toggleBulletList().run(),
              )}
              pressed={toolbar?.isBulletList ?? false}
            />
            <ToolbarButton
              disabled={!isReady}
              icon="numberedList"
              label="Daftar bernomor"
              onClick={run((current) =>
                current.chain().focus().toggleOrderedList().run(),
              )}
              pressed={toolbar?.isOrderedList ?? false}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton
              disabled={!isReady}
              icon="link"
              label={toolbar?.isLink ? "Ubah tautan" : "Sisipkan tautan"}
              onClick={openLinkDialog}
              pressed={toolbar?.isLink ?? false}
              shortcut={`${modifier}K`}
            />
            <ToolbarButton
              disabled={!isReady || !toolbar?.isLink}
              icon="unlink"
              label="Hapus tautan"
              onClick={run((current) =>
                current
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .unsetLink()
                  .run(),
              )}
            />
            <ToolbarButton
              disabled={!isReady}
              icon="image"
              label="Sisipkan gambar"
              onClick={() => setIsImageDialogOpen(true)}
            />
          </ToolbarGroup>
          <ToolbarGroup>
            <ToolbarButton
              disabled={!isReady}
              icon="clearFormat"
              label="Hapus format"
              onClick={run((current) =>
                current.chain().focus().unsetAllMarks().clearNodes().run(),
              )}
            />
            <ToolbarButton
              disabled={!isReady || !toolbar?.canUndo}
              icon="undo"
              label="Urungkan"
              onClick={run((current) => current.chain().focus().undo().run())}
              shortcut={`${modifier}Z`}
            />
            <ToolbarButton
              disabled={!isReady || !toolbar?.canRedo}
              icon="redo"
              label="Ulangi"
              onClick={run((current) => current.chain().focus().redo().run())}
              shortcut={`${modifier}Y`}
            />
          </ToolbarGroup>
        </div>

        {/*
         * Kertas tulis adalah kartu email itu sendiri: pita BHT Nexus, judul
         * email, isi pesan, dan catatan kaki otomatis. Lebar, huruf, dan jarak
         * isinya sama dengan email yang diterima anggota.
         */}
        <div className={styles.canvas}>
          <div className={styles.paper}>
            <div aria-hidden="true" className={styles.paperBand}>
              BHT Nexus
            </div>
            <p
              aria-hidden="true"
              className={styles.paperSubject}
              data-empty={!subject.trim() || undefined}
            >
              {subject.trim() || "Judul email tampil di sini"}
            </p>
            <div className={styles.paperBody}>
              {toolbar?.isEmpty !== false ? (
                <p aria-hidden="true" className={styles.placeholder}>
                  Tulis pengumuman untuk anggota di sini. Pilih teks lalu
                  gunakan perkakas di atas untuk judul, huruf tebal, daftar, dan
                  tautan.
                </p>
              ) : null}
              <EditorContent editor={editor} />
            </div>
            <div aria-hidden="true" className={styles.paperFooter}>
              <NexusBroadcastEmailFooterCopy
                linkClassName={styles.paperFooterLink}
              />
            </div>
          </div>
        </div>
      </div>

      {notice ? (
        <p
          className={styles.editorNotice}
          data-tone={notice.tone}
          role={notice.tone === "danger" ? "alert" : "status"}
        >
          <span>{notice.message}</span>
          <button
            aria-label="Tutup pemberitahuan gambar"
            onClick={() => setNotice(null)}
            type="button"
          >
            <NexusBroadcastIcon name="close" />
          </button>
        </p>
      ) : null}

      {linkDialog ? (
        <BroadcastLinkDialog
          onApply={(href, text) => {
            setLinkDialog(null);
            if (!editor) return;
            if (text) {
              editor
                .chain()
                .focus()
                .insertContent({
                  marks: [{ attrs: { href }, type: "link" }],
                  text,
                  type: "text",
                })
                .run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href })
              .run();
          }}
          onClose={() => {
            setLinkDialog(null);
            editor?.chain().focus().run();
          }}
          onRemove={() => {
            setLinkDialog(null);
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
          }}
          state={linkDialog}
        />
      ) : null}

      {isImageDialogOpen ? (
        <BroadcastImageDialog
          onClose={() => {
            setIsImageDialogOpen(false);
            editor?.chain().focus().run();
          }}
          onInsert={(image, alt, align) => {
            setIsImageDialogOpen(false);
            if (!editor) return;
            flushSync(() => onImageAddRef.current(image));
            /* Gambar kedua disisipkan setelah gambar yang terpilih, bukan menggantikannya. */
            const content = imageNodeContent(image, alt, align);
            const after = positionAfterSelectedImage(editor.state);
            const chain = editor.chain().focus();
            if (after === null) chain.insertContent(content);
            else chain.insertContentAt(after, content);
            chain.run();
            /* Gambar yang baru disisipkan langsung terpilih agar pengaturannya terlihat. */
            let insertedAt: number | null = null;
            editor.state.doc.descendants((node, position) => {
              if (insertedAt !== null) return false;
              if (
                node.type.name === BROADCAST_IMAGE_NODE &&
                node.attrs.imageId === image.id
              ) {
                insertedAt = position;
              }
              return insertedAt === null;
            });
            if (insertedAt !== null)
              editor.commands.setNodeSelection(insertedAt);
            setNotice(null);
          }}
        />
      ) : null}

      {altDialog ? (
        <BroadcastAltDialog
          imageName={altDialog.imageName}
          initialAlt={altDialog.alt}
          onClose={() => {
            setAltDialog(null);
            editor?.chain().focus().run();
          }}
          onSave={(alt) => {
            const { position } = altDialog;
            setAltDialog(null);
            if (!editor) return;
            const node = editor.state.doc.nodeAt(position);
            if (node?.type.name !== BROADCAST_IMAGE_NODE) return;
            editor
              .chain()
              .focus()
              .command(({ tr }) => {
                tr.setNodeMarkup(position, undefined, { ...node.attrs, alt });
                return true;
              })
              .setNodeSelection(position)
              .run();
          }}
        />
      ) : null}
    </BroadcastImageNodeContext.Provider>
  );
}
