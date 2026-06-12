import type { Movie } from "../lib/types";

/** Renders real key-art when available, else a designed gradient poster. */
export function PosterArt({ movie, className = "" }: { movie: Movie; className?: string }) {
  if (movie.thumbnailUrl) {
    return (
      <img
        src={movie.thumbnailUrl}
        alt={movie.title}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  const a = movie.accent;
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 30% 10%, ${a}55 0%, ${a}1a 35%, #0b0b0f 75%)`,
      }}
    >
      {/* ghost initial */}
      <div
        className="pointer-events-none absolute -right-4 -top-6 select-none text-[9rem] font-black leading-none opacity-10"
        style={{ color: a }}
      >
        {movie.title[0]}
      </div>
      {/* grain lines */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 4px)",
        }}
      />
      <div
        className="absolute inset-x-0 top-1/2 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${a}, transparent)` }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <span
          className="mb-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: `${a}26`, color: a }}
        >
          {movie.genre[0]}
        </span>
        <h3 className="text-balance text-lg font-black uppercase leading-tight tracking-tight text-white drop-shadow">
          {movie.title}
        </h3>
        <p className="mt-1 text-[11px] font-medium text-zinc-400">
          {movie.year} · ★ {movie.rating.toFixed(1)}
        </p>
      </div>
    </div>
  );
}
