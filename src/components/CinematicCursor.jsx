import { useEffect, useMemo, useRef, useState } from "react";

function clamp(number, min, max) {
  return Math.min(max, Math.max(min, number));
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isFinePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(pointer: fine)").matches
  );
}

export default function CinematicCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState("default"); // default | hover | down
  const [sparkles, setSparkles] = useState([]);
  const [ripples, setRipples] = useState([]);
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);

  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const blobRef = useRef(null);

  const target = useRef({ x: 0, y: 0 });
  const dot = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const blob = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const lastSpark = useRef(0);
  const lastPrune = useRef(0);

  const uid = useMemo(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return () => crypto.randomUUID();
    return () => `id_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }, []);

  useEffect(() => {
    if (!isFinePointer() || reduceMotion) return;
    setEnabled(true);
  }, [reduceMotion]);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;

      const now = performance.now();
      if (now - lastSpark.current < 16) return;
      lastSpark.current = now;

      const velocity =
        Math.hypot(dot.current.x - event.clientX, dot.current.y - event.clientY) ||
        0;
      if (velocity < 1.5) return;

      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 26;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      setSparkles((prev) => {
        const next = [
          ...prev,
          {
            id: uid(),
            x: event.clientX,
            y: event.clientY,
            dx,
            dy,
            t: now,
            life: 420 + Math.random() * 240,
          },
        ];
        return next.length > 28 ? next.slice(next.length - 28) : next;
      });
    };

    const onDown = (event) => {
      const now = performance.now();
      setMode((m) => (m === "hover" ? "down" : "down"));
      setRipples((prev) => [
        ...prev.slice(-2),
        { id: uid(), x: event.clientX, y: event.clientY, t: now },
      ]);
    };

    const onUp = (event) => {
      const isInteractive = event.target?.closest?.(
        "a,button,input,textarea,select,label,[role='button'],[data-cursor='hover']",
      );
      setMode((m) => {
        if (m !== "down") return m;
        return isInteractive ? "hover" : "default";
      });
    };

    const onOver = (event) => {
      const el = event.target?.closest?.(
        "a,button,input,textarea,select,label,[role='button'],[data-cursor='hover']",
      );
      if (el) setMode((m) => (m === "down" ? m : "hover"));
    };

    const onOut = (event) => {
      const leavingInteractive = event.target?.closest?.(
        "a,button,input,textarea,select,label,[role='button'],[data-cursor='hover']",
      );
      if (leavingInteractive) setMode((m) => (m === "down" ? m : "default"));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      const follow = (value, destination, easing) =>
        value + (destination - value) * easing;

      dot.current.x = follow(dot.current.x, target.current.x, 0.42);
      dot.current.y = follow(dot.current.y, target.current.y, 0.42);
      ring.current.x = follow(ring.current.x, target.current.x, 0.18);
      ring.current.y = follow(ring.current.y, target.current.y, 0.18);
      blob.current.x = follow(blob.current.x, target.current.x, 0.07);
      blob.current.y = follow(blob.current.y, target.current.y, 0.07);

      const dotEl = dotRef.current;
      const ringEl = ringRef.current;
      const blobEl = blobRef.current;

      if (dotEl) dotEl.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0)`;
      if (ringEl)
        ringEl.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0)`;
      if (blobEl)
        blobEl.style.transform = `translate3d(${blob.current.x}px, ${blob.current.y}px, 0)`;

      const now = performance.now();
      if (now - lastPrune.current > 90) {
        lastPrune.current = now;
        setSparkles((prev) => prev.filter((s) => now - s.t < s.life));
        setRipples((prev) => prev.filter((r) => now - r.t < 560));
      }

      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={blobRef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-44 w-44 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(217,70,239,0.18)_35%,rgba(59,130,246,0.16)_60%,rgba(0,0,0,0)_72%)] blur-2xl opacity-70 animate-[cc-drift_6s_ease-in-out_infinite]" />
      </div>

      <div
        ref={ringRef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      >
        <div
          className={[
            "rounded-full border shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_30px_rgba(217,70,239,0.18)] backdrop-blur-[2px] mix-blend-difference transition-[width,height,transform,border-color,opacity] duration-200",
            mode === "default" && "h-14 w-14 border-white/30 opacity-90",
            mode === "hover" && "h-16 w-16 border-white/55 opacity-100",
            mode === "down" && "h-12 w-12 border-white/70 opacity-100 scale-90",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      <div
        ref={dotRef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      >
        <div className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.25)] mix-blend-difference" />
      </div>

      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute left-0 top-0"
          style={{
            transform: `translate3d(${s.x}px, ${s.y}px, 0)`,
            willChange: "transform",
          }}
        >
          <div
            className="h-1 w-1 rounded-full bg-gradient-to-r from-fuchsia-300 via-white to-sky-300 opacity-90 shadow-[0_0_18px_rgba(255,255,255,0.35)]"
            style={{
              ["--dx"]: `${clamp(s.dx, -44, 44)}px`,
              ["--dy"]: `${clamp(s.dy, -44, 44)}px`,
              animation: `cc-spark ${Math.round(s.life)}ms ease-out forwards`,
            }}
          />
        </div>
      ))}

      {ripples.map((r) => (
        <div
          key={r.id}
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate3d(${r.x}px, ${r.y}px, 0)` }}
        >
          <div className="h-6 w-6 rounded-full border border-white/40 opacity-0 animate-[ping_0.55s_ease-out]" />
        </div>
      ))}
    </div>
  );
}
