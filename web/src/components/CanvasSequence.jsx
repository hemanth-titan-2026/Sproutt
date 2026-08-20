"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    // Store loaded images — null means not yet loaded
    const frames = new Array(FRAME_COUNT).fill(null);
    let sequence = { frame: 0 };

    const updateDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    const drawImageCover = (img) => {
      if (!img) return;
      const w = canvas.width;
      const h = canvas.height;
      const iw = img.width;
      const ih = img.height;

      let r = Math.min(w / iw, h / ih);
      let nw = iw * r;
      let nh = ih * r;
      let ar = 1;
      if (nw < w) ar = w / nw;
      if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
      nw *= ar;
      nh *= ar;

      const cw = iw / (nw / w);
      const ch = ih / (nh / h);
      const cx = (iw - cw) * 0.5;
      const cy = (ih - ch) * 0.5;

      context.clearRect(0, 0, w, h);
      context.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
    };

    // Find the nearest loaded frame to the target
    const getNearestFrame = (target) => {
      if (frames[target]) return frames[target];
      // Search outward from target
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        if (target - offset >= 0 && frames[target - offset]) return frames[target - offset];
        if (target + offset < FRAME_COUNT && frames[target + offset]) return frames[target + offset];
      }
      return null;
    };

    const drawCurrentFrame = () => {
      const target = Math.round(sequence.frame);
      const img = getNearestFrame(target);
      if (img) drawImageCover(img);
    };

    // Start scroll animation immediately — draws whatever is available
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
      onUpdate: drawCurrentFrame,
    });

    window.addEventListener("resize", drawCurrentFrame);

    // Load frame 1 first, draw it immediately
    const firstImg = new Image();
    firstImg.src = `${FRAME_PREFIX}${pad(1)}${FRAME_SUFFIX}`;
    firstImg.onload = () => {
      frames[0] = firstImg;
      drawImageCover(firstImg);

      // Now load all remaining frames in parallel — browser handles concurrency
      for (let i = 2; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `${FRAME_PREFIX}${pad(i)}${FRAME_SUFFIX}`;
        img.onload = () => {
          frames[i - 1] = img;
        };
      }
    };

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("resize", drawCurrentFrame);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className={styles.fixedContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
