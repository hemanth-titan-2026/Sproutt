"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { login } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/validation/auth";
import { FieldError, FormAlert } from "./FormAlert";
import { PasswordField } from "./PasswordField";
import { SubmitButton } from "./SubmitButton";
import { GoogleButton } from "./GoogleButton";
import styles from "./auth.module.css";

export function LoginForm({
  next = "/account",
  initialError,
}: {
  next?: string;
  initialError?: string;
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(login, undefined);
  const [password, setPassword] = useState("");
  const emailId = useId();

  return (
    <>
      <FormAlert tone="error">{state?.errors?.form?.[0] ?? initialError}</FormAlert>

      <GoogleButton next={next} />

      <div className={styles.divider}>or</div>

      <form action={formAction} className={styles.form} noValidate>
        <input type="hidden" name="next" value={next} />

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

        <div>
          <PasswordField
            name="password"
            label="Password"
            value={password}
            onChange={setPassword}
            errors={state?.errors?.password}
            autoComplete="current-password"
          />
          <div className={styles.rowBetween} style={{ marginTop: 8, justifyContent: "flex-end" }}>
            <Link href="/forgot-password" className={styles.inlineLink}>
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton pendingLabel="Signing you in…">
          Sign in <ArrowRight size={17} />
        </SubmitButton>
      </form>

      <p className={styles.footNote}>
        New to Sproutt? <Link href="/signup">Create an account</Link>
      </p>
    </>
  );
}
