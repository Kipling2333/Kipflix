import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Movie } from "../lib/types";
import { Play, Info, Star, Plus, Check } from "./icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { fmtDuration } from "../lib/helpers";

export function HeroCarousel({
  movies,
  onPlay,
}: {
  movies: Movie[];
  onPlay: (m: Movie) => void;
}) {
  const [i, setI] = useState(0);
  const { user, toggleFavorite } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (movies.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % movies.length), 7000);
    return () => clearInterval(t);
  }, [movies.length]);

  if (!movies.length) return null;
  const m = movies[i];
  const faved = !!user?.favorites.includes(m.id);

  const onFav = async () => {
    if (!user) return toast("Sign in to save movies to My List.", "info");
    const now = await toggleFavorite(m.id);
    toast(now ? "Added to My List" : "Removed from My List", "success");
  };

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      {movies.map((mv, idx) => (
        <div
          key={mv.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: idx === i ? 1 : 0 }}
        >
          <img
            src={mv.thumbnailUrl}
            alt={mv.title}
            className="h-full w-full object-cover object-center"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080b] via-transparent to-black/40" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-end px-4 pb-24 sm:px-6 sm:pb-28 lg:px-10 lg:pb-32">
        <div key={m.id} className="animate-fade-up max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
            🔥 Featured
          </span>
          <h1 className="mt-4 text-balance text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl sm:text-5xl lg:text-7xl">
            {m.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-zinc-300">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4" /> {m.rating.toFixed(1)}
            </span>
            <span>{m.year}</span>
            <span>{fmtDuration(m.duration)}</span>
            <span className="rounded border border-white/20 px-1.5 text-xs">HD</span>
            <span className="text-zinc-400">{m.genre.join(" · ")}</span>
          </div>
          <p className="mt-4 line-clamp-3 max-w-xl text-base text-zinc-300 drop-shadow sm:text-lg">
            {m.description}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay(m)}
              className="flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-base font-bold text-black shadow-xl transition-transform hover:scale-105"
            >
              <Play className="h-5 w-5" /> Watch Now
            </button>
            <Link
              to={`/movie/${m.id}`}
              className="flex items-center gap-2 rounded-lg bg-white/15 px-6 py-3 text-base font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <Info className="h-5 w-5" /> Details
            </Link>
            <button
              onClick={onFav}
              aria-label="Add to list"
              className={`flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
                faved ? "border-red-500 bg-red-600 text-white" : "border-white/40 bg-black/30 text-white hover:border-white"
              }`}
            >
              {faved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 right-4 flex gap-2 sm:right-6 lg:right-10">
          {movies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-8 bg-red-600" : "w-4 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
