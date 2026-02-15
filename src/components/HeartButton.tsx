"use client";

import { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Heart } from "lucide-react";

const HEART_COUNT = 70;
const COLORS = [
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#e11d48", // rose-600
  "#db2777", // pink-600
  "#be185d", // pink-700
  "#f472b6", // pink-400
];

function getRandom(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function getRandomInt(min: number, max: number) {
  return Math.floor(getRandom(min, max + 1));
}

export default function HeartButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [rain, setRain] = useState<{
    originX: number;
    originY: number;
    hearts: Array<{
      burstX: number;
      burstY: number;
      endY: number;
      driftX: number;
      duration: number;
      delay: number;
      size: number;
      color: string;
      rotation: number;
    }>;
  } | null>(null);

  const triggerHearts = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn || typeof window === "undefined") return;

    const rect = btn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const fallDistance = window.innerHeight - originY + 80;

    const hearts = Array.from({ length: HEART_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const burstDist = getRandom(40, 140);
      return {
        burstX: Math.cos(angle) * burstDist,
        burstY: Math.sin(angle) * burstDist - 20,
        endY: fallDistance + getRandom(0, 60),
        driftX: getRandom(-80, 80),
        duration: getRandom(2.2, 3.8),
        delay: getRandom(0, 0.25),
        size: getRandomInt(14, 26),
        color: COLORS[getRandomInt(0, COLORS.length - 1)]!,
        rotation: getRandom(-180, 180),
      };
    });

    setRain({ originX, originY, hearts });
    const maxDuration = Math.max(...hearts.map((h) => h.duration + h.delay)) * 1000;
    const timer = setTimeout(() => setRain(null), maxDuration + 200);
    return () => clearTimeout(timer);
  }, []);

  const overlay =
    rain &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
        aria-hidden
      >
        <style>{`
          @keyframes heart-popper {
            0% {
              transform: translate(0, 0) scale(0);
              opacity: 1;
            }
            12% {
              transform: translate(var(--bx), var(--by)) scale(1) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(calc(var(--bx) + var(--dx)), var(--ey)) scale(1) rotate(var(--rot));
              opacity: 0.5;
            }
          }
        `}</style>
        {rain.hearts.map((h, i) => (
          <div
            key={i}
            className="absolute will-change-transform"
            style={{
              left: rain.originX,
              top: rain.originY,
              width: h.size,
              height: h.size,
              marginLeft: -h.size / 2,
              marginTop: -h.size / 2,
              color: h.color,
              ["--bx" as string]: `${h.burstX}px`,
              ["--by" as string]: `${h.burstY}px`,
              ["--ey" as string]: `${h.endY}px`,
              ["--dx" as string]: `${h.driftX}px`,
              ["--rot" as string]: `${h.rotation}deg`,
              animation: "heart-popper linear forwards",
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
            }}
          >
            <Heart
              className="w-full h-full drop-shadow-sm"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </div>
        ))}
      </div>,
      document.body
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={triggerHearts}
        className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-rose-300 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:scale-110 active:scale-95 transition-transform shadow-sm"
        aria-label="Spread some love — Valentine hearts"
      >
        <Heart className="w-4 h-4" fill="currentColor" stroke="currentColor" strokeWidth={2} />
      </button>
      {overlay}
    </>
  );
}
