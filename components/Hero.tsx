import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-stroke bg-surface">
      <div className="absolute inset-0">
        <Image unoptimized src="https://i.ibb.co/YBQ2N8w7/logo.png" alt="" fill sizes="100vw" className="object-cover opacity-[0.08]" />
      </div>
      <div className="relative px-6 py-10 md:py-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-stroke bg-bg-900/50 px-3 py-1 text-[11px] text-text-dim">Trending now</div>
        <h1 className="mt-3 text-2xl md:text-4xl font-semibold text-text-high">Continue Watching</h1>
        <p className="mt-2 text-text-dim max-w-2xl">Jump back into the action with the latest episodes from your favorite series, in a premium, blazing-fast experience.</p>
        <div className="mt-4 flex gap-3">
          <a href="#trending" className="btn btn-primary">Watch Now</a>
          <a href="#latest" className="btn btn-outline">Browse</a>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-900/70 to-transparent" />
    </section>
  );
}


