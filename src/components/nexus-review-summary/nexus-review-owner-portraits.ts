import type { StaticImageData } from "next/image";
import ditaPortrait from "@/assets/members/dita-puspitasari.webp";
import fathurPortrait from "@/assets/members/fathur-rahman.webp";
import hestyPortrait from "@/assets/members/hesty-susanti.png";
import lailyPortrait from "@/assets/members/laily-ade-oktaviana.webp";
import ammarPortrait from "@/assets/members/muhammad-ammar-asyraf.webp";
import salsabilaPortrait from "@/assets/members/salsabila-aurellia.webp";
import suksmandhiraPortrait from "@/assets/members/suksmandhira-harimurti.webp";
import type { ReviewOwnerPortrait } from "@/components/nexus-review-summary/nexus-review-table-content";

export const nexusReviewOwnerPortraits: Record<
  ReviewOwnerPortrait,
  StaticImageData
> = {
  ammar: ammarPortrait,
  dita: ditaPortrait,
  fathur: fathurPortrait,
  hesty: hestyPortrait,
  laily: lailyPortrait,
  salsabila: salsabilaPortrait,
  suksmandhira: suksmandhiraPortrait,
};
