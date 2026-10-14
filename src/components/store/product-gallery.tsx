"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  const list = images.length ? images : ["/seed/og-image.webp"];
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {list.length > 1 && (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto md:w-20 md:flex-col">
          {list.map((src, n) => (
            <li key={src + n} className="shrink-0">
              <button
                onClick={() => setI(n)}
                className={`relative block size-16 overflow-hidden rounded-xl border-2 sm:size-20 ${n === i ? "border-brand-700" : "border-transparent opacity-70 hover:opacity-100"}`}
                aria-label={`Show image ${n + 1}`}
                aria-current={n === i}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-[24px] border border-line bg-white">
        <Image src={list[i]} alt={name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
      </div>
    </div>
  );
}
