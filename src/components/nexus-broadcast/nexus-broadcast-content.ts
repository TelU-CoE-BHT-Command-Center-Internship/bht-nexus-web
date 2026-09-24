import type { JSONContent } from "@tiptap/react";

/**
 * Model isi broadcast yang dinormalisasi dari dokumen editor.
 *
 * Pemeriksaan kesiapan, tampilan email, dan permintaan kirim membaca model ini,
 * bukan dokumen editor secara langsung, sehingga tidak ada dua tafsiran untuk
 * isi yang sama. Bentuknya sengaja terbatas pada hal yang aman untuk email:
 * paragraf, dua gaya judul, huruf tebal dan miring, daftar, tautan http/https,
 * serta gambar berdeskripsi.
 */

export type BroadcastHeadingStyle = "subtitle" | "title";

export type BroadcastListStyle = "bulleted" | "numbered";

export type BroadcastLink = {
  href: string;
  /** Tautan yang alamatnya tidak lolos pemeriksaan tidak dirender sebagai tautan. */
  isValid: boolean;
};

export type BroadcastTextInline = {
  bold: boolean;
  italic: boolean;
  key: string;
  kind: "text";
  link?: BroadcastLink;
  text: string;
};

export type BroadcastBreakInline = { key: string; kind: "break" };

export type BroadcastInline = BroadcastBreakInline | BroadcastTextInline;

export type BroadcastListItem = {
  blocks: BroadcastBlock[];
  key: string;
};

export type BroadcastBlock =
  | { inlines: BroadcastInline[]; key: string; kind: "paragraph" }
  | {
      inlines: BroadcastInline[];
      key: string;
      kind: "heading";
      style: BroadcastHeadingStyle;
    }
  | {
      items: BroadcastListItem[];
      key: string;
      kind: "list";
      start: number;
      style: BroadcastListStyle;
    }
  | {
      align: BroadcastImageAlign;
      alt: string;
      imageId: string;
      key: string;
      kind: "image";
      /** Lebar dalam persen dari lebar isi email. */
      width: number;
    };

export type BroadcastDocument = {
  blocks: BroadcastBlock[];
};

/** Nama node gambar pada editor; gambar dirujuk lewat ID berkas lokal. */
export const BROADCAST_IMAGE_NODE = "broadcastImage";

/**
 * Posisi gambar di dalam isi pesan. `left` dan `right` membuat teks mengalir
 * di sampingnya, seperti gambar rata kiri atau kanan pada pengolah dokumen.
 */
export type BroadcastImageAlign = "center" | "left" | "right";

/**
 * Lebar isi email pada templat `baseEmailLayout`: kartu 600 px dikurangi
 * padding 32 px di kiri dan kanan. Area tulis dan tampilan email memakai lebar
 * yang sama sehingga ukuran gambar di editor sama dengan ukuran di email.
 */
export const BROADCAST_EMAIL_CONTENT_WIDTH = 536;

/**
 * Batas lebar gambar dalam persen. Gambar yang diapit teks dibatasi 60% agar
 * kolom teks di sampingnya tetap terbaca, mengikuti saran pengolah blog untuk
 * membungkus teks hanya di sekitar gambar yang kecil.
 */
export const BROADCAST_IMAGE_WIDTH = {
  floatMax: 60,
  max: 100,
  min: 15,
} as const;

export const BROADCAST_IMAGE_SIZES = [
  { label: "Kecil", width: 33 },
  { label: "Sedang", width: 50 },
  { label: "Besar", width: 75 },
  { label: "Penuh", width: 100 },
] as const;

export function broadcastImageAlign(value: unknown): BroadcastImageAlign {
  return value === "left" || value === "right" ? value : "center";
}

export function clampBroadcastImageWidth(
  width: number,
  align: BroadcastImageAlign,
) {
  const max =
    align === "center"
      ? BROADCAST_IMAGE_WIDTH.max
      : BROADCAST_IMAGE_WIDTH.floatMax;
  if (!Number.isFinite(width)) return max;
  return Math.round(Math.min(max, Math.max(BROADCAST_IMAGE_WIDTH.min, width)));
}

