"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { updatePassword } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/validation/auth";
import { FormAlert } from "./FormAlert";
import { PasswordField } from "./PasswordField";
import { SubmitButton } from "./SubmitButton";
import styles from "./auth.module.css";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    updatePassword,
    undefined
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <>
      <FormAlert tone="error">{state?.errors?.form?.[0]}</FormAlert>

      <form action={formAction} className={styles.form} noValidate>
        <PasswordField
          name="password"
          label="New password"
          value={password}
          onChange={setPassword}
          errors={state?.errors?.password}
          autoComplete="new-password"
          showStrength
        />

        <PasswordField
          name="confirmPassword"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          errors={state?.errors?.confirmPassword}
          autoComplete="new-password"
        />

        <SubmitButton pendingLabel="Updating password…">
          Update password <ShieldCheck size={16} />
        </SubmitButton>
      </form>

      <p className={styles.footNote}>
        Changed your mind? <Link href="/account">Back to your profile</Link>
      </p>
    </>
  );
}
