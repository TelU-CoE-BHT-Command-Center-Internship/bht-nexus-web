import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

export type NexusLoginContent = {
  activationHref: string;
  activationLabel: string;
  backHref: string;
  backLabel: string;
  backShortLabel: string;
  changeEmailLabel: string;
  codeSentNotice: string;
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
  otpHint: string;
  otpLabel: string;
  passwordHideLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordShowLabel: string;
  platformName: string;
  resendCooldownLabel: string;
  resendLabel: string;
  resendingLabel: string;
  sessionExpiredNotice: string;
  signedOutNotice: string;
  signInLabel: string;
  signingInLabel: string;
  storyTagline: string;
  switchLocaleHref: string;
  verifyDescription: string;
  verifyLabel: string;
  verifyTitle: string;
  verifyingLabel: string;
};

const createWhatsAppHref = (message: string) =>
  `${COE_BHT_LINKS.whatsapp}?text=${encodeURIComponent(message)}`;

const nexusLoginContent = {
  id: {
    activationHref: "/nexus/aktivasi",
    activationLabel: "Akun baru? Aktifkan akun",
    backHref: "/",
    backLabel: "Kembali ke situs CoE BHT",
    backShortLabel: "Situs CoE BHT",
    changeEmailLabel: "Gunakan email lain",
    codeSentNotice: "Kode baru sudah dikirim.",
    emailLabel: "Email",
    emailPlaceholder: "nama@telkomuniversity.ac.id",
    forgotPasswordHref: "/nexus/lupa-kata-sandi",
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
    otpHint: "Masukkan 6 digit kode dari email terbaru.",
    otpLabel: "Kode verifikasi",
    passwordHideLabel: "Sembunyikan kata sandi",
    passwordLabel: "Kata sandi",
    passwordPlaceholder: "Masukkan kata sandi",
    passwordShowLabel: "Tampilkan kata sandi",
    platformName: "BHT Nexus",
    resendCooldownLabel: "Kirim ulang kode dalam {seconds} detik",
    resendLabel: "Kirim ulang kode",
    resendingLabel: "Mengirim kode…",
    sessionExpiredNotice:
      "Sesi Anda telah berakhir. Silakan masuk kembali untuk melanjutkan.",
    signedOutNotice: "Anda telah keluar dari BHT Nexus.",
    signInLabel: "Masuk",
    signingInLabel: "Memeriksa akun…",
    storyTagline: "One Data. One Platform. One Ecosystem.",
    switchLocaleHref: "/en/nexus/sign-in",
    verifyDescription:
      "Email akun ini belum diverifikasi. Kami mengirim kode 6 digit ke {email}.",
    verifyLabel: "Verifikasi dan masuk",
    verifyTitle: "Verifikasi email Anda",
    verifyingLabel: "Memverifikasi…",
  },
  en: {
    activationHref: "/en/nexus/activate",
    activationLabel: "New account? Activate it",
    backHref: "/en",
    backLabel: "Back to the CoE BHT website",
    backShortLabel: "CoE BHT website",
    changeEmailLabel: "Use a different email",
    codeSentNotice: "A new code has been sent.",
    emailLabel: "Email",
    emailPlaceholder: "name@telkomuniversity.ac.id",
    forgotPasswordHref: "/en/nexus/forgot-password",
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
    otpHint: "Enter the 6-digit code from the latest email.",
    otpLabel: "Verification code",
    passwordHideLabel: "Hide password",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    passwordShowLabel: "Show password",
    platformName: "BHT Nexus",
    resendCooldownLabel: "Resend code in {seconds} seconds",
    resendLabel: "Resend code",
    resendingLabel: "Sending code…",
    sessionExpiredNotice: "Your session has ended. Sign in again to continue.",
    signedOutNotice: "You have signed out of BHT Nexus.",
    signInLabel: "Sign in",
    signingInLabel: "Checking your account…",
    storyTagline: "One Data. One Platform. One Ecosystem.",
    switchLocaleHref: "/nexus/masuk",
    verifyDescription:
      "This account's email is not verified yet. We sent a 6-digit code to {email}.",
    verifyLabel: "Verify and sign in",
    verifyTitle: "Verify your email",
    verifyingLabel: "Verifying…",
  },
} satisfies Record<Locale, NexusLoginContent>;

export function getNexusLoginContent(locale: Locale): NexusLoginContent {
  return nexusLoginContent[locale];
}