/** Lebar awal gambar: ukuran aslinya, tetapi tidak melebihi lebar isi email. */
export function initialBroadcastImageWidth(naturalWidth: number) {
  return clampBroadcastImageWidth(
    (naturalWidth / BROADCAST_EMAIL_CONTENT_WIDTH) * 100,
    "center",
  );
}

/** Lebar gambar dalam piksel email, dipakai atribut `width` pada email. */
export function broadcastImagePixelWidth(width: number) {
  return Math.round((BROADCAST_EMAIL_CONTENT_WIDTH * width) / 100);
}

/**
 * Tingkat judul pada editor untuk dua gaya judul yang dilihat penulis. Judul
 * email sendiri memakai subjek, sehingga isi pesan dimulai dari tingkat kedua.
 */
export const BROADCAST_HEADING_LEVELS = {
  subtitle: 3,
  title: 2,
} as const satisfies Record<BroadcastHeadingStyle, number>;

const BROADCAST_LINK_MAX_LENGTH = 2048;
const EXPLICIT_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i;
const OPAQUE_SCHEME = /^(?:data|file|ftp|javascript|mailto|sms|tel|vbscript):/i;

/**
 * Satu aturan alamat tautan broadcast: hanya http/https dengan nama host yang
 * lengkap, tanpa kredensial di dalam alamat. Mengembalikan alamat yang sudah
 * dinormalisasi atau `null` bila alamat tidak dapat dipakai.
 */
export function parseBroadcastLinkUrl(value: string): string | null {
  if (!value || value.length > BROADCAST_LINK_MAX_LENGTH) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;

  const host = url.hostname;
  if (!host.includes(".") || host.startsWith(".") || host.endsWith(".")) {
    return null;
  }

  return url.href;
}

/**
 * Masukan penulis boleh tanpa skema, misalnya `telkomuniversity.ac.id`.
 * Alamat seperti itu dilengkapi `https://`, sedangkan skema lain seperti
 * `javascript:` atau `mailto:` tetap ditolak oleh aturan di atas.
 */
export function normalizeBroadcastLinkInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  const candidate =
    EXPLICIT_SCHEME.test(trimmed) || OPAQUE_SCHEME.test(trimmed)
      ? trimmed
      : `https://${trimmed.replace(/^\/+/, "")}`;

  return parseBroadcastLinkUrl(candidate);
}

function linkFrom(marks: JSONContent["marks"]): BroadcastLink | undefined {
  const mark = marks?.find((candidate) => candidate.type === "link");
  if (!mark) return undefined;

  const rawHref = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
  const href = parseBroadcastLinkUrl(rawHref);
  return href ? { href, isValid: true } : { href: rawHref, isValid: false };
}

function sameLink(first?: BroadcastLink, second?: BroadcastLink) {
  return first?.href === second?.href && first?.isValid === second?.isValid;
}

function inlinesFrom(nodes: JSONContent[] | undefined, key: string) {
  const inlines: BroadcastInline[] = [];

  for (const node of nodes ?? []) {
    if (node.type === "hardBreak") {
      inlines.push({ key: `${key}.${inlines.length}`, kind: "break" });
      continue;
    }
    if (node.type !== "text" || !node.text) continue;

    const bold = node.marks?.some((mark) => mark.type === "bold") ?? false;
    const italic = node.marks?.some((mark) => mark.type === "italic") ?? false;
    const link = linkFrom(node.marks);
    const previous = inlines.at(-1);

    if (
      previous?.kind === "text" &&
      previous.bold === bold &&
      previous.italic === italic &&
      sameLink(previous.link, link)
    ) {
      previous.text += node.text.replace(/\r?\n/g, " ");
      continue;
    }

    inlines.push({
      bold,
      italic,
      key: `${key}.${inlines.length}`,
      kind: "text",
      ...(link ? { link } : {}),
      text: node.text.replace(/\r?\n/g, " "),
    });
  }

  while (inlines[0]?.kind === "break") inlines.shift();
  while (inlines.at(-1)?.kind === "break") inlines.pop();
  return inlines;
}

