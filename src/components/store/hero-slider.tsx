"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = { image: string; title: string; subtitle?: string; buttonText?: string; buttonLink?: string };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  const go = (n: number) => {
    const el = track.current;
    if (!el) return;
    const idx = (n + slides.length) % slides.length;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => !paused.current && go(i + 1), 6000);
    return () => clearInterval(t);
  });

  return (
    <section className="container-x pt-4 sm:pt-6" aria-roledescription="carousel" aria-label="Featured offers">
      <div className="relative" onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setI(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto rounded-[24px] border border-line sm:rounded-[28px] sm:border-0"
        >
          {slides.map((s, n) => (
            <div key={n} className="relative w-full shrink-0 snap-start bg-white sm:bg-transparent" aria-roledescription="slide" aria-label={`${n + 1} of ${slides.length}`}>
              <div className="relative aspect-[16/9] sm:aspect-[16/8] lg:aspect-[16/6.2]">
                <Image src={s.image} alt="" fill priority={n === 0} sizes="(max-width: 1320px) 100vw, 1320px" className="object-cover object-[78%_50%]" />
              </div>
              <div className="px-5 pb-12 pt-4 sm:absolute sm:inset-0 sm:flex sm:items-center sm:bg-gradient-to-r sm:from-white/90 sm:via-white/50 sm:to-transparent sm:p-10 lg:p-16">
                <div className="sm:max-w-[52%]">
                  <h2 className="text-[26px] font-extrabold leading-[1.08] text-ink sm:text-4xl lg:text-6xl">{s.title}</h2>
                  {s.subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink/75 sm:mt-4 sm:text-lg">{s.subtitle}</p>}
                  {s.buttonText && s.buttonLink && (
                    <Link href={s.buttonLink} className="btn-primary mt-4 h-11 px-6 text-[15px] sm:mt-7 sm:h-12 sm:px-7">
                      {s.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <>
            <button onClick={() => go(i - 1)} className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-md hover:bg-white xl:grid" aria-label="Previous slide">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => go(i + 1)} className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow-md hover:bg-white xl:grid" aria-label="Next slide">
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-5 left-5 flex gap-1.5 sm:bottom-5 sm:left-auto sm:right-6">
              {slides.map((_, n) => (
                <button key={n} onClick={() => go(n)} aria-label={`Go to slide ${n + 1}`} className={`h-2 rounded-full transition-all ${n === i ? "w-7 bg-brand-700" : "w-2 bg-ink/25"}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
