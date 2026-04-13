import { useEffect, useRef } from "react";
import heroVideo from "../../assets/Untitled design.mp4";

export default function ComingSoon() {
  const backdropVideoRef = useRef(null);
  const mainVideoRef = useRef(null);

  useEffect(() => {
    const mainVideoEl = mainVideoRef.current;
    const backdropVideoEl = backdropVideoRef.current;
    if (!mainVideoEl && !backdropVideoEl) return;

    const startMuted = (videoEl) => {
      if (!videoEl) return;
      videoEl.muted = true;
      const playResult = videoEl.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(() => {});
      }
    };

    const unmuteAll = () => {
      if (backdropVideoEl) backdropVideoEl.muted = false;
      if (mainVideoEl) mainVideoEl.muted = false;
      if (backdropVideoEl) backdropVideoEl.play().catch(() => {});
      if (mainVideoEl) mainVideoEl.play().catch(() => {});
    };

    const cleanup = () => {
      window.removeEventListener("pointerdown", unmuteAll);
      window.removeEventListener("touchstart", unmuteAll);
      window.removeEventListener("keydown", unmuteAll);
    };

    startMuted(backdropVideoEl);
    startMuted(mainVideoEl);

    window.addEventListener("pointerdown", unmuteAll, { once: true });
    window.addEventListener("touchstart", unmuteAll, { once: true, passive: true });
    window.addEventListener("keydown", unmuteAll, { once: true });

    return cleanup;
  }, []);

  return (
    <main className="relative bg-black">
      <section className="relative min-h-[100svh] w-full overflow-hidden">
        <video
          ref={backdropVideoRef}
          className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-60"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        <video
          ref={mainVideoRef}
          className="absolute inset-0 h-full w-full object-cover [object-position:50%_50%] transform-gpu"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(1100px_circle_at_50%_40%,rgba(255,255,255,0.06),rgba(0,0,0,0)_55%)]"
        />

        <div className="relative mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-end px-6 pb-10 pt-12 sm:pb-12 sm:pt-14">
          <div className="flex justify-center sm:justify-end">
            <div className="w-full max-w-4xl rounded-[34px] border border-white/10 bg-black/35 p-10 text-center shadow-glow backdrop-blur sm:w-auto sm:text-right sm:p-12 [animation:cc-fadeup_900ms_cubic-bezier(.2,.8,.2,1)_both]">
              <div className="font-cinematic text-3xl font-semibold tracking-[0.12em] text-[#C4002F] drop-shadow-[0_18px_40px_rgba(0,0,0,0.85)] sm:text-4xl">
                Black Cat
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-10 sm:pb-28 sm:pt-14">
        <div className="mx-auto max-w-4xl py-12 text-center sm:py-14 lg:py-16">
          <div className="font-cinematic text-balance text-3xl font-semibold uppercase leading-tight tracking-[0.18em] text-white sm:text-5xl sm:tracking-[0.22em] lg:text-6xl">
            Website Coming Soon
          </div>
          <div className="mt-4 text-pretty text-sm leading-relaxed text-white/70 sm:text-base">
            Stay tuned for the official launch announcement.
          </div>
          <div className="mt-6 text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
            Casting Going On - For Casting Call Naren Bansal -{" "}
            <a
              href="tel:+917986168002"
              className="font-medium text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              +91 79861 68002
            </a>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-10 -top-10 -z-10 h-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),rgba(59,130,246,0.08)_40%,rgba(217,70,239,0.08)_65%,rgba(0,0,0,0)_72%)] blur-3xl"
        />
      </section>
    </main>
  );
}
