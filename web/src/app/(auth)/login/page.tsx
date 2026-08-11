import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";
import styles from "@/components/auth/auth.module.css";

export const metadata: Metadata = {
  title: "Sign in | Sproutt",
  description: "Sign in to track the trees your Sproutt orders have funded.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/account";

  return (
    <>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={15} /> Back to Sproutt
      </Link>

      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>
        Sign in to see your forest and the impact of every order.
      </p>

      <div style={{ marginTop: 26 }}>
        <LoginForm next={next} initialError={params.error} />
      </div>
    </>
  );
}
