"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { signup } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/validation/auth";
import { FieldError, FormAlert } from "./FormAlert";
import { PasswordField } from "./PasswordField";
import { SubmitButton } from "./SubmitButton";
import { GoogleButton } from "./GoogleButton";
import styles from "./auth.module.css";

export function SignupForm({ next = "/account" }: { next?: string }) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(signup, undefined);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const nameId = useId();
  const emailId = useId();

  // Signup succeeded — the account exists but needs email confirmation, so
  // there's nothing left to fill in. Swap the form for the next step.
  if (state?.success) {
    return (
      <>
        <FormAlert tone="success">{state.message}</FormAlert>
        <p className={styles.footNote} style={{ marginTop: 20 }}>
          Didn&apos;t get it? Check your spam folder, or{" "}
          <Link href="/signup">try a different email</Link>.
        </p>
        <p className={styles.footNote}>
          Already confirmed? <Link href="/login">Sign in</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <FormAlert tone="error">{state?.errors?.form?.[0]}</FormAlert>

      <GoogleButton next={next} />

      <div className={styles.divider}>or</div>

      <form action={formAction} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={nameId}>
            Full name
          </label>
          <input
            id={nameId}
            name="fullName"
            type="text"
            className={styles.input}
            placeholder="Ada Lovelace"
            autoComplete="name"
            aria-invalid={state?.errors?.fullName ? true : undefined}
            aria-describedby={state?.errors?.fullName ? `${nameId}-error` : undefined}
            required
          />
          <FieldError id={`${nameId}-error`} messages={state?.errors?.fullName} />
        </div>

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
          />
          <FieldError id={`${emailId}-error`} messages={state?.errors?.email} />
        </div>

        <PasswordField
          name="password"
          label="Password"
          value={password}
          onChange={setPassword}
          errors={state?.errors?.password}
          autoComplete="new-password"
          showStrength
        />

        <PasswordField
          name="confirmPassword"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          errors={state?.errors?.confirmPassword}
          autoComplete="new-password"
        />

        <SubmitButton pendingLabel="Creating your account…">
          Create account <ArrowRight size={17} />
        </SubmitButton>
      </form>

      <p className={styles.legal}>
        By creating an account you agree to Sproutt&apos;s Terms and Privacy Policy.
      </p>

      <p className={styles.footNote}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
