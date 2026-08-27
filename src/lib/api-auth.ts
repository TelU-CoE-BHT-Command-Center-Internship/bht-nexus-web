import { apiFetch } from "@/lib/api-client";

export type ApiSessionUser = Record<string, unknown>;
export type ApiSession = Record<string, unknown>;

export type OtpPurpose =
  | "change-email"
  | "email-verification"
  | "forget-password"
  | "sign-in";

export function fetchActiveSession(): Promise<{
  user: ApiSessionUser;
  session: ApiSession;
}> {
  return apiFetch("/auth/me");
}

export function signInWithEmail(input: {
  email: string;
  password: string;
}): Promise<{
  redirect: boolean;
  token: string;
  url?: string;
  user: ApiSessionUser;
}> {
  return apiFetch("/auth/sign-in/email", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function signUpWithEmail(input: {
  email: string;
  name: string;
  password: string;
  phoneNumber?: string;
}): Promise<{ token: string | null; user: ApiSessionUser }> {
  return apiFetch("/auth/sign-up/email", {
    body: JSON.stringify({
      email: input.email,
      name: input.name,
      password: input.password,
      phone_number: input.phoneNumber,
    }),
    method: "POST",
  });
}

export function signOut(): Promise<void> {
  return apiFetch("/auth/sign-out", { method: "POST" });
}

export function requestPasswordResetOtp(email: string): Promise<void> {
  return apiFetch("/auth/email-otp/request-password-reset", {
    body: JSON.stringify({ email }),
    method: "POST",
  });
}

export function resetPasswordWithOtp(input: {
  email: string;
  otp: string;
  password: string;
}): Promise<void> {
  return apiFetch("/auth/email-otp/reset-password", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function sendVerificationOtp(
  email: string,
  type: OtpPurpose = "email-verification",
): Promise<void> {
  return apiFetch("/auth/email-otp/send-verification-otp", {
    body: JSON.stringify({ email, type }),
    method: "POST",
  });
}

export function verifyEmailWithOtp(input: {
  email: string;
  otp: string;
}): Promise<void> {
  return apiFetch("/auth/email-otp/verify-email", {
    body: JSON.stringify(input),
    method: "POST",
  });
}
