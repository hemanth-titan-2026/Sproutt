"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./CanvasSequence.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FRAME_COUNT = 280;
const FRAME_PREFIX = "/images/sequence/ezgif-frame-";
const FRAME_SUFFIX = ".png";

function pad(number) {
  return number.toString().padStart(3, "0");
}

export default function CanvasSequence() {
  const canvasRef = useRef(null);
  const loaderRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const frames = new Array(FRAME_COUNT).fill(null);
    let imagesLoaded = 0;
    let animationStarted = false;
    let sequence = { frame: 0 };
    let lastDrawnFrame = -1;

    const updateDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    const drawImageProp = (ctx, img, x, y, w, h, offsetX, offsetY) => {
      if (!img) return;
      if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
      }
      offsetX = typeof offsetX === "number" ? offsetX : 0.5;
      offsetY = typeof offsetY === "number" ? offsetY : 0.5;
      if (offsetX < 0) offsetX = 0;
      if (offsetY < 0) offsetY = 0;
      if (offsetX > 1) offsetX = 1;
      if (offsetY > 1) offsetY = 1;

      let iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,
        nh = ih * r,
        cx, cy, cw, ch, ar = 1;

      if (nw < w) ar = w / nw;
      if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
      nw *= ar;
      nh *= ar;

      cw = iw / (nw / w);
      ch = ih / (nh / h);

      cx = (iw - cw) * offsetX;
      cy = (ih - ch) * offsetY;

      if (cx < 0) cx = 0;
      if (cy < 0) cy = 0;
      if (cw > iw) cw = iw;
      if (ch > ih) ch = ih;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    };

    const fadeOutLoader = () => {
      if (loaderRef.current) {
        gsap.to(loaderRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            if (loaderRef.current) loaderRef.current.style.display = "none";
          },
        });
      }
    };

    // Draw the closest available frame to the requested one
    const drawClosestFrame = () => {
      const targetFrame = Math.round(sequence.frame);
      // Try the exact frame first
      if (frames[targetFrame]) {
        if (lastDrawnFrame !== targetFrame) {
          drawImageProp(context, frames[targetFrame]);
          lastDrawnFrame = targetFrame;
        }
        return;
      }
      // Fall back to nearest loaded frame
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        if (targetFrame - offset >= 0 && frames[targetFrame - offset]) {
          drawImageProp(context, frames[targetFrame - offset]);
          lastDrawnFrame = targetFrame - offset;
          return;
        }
        if (targetFrame + offset < FRAME_COUNT && frames[targetFrame + offset]) {
          drawImageProp(context, frames[targetFrame + offset]);
          lastDrawnFrame = targetFrame + offset;
          return;
        }
      }
    };

    const initAnimation = () => {
      if (animationStarted) return;
      animationStarted = true;

      gsap.to(sequence, {
        frame: FRAME_COUNT - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
        onUpdate: drawClosestFrame,
      });

      window.addEventListener("resize", () => {
        if (frames[Math.round(sequence.frame)]) {
          drawImageProp(context, frames[Math.round(sequence.frame)]);
        }
      });
    };

    // Load frames in batches — first 30 fast (for quick scroll response),
    // then the rest fills in
    const loadFrame = (i) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `${FRAME_PREFIX}${pad(i)}${FRAME_SUFFIX}`;
        img.onload = () => {
          frames[i - 1] = img;
          imagesLoaded++;
          setProgress(Math.round((imagesLoaded / FRAME_COUNT) * 100));
          resolve();
        };
        img.onerror = () => {
          imagesLoaded++;
          resolve();
        };
      });
    };

    const loadSequence = async () => {
      // Load frame 1 first — show it immediately
      await loadFrame(1);
      drawImageProp(context, frames[0]);
      fadeOutLoader();
      initAnimation();

      // Load frames 2-30 quickly (parallel batch) for fast scroll feedback
      const firstBatch = [];
      for (let i = 2; i <= 30; i++) {
        firstBatch.push(loadFrame(i));
      }
      await Promise.all(firstBatch);

      // Load remaining frames in small parallel batches
      const BATCH_SIZE = 10;
      for (let start = 31; start <= FRAME_COUNT; start += BATCH_SIZE) {
        const batch = [];
        for (let i = start; i < Math.min(start + BATCH_SIZE, FRAME_COUNT + 1); i++) {
          batch.push(loadFrame(i));
        }
        await Promise.all(batch);
      }
    };

    loadSequence();

    return () => {
      window.removeEventListener("resize", updateDimensions);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <>
      <div ref={loaderRef} className={styles.loader}>
        <div className={styles.loaderText}>Planting Seed... {progress}%</div>
      </div>
      <div className={styles.fixedContainer}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </>
  );
}