function hasVisibleText(inlines: readonly BroadcastInline[]) {
  return inlines.some(
    (inline) => inline.kind === "text" && inline.text.trim() !== "",
  );
}

function blockFrom(node: JSONContent, key: string): BroadcastBlock | null {
  switch (node.type) {
    case "paragraph": {
      const inlines = inlinesFrom(node.content, key);
      return hasVisibleText(inlines)
        ? { inlines, key, kind: "paragraph" }
        : null;
    }
    case "heading": {
      const inlines = inlinesFrom(node.content, key);
      if (!hasVisibleText(inlines)) return null;
      const style: BroadcastHeadingStyle =
        node.attrs?.level === BROADCAST_HEADING_LEVELS.subtitle
          ? "subtitle"
          : "title";
      return { inlines, key, kind: "heading", style };
    }
    case "bulletList":
    case "orderedList": {
      const items = (node.content ?? [])
        .map((item, index) => ({
          blocks: blocksFrom(item.content, `${key}.${index}`),
          key: `${key}.${index}`,
        }))
        .filter((item) => item.blocks.length > 0);
      if (items.length === 0) return null;
      const start = Number(node.attrs?.start);
      return {
        items,
        key,
        kind: "list",
        start: Number.isInteger(start) && start > 0 ? start : 1,
        style: node.type === "orderedList" ? "numbered" : "bulleted",
      };
    }
    case BROADCAST_IMAGE_NODE: {
      const imageId = node.attrs?.imageId;
      if (typeof imageId !== "string" || !imageId) return null;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
      const align = broadcastImageAlign(node.attrs?.align);
      return {
        align,
        alt: alt.trim(),
        imageId,
        key,
        kind: "image",
        width: clampBroadcastImageWidth(Number(node.attrs?.width), align),
      };
    }
    default:
      return null;
  }
}

function blocksFrom(nodes: JSONContent[] | undefined, key: string) {
  const blocks: BroadcastBlock[] = [];
  (nodes ?? []).forEach((node, index) => {
    const block = blockFrom(node, `${key}.${index}`);
    if (block) blocks.push(block);
  });
  return blocks;
}

/**
 * Paragraf, judul, dan butir daftar yang kosong tidak ikut dinormalisasi:
 * email tidak menampilkannya, sehingga tampilan email di halaman ini juga
 * tidak menampilkannya.
 */
export function normalizeBroadcastDocument(
  content: JSONContent | null | undefined,
): BroadcastDocument {
  return { blocks: blocksFrom(content?.content, "b") };
}

export function broadcastDocumentIsEmpty(document: BroadcastDocument) {
  return document.blocks.length === 0;
}

export function broadcastWordCount(document: BroadcastDocument) {
  const countBlocks = (blocks: readonly BroadcastBlock[]): number =>
    blocks.reduce((total, block) => {
      if (block.kind === "list") {
        return (
          total +
          block.items.reduce((sum, item) => sum + countBlocks(item.blocks), 0)
        );
      }
      if (block.kind === "image") return total;
      return (
        total +
        block.inlines.reduce(
          (sum, inline) =>
            inline.kind === "text"
              ? sum + inline.text.split(/\s+/).filter(Boolean).length
              : sum,
          0,
        )
      );
    }, 0);
  return countBlocks(document.blocks);
}

export type BroadcastDocumentSummary = {
  headings: number;
  images: { alt: string; imageId: string }[];
  invalidLinks: number;
  links: number;
  lists: number;
  paragraphs: number;
};

export function summarizeBroadcastDocument(
  document: BroadcastDocument,
): BroadcastDocumentSummary {
  const summary: BroadcastDocumentSummary = {
    headings: 0,
    images: [],
    invalidLinks: 0,
    links: 0,
    lists: 0,
    paragraphs: 0,
  };

  const countLinks = (inlines: readonly BroadcastInline[]) => {
    let previous: BroadcastLink | undefined;
    for (const inline of inlines) {
      const link = inline.kind === "text" ? inline.link : undefined;
      if (link && !sameLink(previous, link)) {
        if (link.isValid) summary.links += 1;
        else summary.invalidLinks += 1;
      }
      previous = link;
    }
  };

  const visit = (blocks: readonly BroadcastBlock[]) => {
    for (const block of blocks) {
      if (block.kind === "paragraph") {
        summary.paragraphs += 1;
        countLinks(block.inlines);
      } else if (block.kind === "heading") {
        summary.headings += 1;
        countLinks(block.inlines);
      } else if (block.kind === "list") {
        summary.lists += 1;
        for (const item of block.items) visit(item.blocks);
      } else {
        summary.images.push({ alt: block.alt, imageId: block.imageId });
      }
    }
  };

  visit(document.blocks);
  return summary;
}

