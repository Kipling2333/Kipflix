import { useMemo, useState } from "react";
import { useCatalog } from "../context/CatalogContext";
import { useAuth } from "../context/AuthContext";
import { HeroCarousel } from "../components/HeroCarousel";
import { MovieRow } from "../components/MovieRow";
import { PlayerModal } from "../components/PlayerModal";
import { Footer } from "../components/Footer";
import { api } from "../lib/api";
import type { Movie } from "../lib/types";
import {
  byGenre,
  featured,
  newReleases,
  recommended,
  topRated,
  trending,
} from "../lib/helpers";
import { TrendUp, Clock, Star, Film } from "../components/icons";

export default function Home() {
  const { movies, loading } = useCatalog();
  const { user, recordWatch } = useAuth();
  const [playing, setPlaying] = useState<Movie | null>(null);

  const rows = useMemo(() => {
    if (!movies.length) return null;
    return {
      feat: featured(movies),
      trend: trending(movies).slice(0, 14),
      fresh: newReleases(movies).slice(0, 14),
      top: topRated(movies).slice(0, 14),
      rec: recommended(movies, user?.favorites || []),
      action: byGenre(movies, "Action"),
      scifi: byGenre(movies, "Sci-Fi"),
      drama: byGenre(movies, "Drama"),
    };
  }, [movies, user]);

  const continueWatching = useMemo(() => {
    if (!user?.watchHistory.length) return [];
    return user.watchHistory
      .map((h) => movies.find((m) => m.id === h.movieId))
      .filter(Boolean) as Movie[];
  }, [user, movies]);

  const play = (m: Movie) => {
    setPlaying(m);
    api.incrementViews(m.id);
    recordWatch(m.id);
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
        {continueWatching.length > 0 && (
          <MovieRow title="Continue Watching" movies={continueWatching} icon={<Clock className="h-5 w-5 text-red-500" />} />
        )}
        <MovieRow title="Trending Now" movies={rows.trend} icon={<TrendUp className="h-5 w-5 text-red-500" />} />
        <MovieRow title={user ? "Recommended For You" : "Top Picks"} movies={rows.rec} icon={<Star className="h-5 w-5 text-amber-400" />} />
        <MovieRow title="New Releases" movies={rows.fresh} icon={<Film className="h-5 w-5 text-red-500" />} />
        <MovieRow title="Top Rated" movies={rows.top} icon={<Star className="h-5 w-5 text-amber-400" />} />
        <MovieRow title="Action & Adventure" movies={rows.action} />
        <MovieRow title="Sci-Fi Worlds" movies={rows.scifi} />
        <MovieRow title="Acclaimed Dramas" movies={rows.drama} />
      </div>
      <Footer />
      {playing && <PlayerModal movie={playing} mode="full" onClose={() => setPlaying(null)} />}
    </div>
  );
}
