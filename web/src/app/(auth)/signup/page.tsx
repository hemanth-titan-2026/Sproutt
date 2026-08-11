import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { SignupForm } from "@/components/auth/SignupForm";
import styles from "@/components/auth/auth.module.css";

export const metadata: Metadata = {
  title: "Create your account | Sproutt",
  description: "Join Sproutt and start growing your own forest with every order.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
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

      <h1 className={styles.title}>Start growing</h1>
      <p className={styles.subtitle}>
        Create your account — every order you place adds trees to your forest.
      </p>

      <div style={{ marginTop: 26 }}>
        <SignupForm next={next} />
      </div>
    </>
  );
}
