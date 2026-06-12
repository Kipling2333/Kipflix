import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { HeroCarousel } from "../components/HeroCarousel";
import { MovieRow } from "../components/MovieRow";
import { PlayerModal } from "../components/PlayerModal";
import { Footer } from "../components/Footer";
import type { Movie } from "../lib/types";
import { featured, trending, newReleases, GENRES, byGenre } from "../lib/helpers";
import { api } from "../lib/api";
import { Play, TrendUp, Film } from "../components/icons";

const accents: Record<string, string> = {
  Action: "#ef4444",
  Adventure: "#f59e0b",
  Animation: "#3b82f6",
  Comedy: "#eab308",
  Crime: "#64748b",
  Drama: "#10b981",
  Horror: "#7c3aed",
  Romance: "#ec4899",
  "Sci-Fi": "#06b6d4",
  Thriller: "#dc2626",
};

export default function Landing() {
  const { movies, loading } = useCatalog();
  const [playing, setPlaying] = useState<Movie | null>(null);

  const rows = useMemo(() => {
    if (!movies.length) return null;
    return {
      feat: featured(movies),
      trend: trending(movies).slice(0, 14),
      fresh: newReleases(movies).slice(0, 14),
    };
  }, [movies]);

  const play = (m: Movie) => {
    setPlaying(m);
    api.incrementViews(m.id);
  };

  if (loading || !rows) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <HeroCarousel movies={rows.feat} onPlay={play} />

      <div className="relative z-10 -mt-16 space-y-10 sm:-mt-20">
        <MovieRow title="Trending Now" movies={rows.trend} icon={<TrendUp className="h-5 w-5 text-red-500" />} />
        <MovieRow title="New Releases" movies={rows.fresh} icon={<Film className="h-5 w-5 text-red-500" />} />
      </div>

      {/* Categories preview */}
      <section className="mx-auto mt-16 max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <h2 className="mb-5 text-xl font-bold tracking-tight sm:text-2xl">Browse by Category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {GENRES.map((g) => {
            const count = byGenre(movies, g).length;
            const c = accents[g] || "#e11d2e";
            return (
              <Link
                key={g}
                to={`/search?genre=${encodeURIComponent(g)}`}
                className="group relative overflow-hidden rounded-xl p-5 ring-1 ring-white/10 transition-all hover:-translate-y-1 hover:ring-white/30"
                style={{ background: `linear-gradient(135deg, ${c}33, ${c}0d)` }}
              >
                <div
                  className="absolute -right-3 -top-3 text-5xl font-black opacity-20"
                  style={{ color: c }}
                >
                  {g[0]}
                </div>
                <p className="relative text-base font-bold text-white">{g}</p>
                <p className="relative mt-1 text-xs text-zinc-400">{count} titles</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why KipFlix */}
      <section className="mx-auto mt-20 max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: "🎬", h: "Cinematic Quality", p: "Stream in stunning HD with adaptive playback optimized for any connection or device." },
            { icon: "📱", h: "Watch Anywhere", p: "Pick up right where you left off across phone, tablet, laptop and TV — anytime." },
            { icon: "✨", h: "Made For You", p: "Smart recommendations that learn your taste and surface films you'll actually love." },
          ].map((f) => (
            <div key={f.h} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-bold text-white">{f.h}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{f.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-red-600/20 bg-gradient-to-br from-red-950/60 via-zinc-900 to-black p-10 text-center sm:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <h2 className="relative text-3xl font-black tracking-tight text-white sm:text-4xl">
            Your next favorite movie is one tap away.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-zinc-400">
            Join KipFlix today and unlock unlimited streaming, personalized picks, and a watchlist that follows you everywhere.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/home"
              className="flex items-center gap-2 rounded-lg bg-red-600 px-7 py-3 font-bold text-white shadow-xl shadow-red-900/40 transition-colors hover:bg-red-500"
            >
              <Play className="h-5 w-5" /> Start Watching
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-white/10 px-7 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      {playing && <PlayerModal movie={playing} mode="full" onClose={() => setPlaying(null)} />}
    </div>
  );
}