/*
 * Serialisasi Markdown untuk penyimpanan dan pengiriman.
 *
 * Meeting Minggu 12 menyepakati isi broadcast disimpan sebagai Markdown.
 * Penulis tidak pernah melihat atau mengetik sintaks ini; Markdown dibentuk
 * dari model di atas. Dialeknya CommonMark dengan batasan berikut agar hasil
 * render tidak pernah berbeda dari tampilan email di halaman:
 *
 * - huruf tebal dan miring ditulis sebagai tag `<strong>` dan `<em>`, karena
 *   aturan pembatas `*` CommonMark dapat gagal di dekat tanda baca;
 * - pindah baris di dalam paragraf memakai garis miring terbalik di akhir baris,
 *   dan `<br>` di dalam judul;
 * - seluruh tanda baca Markdown pada teks penulis di-escape, termasuk alamat
 *   web polos agar tidak berubah menjadi tautan otomatis;
 * - dua daftar sejenis yang berurutan memakai penanda berbeda supaya tidak
 *   tergabung menjadi satu daftar;
 * - gambar ditulis sebagai tag `<img>` dengan `width` piksel email dan
 *   `data-align`, karena sintaks gambar Markdown tidak dapat membawa ukuran
 *   maupun posisi.
 */

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeMarkdownText(text: string) {
  return text
    .replace(/[\\`*_[\]<>~|#@]/g, "\\$&")
    .replace(/&(?=#?[a-z\d]+;)/gi, "\\&")
    .replace(/:\/\//g, "\\://")
    .replace(/\bwww\./gi, (match) => `${match.slice(0, 3)}\\.`);
}

function escapeLineStart(line: string) {
  return line
    .replace(/^[ \t]+/, "")
    .replace(/[ \t]+$/, "")
    .replace(/^([+=-])/, "\\$1")
    .replace(/^(\d{1,9})([.)])/, "$1\\$2");
}

function serializeTextRun(inline: BroadcastTextInline) {
  const escaped = escapeMarkdownText(inline.text);
  if (!inline.bold && !inline.italic) return escaped;

  const [, lead = "", core = "", trail = ""] =
    /^(\s*)([\s\S]*?)(\s*)$/.exec(escaped) ?? [];
  if (!core) return escaped;

  let wrapped = core;
  if (inline.italic) wrapped = `<em>${wrapped}</em>`;
  if (inline.bold) wrapped = `<strong>${wrapped}</strong>`;
  return `${lead}${wrapped}${trail}`;
}

function validHref(inline: BroadcastTextInline) {
  return inline.link?.isValid ? inline.link.href : undefined;
}

function serializeLine(runs: readonly BroadcastTextInline[]) {
  let output = "";
  let index = 0;

  while (index < runs.length) {
    const href = validHref(runs[index] as BroadcastTextInline);
    let end = index + 1;
    while (
      end < runs.length &&
      validHref(runs[end] as BroadcastTextInline) === href
    ) {
      end += 1;
    }

    const inner = runs.slice(index, end).map(serializeTextRun).join("");
    output += href ? `[${inner}](<${href}>)` : inner;
    index = end;
  }

  return output;
}

function serializeInlineLines(inlines: readonly BroadcastInline[]) {
  const lines: BroadcastTextInline[][] = [[]];
  for (const inline of inlines) {
    if (inline.kind === "break") lines.push([]);
    else lines.at(-1)?.push(inline);
  }
  return lines.map((line) => escapeLineStart(serializeLine(line)));
}

type ImageUrlResolver = (imageId: string) => string;

function serializeImage(
  block: Extract<BroadcastBlock, { kind: "image" }>,
  imageUrl: ImageUrlResolver,
) {
  const url = parseBroadcastLinkUrl(imageUrl(block.imageId));
  if (!url) {
    throw new Error(`Alamat gambar ${block.imageId} belum tersedia.`);
  }
  return `<img src="${escapeHtmlAttribute(url)}" alt="${escapeHtmlAttribute(block.alt)}" width="${broadcastImagePixelWidth(block.width)}" data-align="${block.align}">`;
}

/**
 * Daftar "rapat" menaruh isi butirnya langsung di dalam butir tanpa jarak
 * paragraf. Aturannya mengikuti CommonMark: butir hanya boleh berisi satu blok
 * teks di awal dan daftar bertingkat sesudahnya, sedangkan gambar selalu
 * berdiri sendiri karena tag gambar berlanjut sampai baris kosong berikutnya.
 * Tampilan email memakai fungsi yang sama supaya jarak antarbutir tidak
 * berbeda dari hasil kirimnya.
 */
export function broadcastListIsTight(
  block: Extract<BroadcastBlock, { kind: "list" }>,
) {
  return block.items.every(
    (item) =>
      (item.blocks[0]?.kind !== "image" || item.blocks.length === 1) &&
      item.blocks.every((child, index) => {
        if (index === 0) return true;
        if (child.kind !== "list") return false;
        /* Daftar bernomor yang tidak dimulai dari 1 tidak dapat menyela paragraf. */
        return child.style === "bulleted" || child.start === 1;
      }),
  );
}

function serializeList(
  block: Extract<BroadcastBlock, { kind: "list" }>,
  imageUrl: ImageUrlResolver,
  alternateMarker: boolean,
) {
  const tight = broadcastListIsTight(block);

  const items = block.items.map((item, index) => {
    const marker =
      block.style === "bulleted"
        ? alternateMarker
          ? "*"
          : "-"
        : `${block.start + index}${alternateMarker ? ")" : "."}`;
    const padding = " ".repeat(marker.length + 1);
    const content = serializeBlocks(
      item.blocks,
      imageUrl,
      tight ? "\n" : "\n\n",
    );
    return content
      .split("\n")
      .map((line, lineIndex) => {
        if (lineIndex === 0) return `${marker} ${line}`;
        return line ? `${padding}${line}` : line;
      })
      .join("\n");
  });

  return items.join(tight ? "\n" : "\n\n");
}

function serializeBlock(
  block: BroadcastBlock,
  imageUrl: ImageUrlResolver,
  alternateMarker: boolean,
) {
  switch (block.kind) {
    case "paragraph":
      return serializeInlineLines(block.inlines).join("\\\n");
    case "heading":
      return `${block.style === "title" ? "##" : "###"} ${serializeInlineLines(
        block.inlines,
      ).join("<br>")}`;
    case "list":
      return serializeList(block, imageUrl, alternateMarker);
    case "image":
      return serializeImage(block, imageUrl);
  }
}

function serializeBlocks(
  blocks: readonly BroadcastBlock[],
  imageUrl: ImageUrlResolver,
  separator: "\n" | "\n\n",
) {
  const output: string[] = [];
  let previous: BroadcastBlock | undefined;
  let alternateMarker = false;

  for (const block of blocks) {
    const followsSameList =
      block.kind === "list" &&
      previous?.kind === "list" &&
      previous.style === block.style;
    alternateMarker = followsSameList ? !alternateMarker : false;
    output.push(serializeBlock(block, imageUrl, alternateMarker));
    previous = block;
  }

  return output.join(separator);
}

/**
 * Membentuk Markdown dari isi broadcast. `imageUrl` memetakan ID gambar lokal
 * ke alamat publik hasil unggahan; gambar yang belum diunggah menghentikan
 * serialisasi karena alamat lokal peramban tidak pernah boleh terkirim.
 */
export function serializeBroadcastMarkdown(
  document: BroadcastDocument,
  imageUrl: ImageUrlResolver,
) {
  return serializeBlocks(document.blocks, imageUrl, "\n\n");
}
