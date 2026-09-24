"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import {
  type BroadcastBlock,
  type BroadcastDocument,
  type BroadcastInline,
  type BroadcastTextInline,
  broadcastDocumentIsEmpty,
  broadcastImagePixelWidth,
  broadcastListIsTight,
} from "@/components/nexus-broadcast/nexus-broadcast-content";
import styles from "@/components/nexus-broadcast/nexus-broadcast-email.module.css";
import { NexusBroadcastIcon } from "@/components/nexus-broadcast/nexus-broadcast-icons";
import type { BroadcastImageRegistry } from "@/components/nexus-broadcast/nexus-broadcast-model";

/**
 * Penyaji isi email untuk tampilan Desktop dan Ponsel. Bingkainya meniru
 * `baseEmailLayout` pada `bht-nexus-server`—pita judul BHT Nexus, kartu
 * 600 px, dan catatan kaki otomatis—sedangkan isinya dibaca dari model yang
 * sama dengan Markdown yang dikirim, sehingga keduanya tidak bercabang.
 */

function linkIdentity(inline: BroadcastTextInline) {
  if (!inline.link) return "none";
  return `${inline.link.isValid ? "valid" : "invalid"}:${inline.link.href}`;
}

function TextRun({ run }: { run: BroadcastTextInline }) {
  let content: ReactNode = run.text;
  if (run.italic) content = <em>{content}</em>;
  if (run.bold) content = <strong>{content}</strong>;
  return content;
}

function InlineContent({ inlines }: { inlines: readonly BroadcastInline[] }) {
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < inlines.length) {
    const inline = inlines[index] as BroadcastInline;
    if (inline.kind === "break") {
      nodes.push(<br key={inline.key} />);
      index += 1;
      continue;
    }

    const identity = linkIdentity(inline);
    const group: BroadcastTextInline[] = [inline];
    let end = index + 1;
    while (end < inlines.length) {
      const next = inlines[end] as BroadcastInline;
      if (next.kind !== "text" || linkIdentity(next) !== identity) break;
      group.push(next);
      end += 1;
    }

    const content = group.map((run) => <TextRun key={run.key} run={run} />);
    if (inline.link?.isValid) {
      nodes.push(
        <a
          className={styles.link}
          href={inline.link.href}
          key={inline.key}
          rel="noopener noreferrer"
          target="_blank"
        >
          {content}
        </a>,
      );
    } else if (inline.link) {
      nodes.push(
        <span className={styles.invalidLink} key={inline.key}>
          {content}
          <span className={styles.visuallyHidden}>
            {" "}
            (tautan perlu diperbaiki)
          </span>
        </span>,
      );
    } else {
      nodes.push(...content);
    }
    index = end;
  }

  return nodes;
}

/**
 * Gambar memakai lebar piksel email (`width`) dan posisi `data-align`, sama
 * dengan tag gambar pada Markdown yang dikirim. Pada layar ponsel gambar kiri
 * dan kanan kembali memenuhi lebar, mengikuti aturan email untuk layar kecil.
 */
function EmailImage({
  block,
  images,
}: {
  block: Extract<BroadcastBlock, { kind: "image" }>;
  images: BroadcastImageRegistry;
}) {
  const image = images[block.imageId];
  const pixels = broadcastImagePixelWidth(block.width);

  if (!image) {
    return (
      <span
        className={styles.imageMissing}
        data-align={block.align}
        style={{ width: pixels }}
      >
        <NexusBroadcastIcon name="image" />
        Gambar perlu dipilih ulang
      </span>
    );
  }

  return (
    <Image
      alt={block.alt}
      className={styles.image}
      data-align={block.align}
      height={Math.max(1, Math.round((image.height * pixels) / image.width))}
      src={image.objectUrl}
      unoptimized
      width={pixels}
    />
  );
}

function EmailBlock({
  block,
  images,
  tight,
}: {
  block: BroadcastBlock;
  images: BroadcastImageRegistry;
  tight: boolean;
}) {
  switch (block.kind) {
    case "paragraph":
      return tight ? (
        <InlineContent inlines={block.inlines} />
      ) : (
        <p className={styles.paragraph}>
          <InlineContent inlines={block.inlines} />
        </p>
      );
    case "heading": {
      /*
       * Tampilan email berada di bawah judul bagiannya (h3) dan subjek email
       * (h4), sehingga Judul besar menjadi h5 dan Subjudul h6 pada halaman ini.
       */
      const Heading = block.style === "title" ? "h5" : "h6";
      return (
        <Heading
          className={block.style === "title" ? styles.title : styles.subtitle}
        >
          <InlineContent inlines={block.inlines} />
        </Heading>
      );
    }
    case "list": {
      const itemsAreTight = broadcastListIsTight(block);
      const items = block.items.map((item) => (
        <li className={styles.listItem} key={item.key}>
          <EmailBlocks
            blocks={item.blocks}
            images={images}
            tight={itemsAreTight}
          />
        </li>
      ));
      return block.style === "numbered" ? (
        <ol
          className={styles.list}
          start={block.start === 1 ? undefined : block.start}
        >
          {items}
        </ol>
      ) : (
        <ul className={styles.list}>{items}</ul>
      );
    }
    case "image":
      return <EmailImage block={block} images={images} />;
  }
}

