import * as z from "zod";

/**
 * Password rules. Enforced on the server (Server Actions) — the client-side
 * strength meter uses the same helpers purely for live feedback.
 *
 * Also turn on "Leaked password protection" in the Supabase dashboard
 * (Authentication -> Policies) so Supabase additionally rejects passwords
 * found in known breach corpora.
 */
export const MIN_PASSWORD_LENGTH = 10;

/** Rejected outright regardless of shape — these clear the regexes but are guessed instantly. */
const OBVIOUS_PASSWORDS = new Set([
  "password1!",
  "password123",
  "passw0rd!23",
  "qwerty123!",
  "welcome123!",
  "admin12345!",
  "letmein123!",
  "iloveyou12!",
  "sproutt123!",
]);

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
  .max(72, "Passwords can be at most 72 characters.")
  .regex(/[a-z]/, "Add at least one lowercase letter.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[0-9]/, "Add at least one number.")
  .regex(/[^a-zA-Z0-9]/, "Add at least one symbol.")
  .refine((v) => !/(.)\1{2,}/.test(v), "Avoid repeating a character 3+ times.")
  .refine(
    (v) => !OBVIOUS_PASSWORDS.has(v.toLowerCase()),
    "That password is too common. Pick something less guessable."
  );

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Tell us your name (2+ characters).")
      .max(80, "That name is a little too long."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      !data.password.toLowerCase().includes(data.email.split("@")[0].slice(0, 6)),
    { message: "Your password shouldn't contain your email name.", path: ["password"] }
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

/** Live strength feedback for the signup form. Not a security control. */
export function passwordChecks(password: string) {
  return [
    { label: `${MIN_PASSWORD_LENGTH}+ characters`, ok: password.length >= MIN_PASSWORD_LENGTH },
    { label: "Lowercase letter", ok: /[a-z]/.test(password) },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Symbol", ok: /[^a-zA-Z0-9]/.test(password) },
  ];
}

export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  const passed = passwordChecks(password).filter((c) => c.ok).length;
  const bonus = password.length >= 16 ? 1 : 0;
  return Math.min(4, Math.max(0, passed - 1 + bonus)) as 0 | 1 | 2 | 3 | 4;
}

/** Shape returned by every auth Server Action, consumed via useActionState. */
export type AuthFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | undefined;

/** Flatten a ZodError into the field-keyed shape the forms render. */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const flattened: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (flattened[key] ??= []).push(issue.message);
  }
  return flattened;
}
