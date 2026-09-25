import type { Locale } from "@/i18n/locales";

/**
 * Aktivasi akun undangan dan pemulihan kata sandi memakai kontrak layanan yang
 * sama: kode verifikasi dikirim ke email, lalu kata sandi dibuat dengan kode
 * tersebut. Keduanya hanya berbeda pada kalimat yang dibaca pengguna.
 */
export type NexusPasswordRecoveryMode = "activation" | "reset";

export type NexusPasswordRecoveryContent = {
  alternateHref: string;
  alternateLabel: string;
  codeHint: string;
  codeLabel: string;
  codeSentDescription: string;
  codeSentTitle: string;
  confirmPasswordLabel: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  footnote: string;
  newPasswordLabel: string;
  passwordHideLabel: string;
  passwordLengthRule: string;
  passwordMismatch: string;
  passwordShowLabel: string;
  requestLabel: string;
  requestingLabel: string;
  resendCooldownLabel: string;
  resendLabel: string;
  resendingLabel: string;
  resentNotice: string;
  signInHref: string;
  signInLabel: string;
  submitLabel: string;
  submittingLabel: string;
  successDescription: string;
  successTitle: string;
  switchLocaleHref: string;
  title: string;
  useAnotherEmailLabel: string;
  validation: {
    codeFormat: string;
    emailFormat: string;
    emailRequired: string;
    passwordRequired: string;
  };
};

const shared = {
  en: {
    codeHint: "Enter the 6-digit code. It is valid for 5 minutes.",
    codeLabel: "Verification code",
    codeSentTitle: "Check your email",
    confirmPasswordLabel: "Confirm new password",
    emailLabel: "Email",
    emailPlaceholder: "name@telkomuniversity.ac.id",
    newPasswordLabel: "New password",
    passwordHideLabel: "Hide password",
    passwordLengthRule: "At least 8 characters",
    passwordMismatch: "The passwords do not match.",
    passwordShowLabel: "Show password",
    requestLabel: "Send verification code",
    requestingLabel: "Sending code…",
    resendCooldownLabel: "Resend code in {seconds} seconds",
    resendLabel: "Resend code",
    resendingLabel: "Sending code…",
    resentNotice: "If the email is registered, a new code has been sent.",
    signInHref: "/en/nexus/sign-in",
    signInLabel: "Go to sign-in",
    submittingLabel: "Saving…",
    useAnotherEmailLabel: "Use a different email",
    validation: {
      codeFormat: "Enter the 6-digit code.",
      emailFormat: "Enter a valid email address.",
      emailRequired: "Enter your email.",
      passwordRequired: "Enter a new password.",
    },
  },
  id: {
    codeHint: "Masukkan 6 digit kode. Kode berlaku 5 menit.",
    codeLabel: "Kode verifikasi",
    codeSentTitle: "Periksa email Anda",
    confirmPasswordLabel: "Ulangi kata sandi baru",
    emailLabel: "Email",
    emailPlaceholder: "nama@telkomuniversity.ac.id",
    newPasswordLabel: "Kata sandi baru",
    passwordHideLabel: "Sembunyikan kata sandi",
    passwordLengthRule: "Minimal 8 karakter",
    passwordMismatch: "Kedua kata sandi belum sama.",
    passwordShowLabel: "Tampilkan kata sandi",
    requestLabel: "Kirim kode verifikasi",
    requestingLabel: "Mengirim kode…",
    resendCooldownLabel: "Kirim ulang kode dalam {seconds} detik",
    resendLabel: "Kirim ulang kode",
    resendingLabel: "Mengirim kode…",
    resentNotice: "Jika email terdaftar, kode baru sudah dikirim.",
    signInHref: "/nexus/masuk",
    signInLabel: "Ke halaman masuk",
    submittingLabel: "Menyimpan…",
    useAnotherEmailLabel: "Gunakan email lain",
    validation: {
      codeFormat: "Masukkan 6 digit kode.",
      emailFormat: "Gunakan alamat email yang valid.",
      emailRequired: "Email wajib diisi.",
      passwordRequired: "Kata sandi baru wajib diisi.",
    },
  },
} as const;

const byMode = {
  activation: {
    en: {
      alternateHref: "/en/nexus/forgot-password",
      alternateLabel: "Already activated? Reset your password",
      codeSentDescription:
        "If {email} belongs to an invited BHT Nexus account, we sent a 6-digit code to it. Use the code to create your password.",
      description:
        "Accounts are created by the BHT Nexus administrator. Enter your invited email to receive a code and create your password.",
      footnote:
        "Did not receive an invitation? Contact the BHT Nexus administrator.",
      submitLabel: "Activate account",
      successDescription:
        "Your password has been created. Sign in with your email and new password.",
      successTitle: "Your account is ready",
      switchLocaleHref: "/nexus/aktivasi",
      title: "Activate your account",
    },
    id: {
      alternateHref: "/nexus/lupa-kata-sandi",
      alternateLabel: "Sudah aktif? Atur ulang kata sandi",
      codeSentDescription:
        "Jika {email} terdaftar sebagai akun undangan BHT Nexus, kode 6 digit sudah dikirim ke email tersebut. Gunakan kode itu untuk membuat kata sandi.",
      description:
        "Akun dibuat oleh pengelola BHT Nexus. Masukkan email undangan Anda untuk menerima kode dan membuat kata sandi.",
      footnote: "Belum menerima undangan? Hubungi pengelola BHT Nexus.",
      submitLabel: "Aktifkan akun",
      successDescription:
        "Kata sandi Anda sudah dibuat. Masuk dengan email dan kata sandi baru.",
      successTitle: "Akun Anda siap digunakan",
      switchLocaleHref: "/en/nexus/activate",
      title: "Aktifkan akun",
    },
  },
  reset: {
    en: {
      alternateHref: "/en/nexus/activate",
      alternateLabel: "New invited account? Activate it",
      codeSentDescription:
        "If {email} is registered, we sent a 6-digit code to it. Use the code to set a new password.",
      description:
        "Enter the email of your BHT Nexus account to receive a code for setting a new password.",
      footnote:
        "For security, this page never reveals whether an email is registered.",
      submitLabel: "Save new password",
      successDescription:
        "Your password has been updated. Sign in again with your new password.",
      successTitle: "Password updated",
      switchLocaleHref: "/nexus/lupa-kata-sandi",
      title: "Reset your password",
    },
    id: {
      alternateHref: "/nexus/aktivasi",
      alternateLabel: "Akun undangan baru? Aktifkan akun",
      codeSentDescription:
        "Jika {email} terdaftar, kode 6 digit sudah dikirim ke email tersebut. Gunakan kode itu untuk membuat kata sandi baru.",
      description:
        "Masukkan email akun BHT Nexus Anda untuk menerima kode pembuatan kata sandi baru.",
      footnote:
        "Demi keamanan, halaman ini tidak pernah menyatakan apakah sebuah email terdaftar.",
      submitLabel: "Simpan kata sandi baru",
      successDescription:
        "Kata sandi Anda sudah diperbarui. Masuk kembali dengan kata sandi baru.",
      successTitle: "Kata sandi diperbarui",
      switchLocaleHref: "/en/nexus/forgot-password",
      title: "Atur ulang kata sandi",
    },
  },
} as const;

export function getNexusPasswordRecoveryContent(
  mode: NexusPasswordRecoveryMode,
  locale: Locale,
): NexusPasswordRecoveryContent {
  return { ...shared[locale], ...byMode[mode][locale] };
}
