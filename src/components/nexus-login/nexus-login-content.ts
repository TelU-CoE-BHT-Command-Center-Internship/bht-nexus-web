import { COE_BHT_LINKS } from "@/content/coe-bht";
import type { Locale } from "@/i18n/locales";

export type NexusLoginContent = {
  backHref: string;
  backLabel: string;
  backShortLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  destinationHref: string;
  firstSignInHint: string;
  forgotPasswordLabel: string;
  formDescription: string;
  formTitle: string;
  helpHref: string;
  helpLabel: string;
  invalidCredentialsError: string;
  invitationNote: string;
  otpDescription: string;
  otpPasswordNote: string;
  otpInvalidError: string;
  otpLabel: string;
  otpResendLabel: string;
  otpResentNotice: string;
  otpSubmitLabel: string;
  otpTitle: string;
  passwordMismatchError: string;
  passwordTooShortError: string;
  rateLimitedError: string;
  resetBackLabel: string;
  resetCodeSentNotice: string;
  resetConfirmPasswordLabel: string;
  resetDescription: string;
  resetNewPasswordLabel: string;
  resetNewPasswordPlaceholder: string;
  resetRequestDescription: string;
  resetRequestSubmitLabel: string;
  resetRequestTitle: string;
  resetSendingLabel: string;
  resetSubmitLabel: string;
  resetTitle: string;
  stepBackLabel: string;
  suspendedError: string;
  tooManyAttemptsError: string;
  totpDescription: string;
  totpLabel: string;
  totpTitle: string;
  unavailableError: string;
  verifyingLabel: string;
  languageLabel: string;
  passwordHideLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordShowLabel: string;
  platformName: string;
  signInLabel: string;
  signingInLabel: string;
  storyTagline: string;
  switchLocaleHref: string;
  unexpectedError: string;
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
    destinationHref: "/nexus",
    firstSignInHint:
      "Pertama kali masuk? Isi email undangan Anda dan buat kata sandi baru di kolom ini. Kode verifikasi akan dikirim ke email tersebut.",
    forgotPasswordLabel: "Lupa kata sandi?",
    formDescription:
      "Ruang kerja digital CoE Biomedical & Healthcare Technology.",
    formTitle: "Masuk ke BHT Nexus",
    helpHref: createWhatsAppHref(
      "Halo CoE BHT, saya memerlukan bantuan untuk masuk ke BHT Nexus.",
    ),
    helpLabel: "Butuh bantuan masuk?",
    invalidCredentialsError: "Email atau kata sandi salah.",
    invitationNote:
      "Akun BHT Nexus dibuat melalui undangan. Tidak ada pendaftaran publik.",
    languageLabel: "Pilih bahasa",
    otpDescription:
      "Akun ini baru pertama kali masuk. Masukkan kode verifikasi yang dikirim ke",
    otpPasswordNote:
      "Setelah kode benar, kata sandi yang Anda ketik tadi menjadi kata sandi akun Anda.",
    otpInvalidError: "Kode tidak cocok atau sudah kedaluwarsa. Coba lagi.",
    otpLabel: "Kode verifikasi",
    otpResendLabel: "Kirim ulang kode",
    otpResentNotice: "Kode baru sudah diminta. Periksa email Anda.",
    otpSubmitLabel: "Verifikasi dan masuk",
    otpTitle: "Verifikasi email",
    passwordMismatchError: "Kedua kata sandi baru belum sama.",
    passwordTooShortError: "Kata sandi baru minimal 8 karakter.",
    rateLimitedError:
      "Terlalu banyak percobaan. Tunggu beberapa saat lalu coba lagi.",
    resetBackLabel: "Kembali ke halaman masuk",
    resetCodeSentNotice: "Kode baru sudah diminta. Periksa email Anda.",
    resetConfirmPasswordLabel: "Ulangi kata sandi baru",
    resetDescription: "Jika email terdaftar, kode verifikasi sudah dikirim ke",
    resetNewPasswordLabel: "Kata sandi baru",
    resetNewPasswordPlaceholder: "Minimal 8 karakter",
    resetRequestDescription:
      "Masukkan email akun BHT Nexus Anda. Kami akan mengirim kode untuk membuat kata sandi baru.",
    resetRequestSubmitLabel: "Kirim kode",
    resetRequestTitle: "Atur ulang kata sandi",
    resetSendingLabel: "Mengirim kode…",
    resetSubmitLabel: "Simpan kata sandi dan masuk",
    resetTitle: "Buat kata sandi baru",
    stepBackLabel: "Gunakan akun lain",
    suspendedError: "Akun Anda dinonaktifkan. Hubungi pengelola BHT Nexus.",
    tooManyAttemptsError:
      "Kode sudah terlalu sering dicoba. Minta kode baru, lalu coba lagi.",
    totpDescription:
      "Akun ini memakai verifikasi dua langkah. Masukkan 6 digit kode dari aplikasi autentikator Anda.",
    totpLabel: "Kode autentikator",
    totpTitle: "Verifikasi dua langkah",
    unavailableError:
      "Layanan BHT Nexus belum dapat dihubungi. Coba lagi beberapa saat lagi.",
    verifyingLabel: "Memverifikasi…",
    passwordHideLabel: "Sembunyikan kata sandi",
    passwordLabel: "Kata sandi",
    passwordPlaceholder: "Masukkan kata sandi",
    passwordShowLabel: "Tampilkan kata sandi",
    platformName: "BHT Nexus",
    signInLabel: "Masuk",
    signingInLabel: "Membuka ruang kerja…",
    storyTagline: "One Data. One Platform. One Ecosystem.",
    switchLocaleHref: "/en/nexus/sign-in",
    unexpectedError: "Proses masuk gagal. Coba lagi.",
  },
  en: {
    backHref: "/en",
    backLabel: "Back to the CoE BHT website",
    backShortLabel: "CoE BHT website",
    emailLabel: "Email",
    emailPlaceholder: "name@telkomuniversity.ac.id",
    destinationHref: "/en/nexus",
    firstSignInHint:
      "Signing in for the first time? Enter the email you were invited with and create a new password here. A verification code will be sent to that email.",
    forgotPasswordLabel: "Forgot your password?",
    formDescription:
      "The digital workspace for CoE Biomedical & Healthcare Technology.",
    formTitle: "Sign in to BHT Nexus",
    helpHref: createWhatsAppHref(
      "Hello CoE BHT, I need help signing in to BHT Nexus.",
    ),
    helpLabel: "Need help signing in?",
    invalidCredentialsError: "Incorrect email or password.",
    invitationNote:
      "BHT Nexus accounts are created by invitation. Public registration is not available.",
    languageLabel: "Choose language",
    otpDescription:
      "This account is signing in for the first time. Enter the verification code sent to",
    otpPasswordNote:
      "Once the code is accepted, the password you just typed becomes your account password.",
    otpInvalidError:
      "The code does not match or has expired. Please try again.",
    otpLabel: "Verification code",
    otpResendLabel: "Send a new code",
    otpResentNotice: "A new code was requested. Please check your email.",
    otpSubmitLabel: "Verify and sign in",
    otpTitle: "Verify your email",
    passwordMismatchError: "The two new passwords do not match.",
    passwordTooShortError: "The new password needs at least 8 characters.",
    rateLimitedError: "Too many attempts. Please wait a moment and try again.",
    resetBackLabel: "Back to sign in",
    resetCodeSentNotice: "A new code was requested. Please check your email.",
    resetConfirmPasswordLabel: "Repeat the new password",
    resetDescription:
      "If the email is registered, a verification code was sent to",
    resetNewPasswordLabel: "New password",
    resetNewPasswordPlaceholder: "At least 8 characters",
    resetRequestDescription:
      "Enter your BHT Nexus account email. We will send a code to create a new password.",
    resetRequestSubmitLabel: "Send code",
    resetRequestTitle: "Reset your password",
    resetSendingLabel: "Sending code…",
    resetSubmitLabel: "Save password and sign in",
    resetTitle: "Create a new password",
    stepBackLabel: "Use another account",
    suspendedError:
      "Your account is deactivated. Please contact the BHT Nexus administrator.",
    tooManyAttemptsError:
      "This code was tried too many times. Request a new code and try again.",
    totpDescription:
      "This account uses two-step verification. Enter the 6-digit code from your authenticator app.",
    totpLabel: "Authenticator code",
    totpTitle: "Two-step verification",
    unavailableError:
      "The BHT Nexus service cannot be reached right now. Please try again shortly.",
    verifyingLabel: "Verifying…",
    passwordHideLabel: "Hide password",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    passwordShowLabel: "Show password",
    platformName: "BHT Nexus",
    signInLabel: "Sign in",
    signingInLabel: "Opening workspace…",
    storyTagline: "One Data. One Platform. One Ecosystem.",
    switchLocaleHref: "/nexus/masuk",
    unexpectedError: "Sign-in failed. Please try again.",
  },
} satisfies Record<Locale, NexusLoginContent>;

export function getNexusLoginContent(locale: Locale): NexusLoginContent {
  return nexusLoginContent[locale];
}
