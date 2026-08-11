import { AlertCircle, CheckCircle2 } from "lucide-react";
import styles from "./auth.module.css";

export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  if (!children) return null;

  const Icon = tone === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`${styles.alert} ${tone === "error" ? styles.alertError : styles.alertSuccess}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon size={17} className={styles.alertIcon} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/** Per-field validation message. Wired to the input via aria-describedby. */
export function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className={styles.fieldError} id={id}>
      {messages[0]}
    </p>
  );
}