function EmailBlocks({
  blocks,
  images,
  tight = false,
}: {
  blocks: readonly BroadcastBlock[];
  images: BroadcastImageRegistry;
  tight?: boolean;
}) {
  return blocks.map((block) => (
    <EmailBlock block={block} images={images} key={block.key} tight={tight} />
  ));
}

/** Catatan kaki otomatis dari templat email server, dipakai juga oleh kertas editor. */
export function NexusBroadcastEmailFooterCopy({
  linkClassName,
}: {
  linkClassName?: string;
}) {
  return (
    <>
      <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
      <p>
        Butuh bantuan? Hubungi kontak bantuan BHT Nexus melalui{" "}
        <span className={linkClassName}>WhatsApp</span> atau{" "}
        <span className={linkClassName}>email</span>.
      </p>
    </>
  );
}

type EmailMessageProps = {
  document: BroadcastDocument;
  images: BroadcastImageRegistry;
  subject: string;
  variant: "desktop" | "mobile";
};

function EmailMessage({
  document,
  images,
  subject,
  variant,
}: EmailMessageProps) {
  const trimmedSubject = subject.trim();

  return (
    <div className={styles.canvas} data-variant={variant}>
      <article aria-label="Isi email" className={styles.card}>
        <div className={styles.brandBand}>BHT Nexus</div>
        <div className={styles.content}>
          {trimmedSubject ? (
            <h4 className={styles.subject}>{trimmedSubject}</h4>
          ) : (
            <p className={styles.placeholder}>Judul email tampil di sini.</p>
          )}
          {broadcastDocumentIsEmpty(document) ? (
            <p className={styles.placeholder}>
              Isi pesan tampil di sini setelah Anda menulisnya.
            </p>
          ) : (
            <EmailBlocks blocks={document.blocks} images={images} />
          )}
        </div>
        <div className={styles.footer}>
          <NexusBroadcastEmailFooterCopy linkClassName={styles.footerLink} />
        </div>
      </article>
    </div>
  );
}

function SenderRow({ recipientsLabel }: { recipientsLabel: string }) {
  return (
    <div className={styles.sender}>
      <span aria-hidden="true" className={styles.senderAvatar}>
        BN
      </span>
      <span className={styles.senderCopy}>
        <strong>BHT Nexus</strong>
        <span>kepada {recipientsLabel}</span>
      </span>
    </div>
  );
}

type PreviewView = "desktop" | "mobile";

const previewViews: readonly {
  icon: "desktop" | "phone";
  label: string;
  value: PreviewView;
}[] = [
  { icon: "desktop", label: "Desktop", value: "desktop" },
  { icon: "phone", label: "Ponsel", value: "mobile" },
];

export function NexusBroadcastEmailPreview({
  document,
  headingId,
  images,
  recipientsLabel,
  subject,
}: {
  document: BroadcastDocument;
  headingId: string;
  images: BroadcastImageRegistry;
  recipientsLabel: string;
  subject: string;
}) {
  const [view, setView] = useState<PreviewView>("desktop");
  const trimmedSubject = subject.trim();

  return (
    <section aria-labelledby={headingId} className={styles.previewSection}>
      <header className={styles.previewHeader}>
        <span aria-hidden="true" className={styles.previewIcon}>
          <NexusBroadcastIcon name="eye" />
        </span>
        <div className={styles.previewHeading}>
          <h3 id={headingId} tabIndex={-1}>
            Tampilan email
          </h3>
          <p>
            Perkiraan email yang diterima anggota. Setiap aplikasi email dapat
            menampilkannya sedikit berbeda.
          </p>
        </div>
        <fieldset className={styles.viewToggle}>
          <legend className={styles.visuallyHidden}>Ukuran layar</legend>
          {previewViews.map((option) => (
            <button
              aria-pressed={view === option.value}
              key={option.value}
              onClick={() => setView(option.value)}
              type="button"
            >
              <NexusBroadcastIcon name={option.icon} />
              {option.label}
            </button>
          ))}
        </fieldset>
      </header>

      <div className={styles.previewStage} data-view={view}>
        {view === "desktop" ? (
          <div className={styles.clientWindow}>
            <div aria-hidden="true" className={styles.clientBar}>
              <span />
              <span />
              <span />
              <em>Kotak masuk</em>
            </div>
            <div className={styles.clientHeader}>
              <p className={styles.clientSubject}>
                {trimmedSubject || "Judul email belum diisi"}
              </p>
              <SenderRow recipientsLabel={recipientsLabel} />
            </div>
            <EmailMessage
              document={document}
              images={images}
              subject={subject}
              variant="desktop"
            />
          </div>
        ) : (
          <div className={styles.phone}>
            <div className={styles.phoneScreen}>
              <div aria-hidden="true" className={styles.phoneStatus}>
                <span />
              </div>
              <div className={styles.phoneInbox}>
                <strong>{trimmedSubject || "Judul email belum diisi"}</strong>
                <SenderRow recipientsLabel={recipientsLabel} />
              </div>
              <EmailMessage
                document={document}
                images={images}
                subject={subject}
                variant="mobile"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
