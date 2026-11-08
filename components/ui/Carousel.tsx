"use client";
import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function Carousel({ children, title }: { children: React.ReactNode; title: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dx: number) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dx, behavior: "smooth" });
  };
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between pr-1">
        <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
        <div className="hidden sm:flex items-center gap-1">
          <button aria-label="Prev" onClick={() => scrollBy(-400)} className="rounded-md p-1.5 border border-stroke hover:bg-white/5 transition">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button aria-label="Next" onClick={() => scrollBy(400)} className="rounded-md p-1.5 border border-stroke hover:bg-white/5 transition">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-stroke/60 scrollbar-track-transparent">
        {children}
      </div>
    </section>
  );
}


