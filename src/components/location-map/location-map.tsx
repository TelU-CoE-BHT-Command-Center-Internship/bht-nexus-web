import Image, { type StaticImageData } from "next/image";
import instagramIcon from "@/assets/instagram-1-svgrepo-com.svg";
import mailIcon from "@/assets/mail-svgrepo-com.svg";
import whatsappIcon from "@/assets/whatsapp-svgrepo-com.svg";
import styles from "@/components/location-map/location-map.module.css";
import { LocationMapClient } from "@/components/location-map/location-map-client";
import {
  COE_BHT_LOCATION,
  type ContactChannelIcon,
  getLocationMapContent,
} from "@/components/location-map/location-map-content";
import type { Locale } from "@/components/site-header/site-navigation";

type LocationMapProps = {
  locale: Locale;
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 12h15M14 6l6 6-6 6" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

const contactIcons: Record<ContactChannelIcon, StaticImageData> = {
  email: mailIcon,
  instagram: instagramIcon,
  whatsapp: whatsappIcon,
};

function SocialIcon({ icon }: { icon: ContactChannelIcon }) {
  return <Image alt="" aria-hidden="true" src={contactIcons[icon]} />;
}

export function LocationMap({ locale }: LocationMapProps) {
  const content = getLocationMapContent(locale);
  const titleId = `location-map-title-${locale}`;

  return (
    <section aria-labelledby={titleId} className={styles.section} id="contact">
      <div className={styles.inner}>
        <div className={styles.locationColumn}>
          <LocationMapClient
            errorLabel={content.errorLabel}
            latitude={COE_BHT_LOCATION.coordinates.latitude}
            loadingLabel={content.loadingLabel}
            longitude={COE_BHT_LOCATION.coordinates.longitude}
            mapLabel={content.mapLabel}
            markerLabel={content.markerLabel}
            styleUrl={COE_BHT_LOCATION.mapStyleUrl}
          />

          <a
            aria-label={`${content.directionsLabel}: ${COE_BHT_LOCATION.address}`}
            className={styles.addressLink}
            href={COE_BHT_LOCATION.directionsHref}
            rel="noreferrer"
            target="_blank"
          >
            <LocationIcon />
            <span className={styles.addressCopy}>
              <span>{content.addressLabel}</span>
              <strong>{COE_BHT_LOCATION.address}</strong>
            </span>
            <span className={styles.addressAction}>
              {content.directionsLabel}
              <ArrowIcon />
            </span>
          </a>
        </div>

        <div className={styles.contactColumn}>
          <div className={styles.contactContent}>
            <header className={styles.header}>
              <h2 id={titleId}>{content.title}</h2>
              <p>{content.description}</p>
            </header>

            <ul className={styles.channelList}>
              {content.channels.map((channel) => (
                <li key={channel.icon}>
                  <a
                    aria-label={channel.ariaLabel}
                    className={styles.channelLink}
                    href={channel.href}
                    rel={channel.external ? "noreferrer" : undefined}
                    target={channel.external ? "_blank" : undefined}
                  >
                    <span className={styles.channelIcon}>
                      <SocialIcon icon={channel.icon} />
                    </span>
                    <span className={styles.channelCopy}>
                      <span>{channel.prefix}</span>
                      <strong>{channel.label}</strong>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
