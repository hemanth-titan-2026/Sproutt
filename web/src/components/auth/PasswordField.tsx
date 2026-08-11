"use client";

import { useId, useState } from "react";
import { Check, Eye, EyeOff, Minus } from "lucide-react";

import { passwordChecks, passwordStrength } from "@/lib/validation/auth";
import { FieldError } from "./FormAlert";
import styles from "./auth.module.css";

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"] as const;

export function PasswordField({
  name,
  label,
  value,
  onChange,
  errors,
  autoComplete = "current-password",
  placeholder = "••••••••••",
  showStrength = false,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
  autoComplete?: string;
  placeholder?: string;
  showStrength?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const strength = passwordStrength(value);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>

      <div className={styles.inputWrap}>
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          className={`${styles.input} ${styles.hasToggle}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={errors?.length ? errorId : undefined}
          required
        />
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      <FieldError id={errorId} messages={errors} />

      {showStrength && value.length > 0 && (
        <div className={styles.strength}>
          <div className={styles.strengthBars} aria-hidden="true">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`${styles.strengthBar} ${
                  strength >= step
                    ? styles[`strengthBarOn${strength}` as keyof typeof styles]
                    : ""
                }`}
              />
            ))}
          </div>
          <p className={styles.strengthLabel} aria-live="polite">
            Password strength: <strong>{STRENGTH_LABELS[strength] || "Too short"}</strong>
          </p>
          <ul className={styles.checks}>
            {passwordChecks(value).map((check) => (
              <li
                key={check.label}
                className={`${styles.check} ${check.ok ? styles.checkOk : ""}`}
              >
                {check.ok ? (
                  <Check size={13} aria-hidden="true" />
                ) : (
                  <Minus size={13} aria-hidden="true" />
                )}
                {check.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
