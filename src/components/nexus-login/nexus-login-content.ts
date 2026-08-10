import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

export type NexusLoginContent = {
  backHref: string;
  backLabel: string;
  backShortLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  forgotPasswordHref: string;
  forgotPasswordLabel: string;
  formDescription: string;
  formTitle: string;
  helpHref: string;
  helpLabel: string;
  invitationNote: string;
  languageLabel: string;
  passwordHideLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordShowLabel: string;
  platformName: string;
  signInLabel: string;
  storyTagline: string;
  switchLocaleHref: string;
};

const createWhatsAppHref = (message: string) =>
  `${COE_BHT_LINKS.whatsapp}?text=${encodeURIComponent(message)}`;

const nexusLoginContent = {
  id: {
    backHref: "/",
    backLabel: "Kembali ke situs CoE BHT",
    backShortLabel: "Situs CoE BHT",
    emailLabel: "Email",
    emailPlaceholder: "nama@telkomuniversity.ac.id",
    forgotPasswordHref: `${COE_BHT_LINKS.email}?subject=Bantuan%20kata%20sandi%20BHT%20Nexus`,
    forgotPasswordLabel: "Lupa kata sandi?",
    formDescription:
      "Ruang kerja digital CoE Biomedical & Healthcare Technology.",
    formTitle: "Masuk ke BHT Nexus",
    helpHref: createWhatsAppHref(
      "Halo CoE BHT, saya memerlukan bantuan untuk masuk ke BHT Nexus.",
    ),
    helpLabel: "Butuh bantuan masuk?",
    invitationNote:
      "Akun BHT Nexus dibuat melalui undangan. Tidak ada pendaftaran publik.",
    languageLabel: "Pilih bahasa",
    passwordHideLabel: "Sembunyikan kata sandi",
    passwordLabel: "Kata sandi",
    passwordPlaceholder: "Masukkan kata sandi",
    passwordShowLabel: "Tampilkan kata sandi",
    platformName: "BHT Nexus",
    signInLabel: "Masuk",
    storyTagline: "One Data. One Platform. One Ecosystem.",
    switchLocaleHref: "/en/nexus/sign-in",
  },
  en: {
    backHref: "/en",
    backLabel: "Back to the CoE BHT website",
    backShortLabel: "CoE BHT website",
    emailLabel: "Email",
    emailPlaceholder: "name@telkomuniversity.ac.id",
    forgotPasswordHref: `${COE_BHT_LINKS.email}?subject=BHT%20Nexus%20password%20help`,
    forgotPasswordLabel: "Forgot your password?",
    formDescription:
      "The digital workspace for CoE Biomedical & Healthcare Technology.",
    formTitle: "Sign in to BHT Nexus",
    helpHref: createWhatsAppHref(
      "Hello CoE BHT, I need help signing in to BHT Nexus.",
    ),
    helpLabel: "Need help signing in?",
    invitationNote:
      "BHT Nexus accounts are created by invitation. Public registration is not available.",
    languageLabel: "Choose language",
    passwordHideLabel: "Hide password",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    passwordShowLabel: "Show password",
    platformName: "BHT Nexus",
    signInLabel: "Sign in",
    storyTagline: "One Data. One Platform. One Ecosystem.",
    switchLocaleHref: "/nexus/masuk",
  },
} satisfies Record<Locale, NexusLoginContent>;

export function getNexusLoginContent(locale: Locale): NexusLoginContent {
  return nexusLoginContent[locale];
}
