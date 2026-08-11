"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import styles from "./auth.module.css";

/**
 * Submit button that disables itself while its parent form is in flight.
 * Must be rendered inside the <form> for useFormStatus to see it — that's also
 * what stops double submissions.
 */
export function SubmitButton({
  children,
  pendingLabel = "Just a moment…",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? (
        <>
          <Loader2 size={17} className="animate-spin" aria-hidden="true" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
