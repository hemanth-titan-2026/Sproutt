"use client";

import { useActionState, useId } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

import { requestPasswordReset } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/validation/auth";
import { FieldError, FormAlert } from "./FormAlert";
import { SubmitButton } from "./SubmitButton";
import styles from "./auth.module.css";

export function ForgotPasswordForm({ initialError }: { initialError?: string }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    requestPasswordReset,
    undefined
  );
  const emailId = useId();

  if (state?.success) {
    return (
      <>
        <FormAlert tone="success">{state.message}</FormAlert>
        <p className={styles.footNote} style={{ marginTop: 20 }}>
          <Link href="/login">Back to sign in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <FormAlert tone="error">{state?.errors?.form?.[0] ?? initialError}</FormAlert>

      <form action={formAction} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={emailId}>
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            className={styles.input}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={state?.errors?.email ? true : undefined}
            aria-describedby={state?.errors?.email ? `${emailId}-error` : undefined}
            required
            autoFocus
          />
          <FieldError id={`${emailId}-error`} messages={state?.errors?.email} />
        </div>

        <SubmitButton pendingLabel="Sending link…">
          Send reset link <Send size={16} />
        </SubmitButton>
      </form>

      <p className={styles.footNote}>
        Remembered it? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
