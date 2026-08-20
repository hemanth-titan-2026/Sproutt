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
const FRAME_SUFFIX = ".jpg";

function pad(number) {
  return number.toString().padStart(3, "0");
}

export default function CanvasSequence() {
  const canvasRef = useRef(null);
  const loaderRef = useRef(null);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fullyLoaded, setFullyLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const frames = new Array(FRAME_COUNT).fill(null);
    let imagesLoaded = 0;
    let scrollTriggerInit = false;
    let sequence = { frame: 0 };

    const updateDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    const drawImageProp = (img) => {
      if (!img) return;
      const ctx = context;
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
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, cx, cy, cw, ch, 0, 0, w, h);
    };

    const initScrollAnimation = () => {
      if (scrollTriggerInit) return;
      scrollTriggerInit = true;

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
        onUpdate: () => {
          drawImageProp(frames[sequence.frame]);
        },
      });

      window.addEventListener("resize", () => {
        if (frames[sequence.frame]) {
          drawImageProp(frames[sequence.frame]);
        }
      });
    };

    // Load first frame immediately — shows background right away
    const firstImg = new Image();
    firstImg.src = `${FRAME_PREFIX}${pad(1)}${FRAME_SUFFIX}`;
    firstImg.onload = () => {
      frames[0] = firstImg;
      imagesLoaded++;
      setProgress(Math.round((1 / FRAME_COUNT) * 100));
      drawImageProp(firstImg);
      setFirstFrameReady(true);

      // Load remaining frames in background
      for (let i = 2; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `${FRAME_PREFIX}${pad(i)}${FRAME_SUFFIX}`;
        img.onload = () => {
          frames[i - 1] = img;
          imagesLoaded++;
          const pct = Math.round((imagesLoaded / FRAME_COUNT) * 100);
          setProgress(pct);

          if (imagesLoaded === FRAME_COUNT) {
            setFullyLoaded(true);
            initScrollAnimation();
          }
        };
      }
    };

    return () => {
      window.removeEventListener("resize", updateDimensions);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Fade out loader once first frame is painted
  useEffect(() => {
    if (firstFrameReady && loaderRef.current) {
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          if (loaderRef.current) loaderRef.current.style.display = "none";
        },
      });
    }
  }, [firstFrameReady]);

  return (
    <>
      {/* Loader fades out as soon as first frame is ready */}
      <div ref={loaderRef} className={styles.loader}>
        <div className={styles.loaderContent}>
          <div className={styles.loaderText}>Planting Seed...</div>
          <div className={styles.progressBarWrapper}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressPercent}>{progress}%</div>
        </div>
      </div>

      <div className={styles.fixedContainer}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </>
  );
}
