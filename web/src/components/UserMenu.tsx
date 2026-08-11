"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Sprout, User as UserIcon } from "lucide-react";

import { useSprouttUser } from "@/lib/hooks/useSprouttUser";
import { signOut } from "@/app/actions/auth";
import styles from "./UserMenu.module.css";

function initialsOf(name: string | null, email: string | undefined) {
  const source = name?.trim() || email?.split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
}

function Avatar({
  url,
  name,
  email,
  className,
}: {
  url: string | null;
  name: string | null;
  email?: string;
  className: string;
}) {
  const [broken, setBroken] = useState(false);

  if (url && !broken) {
    return (
      // Google avatar URLs live on an external host; a plain <img> avoids
      // configuring remotePatterns for next/image just for this.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={className}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span className={className} aria-hidden="true">
      {initialsOf(name, email)}
    </span>
  );
}

/**
 * Top-right profile widget: sign-in button when signed out, avatar + tree
 * contribution when signed in.
 */
export function UserMenu() {
  const { user, loading, displayName, avatarUrl, impact, trees } = useSprouttUser();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (loading) {
    return <div className={styles.skeleton} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <Link href="/login" className={styles.signInBtn}>
          <UserIcon size={16} /> Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        /* The name is no longer visible, so it has to live here instead —
           otherwise a screen reader announces only a bare number. */
        aria-label={`Account menu — ${displayName ?? "your account"}, ${trees} ${
          trees === 1 ? "tree" : "trees"
        } funded`}
      >
        <Avatar
          url={avatarUrl}
          name={displayName}
          email={user.email}
          className={styles.avatar}
        />
        {/* Name intentionally omitted — the avatar identifies you, and the
            contribution is the number worth showing. */}
        <span className={styles.triggerTrees}>
          <Sprout size={15} className={styles.triggerSprout} aria-hidden="true" />
          <span className={styles.triggerCount}>{trees.toLocaleString()}</span>
          <span className={styles.triggerUnit}>
            {trees === 1 ? "tree" : "trees"}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownHeader}>
            <Avatar
              url={avatarUrl}
              name={displayName}
              email={user.email}
              className={styles.dropdownAvatar}
            />
            <div className={styles.dropdownIdentity}>
              <div className={styles.dropdownName}>{displayName}</div>
              <div className={styles.dropdownEmail}>{user.email}</div>
            </div>
          </div>

          <div className={styles.impactCard}>
            <div className={styles.impactLabel}>Your contribution</div>
            <div className={styles.impactValue}>
              <span className={styles.impactNumber}>{trees.toLocaleString()}</span>
              <span className={styles.impactUnit}>
                {trees === 1 ? "tree planted" : "trees planted"}
              </span>
            </div>

            {impact.orders_count > 0 ? (
              <div className={styles.impactSub}>
                <span>
                  {impact.orders_count} {impact.orders_count === 1 ? "order" : "orders"}
                </span>
                <span>
                  {impact.products_count}{" "}
                  {impact.products_count === 1 ? "item" : "items"}
                </span>
              </div>
            ) : (
              <p className={styles.impactEmpty}>
                No orders yet — every product you buy funds a set number of trees.
              </p>
            )}
          </div>

          <Link
            href="/account"
            className={styles.menuItem}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Sprout size={16} /> My forest &amp; orders
          </Link>

          <div className={styles.separator} />

          <form action={signOut}>
            <button
              type="submit"
              className={`${styles.menuItem} ${styles.menuItemDanger}`}
              role="menuitem"
            >
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
