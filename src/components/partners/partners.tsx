import Image from "next/image";
import styles from "@/components/partners/partners.module.css";
import {
  domesticPartners,
  getPartnersContent,
  internationalPartners,
  type PartnerLogo,
} from "@/components/partners/partners-content";
import type { Locale } from "@/i18n/locales";

type PartnersProps = {
  locale: Locale;
};

const MINIMUM_ITEMS_PER_SEQUENCE = 12;

function fillMarqueeSequence(partners: PartnerLogo[]): PartnerLogo[] {
  const repetitions = Math.ceil(MINIMUM_ITEMS_PER_SEQUENCE / partners.length);

  return Array.from({ length: repetitions }, () => partners).flat();
}

function PartnerList({
  duplicate = false,
  partners,
  uniquePartnerCount,
}: {
  duplicate?: boolean;
  partners: PartnerLogo[];
  uniquePartnerCount: number;
}) {
  return (
    <ul className={`${styles.logoList} ${duplicate ? styles.duplicate : ""}`}>
      {partners.map((partner, index) => (
        <li
          className={`${styles.logoItem} ${index >= uniquePartnerCount ? styles.repeated : ""}`}
          data-partner-name={partner.name}
          key={`${partner.name}-${index}`}
        >
          <span className={`${styles.logoFrame} ${styles[partner.shape]}`}>
            <Image
              alt=""
              className={styles.logo}
              sizes="(max-width: 48rem) 10rem, 13rem"
              src={partner.image}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

function PartnerRail({
  label,
  labelId,
  partners,
}: {
  label: string;
  labelId: string;
  partners: PartnerLogo[];
}) {
  const marqueePartners = fillMarqueeSequence(partners);

  return (
    <section aria-labelledby={labelId} className={styles.partnerGroup}>
      <h3 id={labelId}>{label}</h3>

      <ul className={styles.screenReaderList}>
        {partners.map((partner) => (
          <li key={partner.name}>{partner.name}</li>
        ))}
      </ul>

      <div aria-hidden="true" className={styles.rail}>
        <div className={styles.track}>
          <PartnerList
            partners={marqueePartners}
            uniquePartnerCount={partners.length}
          />
          <PartnerList
            duplicate
            partners={marqueePartners}
            uniquePartnerCount={partners.length}
          />
        </div>
      </div>
    </section>
  );
}

export function Partners({ locale }: PartnersProps) {
  const content = getPartnersContent(locale);
  const titleId = `partners-title-${locale}`;

  return (
    <section aria-labelledby={titleId} className={styles.section} id="partners">
      <div className={styles.inner}>
        <h2 id={titleId}>{content.title}</h2>

        <div className={styles.groups}>
          <PartnerRail
            label={content.domesticLabel}
            labelId={`domestic-partners-title-${locale}`}
            partners={domesticPartners}
          />
          <PartnerRail
            label={content.internationalLabel}
            labelId={`international-partners-title-${locale}`}
            partners={internationalPartners}
          />
        </div>
      </div>
    </section>
  );
}
