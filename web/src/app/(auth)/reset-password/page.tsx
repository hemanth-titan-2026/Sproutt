import Link from "next/link";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { FormAlert } from "@/components/auth/FormAlert";
import styles from "@/components/auth/auth.module.css";

export const metadata: Metadata = {
  title: "Set a new password | Sproutt",
};

/**
 * Reached from the emailed recovery link, which passes through /auth/confirm
 * and leaves a short-lived session behind. No session means the link expired,
 * was already used, or someone navigated here directly — all of which get the
 * same "request a new link" dead end.
 */
export default async function ResetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <h1 className={styles.title}>Link expired</h1>
        <p className={styles.subtitle}>
          Password reset links can only be used once, and expire an hour after
          they&apos;re sent.
        </p>
        <div style={{ marginTop: 24 }}>
          <FormAlert tone="error">
            We couldn&apos;t verify this reset link. Request a fresh one and try
            again.
          </FormAlert>
        </div>
        <p className={styles.footNote} style={{ marginTop: 20 }}>
          <Link href="/forgot-password">Send a new reset link</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className={styles.title}>Set a new password</h1>
      <p className={styles.subtitle}>
        Choose a new password for <strong>{user.email}</strong>. You&apos;ll stay
        signed in on this device.
      </p>

      <div style={{ marginTop: 26 }}>
        <ResetPasswordForm />
      </div>
    </>
  );
}
