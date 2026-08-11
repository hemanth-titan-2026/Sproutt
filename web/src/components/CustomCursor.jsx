"use client";

import { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.css";

/**
 * The sprout cursor.
 *
 * Why it's built this way:
 *
 *  - The sprite sits at the raw pointer position with NO smoothing. Easing the
 *    position is what makes custom cursors feel laggy — the pointer is where
 *    the user put it, so that's where the sprite goes.
 *  - Only the *tilt* is eased. It leans toward the direction of travel and
 *    settles back upright, which reads as fluid without delaying the tip.
 *  - A separate halo DOES trail behind. Motion feel comes from that, not from
 *    slowing the cursor itself.
 *  - Everything is written as CSS custom properties on a `will-change:
 *    transform` layer, so each frame is a compositor-only update.
 */

const MAX_TILT = 26; // degrees at full speed
const SPEED_AT_MAX_TILT = 26; // px/frame that maps to MAX_TILT
const TILT_EASE = 0.16; // how quickly the lean follows direction
const TILT_RETURN = 0.09; // how quickly it settles upright when idle
const HALO_EASE = 0.22; // trailing halo catch-up

const INTERACTIVE = 'a,button,summary,select,label,[role="button"],[role="menuitem"],input,textarea';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const haloRef = useRef(null);

  useEffect(() => {
    // Respect both the OS motion preference and pointer type.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    const cursor = cursorRef.current;
    const halo = haloRef.current;
    if (!cursor || !halo) return;

    // Hide the native cursor only once ours is actually running, so a JS
    // failure leaves the CSS fallback cursor in place rather than nothing.
    document.documentElement.classList.add("sproutt-cursor-active");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let prevX = x;
    let prevY = y;
    let haloX = x;
    let haloY = y;
    let tilt = 0;
    let targetTilt = 0;
    let visible = false;
    let raf = 0;

    const onMove = (event) => {
      x = event.clientX;
      y = event.clientY;

      if (!visible) {
        visible = true;
        cursor.classList.add(styles.visible);
        halo.classList.add(styles.haloVisible);
      }
    };

    const onEnter = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(INTERACTIVE)) {
        cursor.classList.add(styles.interactive);
      }
    };

    const onOut = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(INTERACTIVE)) {
        cursor.classList.remove(styles.interactive);
      }
    };

    const onDown = () => cursor.classList.add(styles.pressed);
    const onUp = () => cursor.classList.remove(styles.pressed);

    const onLeaveWindow = () => {
      visible = false;
      cursor.classList.remove(styles.visible);
      halo.classList.remove(styles.haloVisible);
    };

    const frame = () => {
      const dx = x - prevX;
      const dy = y - prevY;
      prevX = x;
      prevY = y;

      // Lean into horizontal travel: right → tilt right, left → tilt left.
      // Vertical speed contributes a little so diagonal flicks feel alive.
      const speed = Math.min(1, Math.hypot(dx, dy) / SPEED_AT_MAX_TILT);
      const direction = Math.abs(dx) < 0.25 ? 0 : Math.sign(dx);
      targetTilt = direction * MAX_TILT * speed;

      // Ease toward the lean quickly, drift back upright more gently.
      tilt += (targetTilt - tilt) * (direction === 0 ? TILT_RETURN : TILT_EASE);

      haloX += (x - haloX) * HALO_EASE;
      haloY += (y - haloY) * HALO_EASE;

      // Sprite is centred on the pointer; the seed body sits under the tip.
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -46%)`;
      cursor.style.setProperty("--cursor-tilt", `${tilt.toFixed(2)}deg`);
      halo.style.transform = `translate3d(${haloX.toFixed(2)}px, ${haloY.toFixed(2)}px, 0)`;

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    // passive: these never preventDefault, so the browser can skip the check.
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerover", onEnter, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    document.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerover", onEnter);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("mouseleave", onLeaveWindow);
      document.documentElement.classList.remove("sproutt-cursor-active");
    };
  }, []);

  return (
    <>
      <div ref={haloRef} className={styles.halo} aria-hidden="true" />
      <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
        <div className={styles.sprite} />
      </div>
    </>
  );
}
