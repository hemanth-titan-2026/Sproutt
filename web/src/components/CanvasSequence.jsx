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
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const frames = [];
    let imagesLoaded = 0;

    const updateDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (loaded && frames.length > 0) {
        // Redraw current frame on resize. The current frame is stored in ScrollTrigger progress.
      }
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    const drawImageProp = (ctx, img, x, y, w, h, offsetX, offsetY) => {
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

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `${FRAME_PREFIX}${pad(i)}${FRAME_SUFFIX}`;
      img.onload = () => {
        imagesLoaded++;
        setProgress(Math.round((imagesLoaded / FRAME_COUNT) * 100));
        if (imagesLoaded === FRAME_COUNT) {
          setLoaded(true);
          drawImageProp(context, frames[0]); 
          initAnimation();
        }
      };
      frames.push(img);
    }

    let sequence = { frame: 0 };
    
    const initAnimation = () => {
      gsap.to(sequence, {
        frame: FRAME_COUNT - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
          trigger: document.body, // Scrub over the entire page height
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
        onUpdate: () => {
          drawImageProp(context, frames[sequence.frame]);
        }
      });
      
      window.addEventListener("resize", () => {
          if (frames[sequence.frame]) {
             drawImageProp(context, frames[sequence.frame]);
          }
      });
    };

    return () => {
      window.removeEventListener("resize", updateDimensions);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [loaded]);

  return (
    <>
      {!loaded && (
        <div className={styles.loader}>
          <div className={styles.loaderText}>Planting Seed... {progress}%</div>
        </div>
      )}
      <div className={styles.fixedContainer}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </>
  );
}
