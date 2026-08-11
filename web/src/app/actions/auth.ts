"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import {
  fieldErrors,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  type AuthFormState,
} from "@/lib/validation/auth";

/**
 * Auth Server Actions.
 *
 * Everything is validated server-side — the browser-side checks are only there
 * to give fast feedback. Error copy is deliberately generic on login and
 * password reset so an attacker can't use the form to discover which email
 * addresses have accounts.
 */

/** Only allow relative, single-slash paths as post-login redirects (open-redirect guard). */
function safeNext(next: unknown): string {
  if (typeof next !== "string") return "/account";
  if (!next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { fullName, email, password } = parsed.data;
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // full_name is picked up by the handle_new_user() trigger to seed the profile.
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/account`,
    },
  });

  if (error) {
    return { errors: { form: [error.message] } };
  }

  // Supabase returns a decoy user with an empty identities array when the email
  // is already registered. Show the same message either way so the form can't
  // be used to enumerate accounts — the real owner gets an email, nobody else
  // learns anything.
  const alreadyRegistered = data.user && data.user.identities?.length === 0;

  return {
    success: true,
    message: alreadyRegistered
      ? `If ${email} doesn't already have an account, we've sent a confirmation link. Check your inbox.`
      : `We've sent a confirmation link to ${email}. Click it to activate your account.`,
  };
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.toLowerCase().includes("not confirmed")) {
      return {
        errors: {
          form: ["Please confirm your email first — check your inbox for the link."],
        },
      };
    }
    // Deliberately generic: never reveal whether the email exists.
    return { errors: { form: ["Incorrect email or password."] } };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next")));
}

export async function requestPasswordReset(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  // The recovery link lands on /auth/confirm, which verifies the token and
  // forwards to /reset-password with a short-lived session attached.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });

  // Always report success, even for unknown addresses — same anti-enumeration
  // reasoning as signup. Supabase rate-limits these emails per address.
  return {
    success: true,
    message: `If an account exists for ${parsed.data.email}, a reset link is on its way. The link expires in 1 hour.`,
  };
}

export async function updatePassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();

  // The recovery link already signed this user in; without a session there's
  // nothing to update, which is what stops a stranger hitting /reset-password
  // directly from changing someone's password.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      errors: {
        form: ["This reset link has expired or was already used. Request a new one."],
      },
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { errors: { form: [error.message] } };
  }

  revalidatePath("/", "layout");
  redirect("/account?updated=password");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Kicks off Google OAuth. Returns the provider URL rather than redirecting
 * here, so the caller can send the browser there itself.
 */
export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const next = safeNext(formData.get("next"));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent("Could not reach Google. Try again.")}`);
  }

  redirect(data.url);
}
