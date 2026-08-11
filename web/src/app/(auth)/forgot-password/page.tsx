import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import styles from "@/components/auth/auth.module.css";

export const metadata: Metadata = {
  title: "Reset your password | Sproutt",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <Link href="/login" className={styles.backLink}>
        <ArrowLeft size={15} /> Back to sign in
      </Link>

      <h1 className={styles.title}>Forgot your password?</h1>
      <p className={styles.subtitle}>
        Enter the email you signed up with and we&apos;ll send you a link to set a
        new password. The link works once and expires after an hour.
      </p>

      <div style={{ marginTop: 26 }}>
        <ForgotPasswordForm initialError={params.error} />
      </div>
    </>
  );
}
