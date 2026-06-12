import { Link } from "react-router-dom";
import type { Movie } from "../lib/types";
import { PosterArt } from "./PosterArt";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Heart, Play, Star } from "./icons";

export function MovieCard({ movie }: { movie: Movie }) {
  const { user, toggleFavorite } = useAuth();
  const toast = useToast();
  const faved = !!user?.favorites.includes(movie.id);

  const onFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Sign in to save movies to My List.", "info");
      return;
    }
    try {
      const now = await toggleFavorite(movie.id);
      toast(now ? "Added to My List" : "Removed from My List", "success");
    } catch {
      toast("Something went wrong.", "error");
    }
  };

  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group relative block w-[150px] shrink-0 sm:w-[180px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-black/60 group-hover:ring-red-600/40">
        <PosterArt movie={movie} className="transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* hover controls */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between gap-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg">
            <Play className="h-4 w-4 translate-x-px" />
          </span>
          <button
            onClick={onFav}
            aria-label="Save to My List"
            className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-colors ${
              faved
                ? "border-red-500 bg-red-600 text-white"
                : "border-white/40 bg-black/40 text-white hover:border-white"
            }`}
          >
            <Heart className="h-4 w-4" filled={faved} />
          </button>
        </div>

        <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-amber-300 backdrop-blur-sm">
          <Star className="h-3 w-3" /> {movie.rating.toFixed(1)}
        </span>
      </div>
      {movie.thumbnailUrl && (
        <div className="mt-2 px-0.5">
          <p className="truncate text-sm font-semibold text-zinc-100">{movie.title}</p>
          <p className="text-xs text-zinc-500">
            {movie.year} · {movie.genre[0]}
          </p>
        </div>
      )}
    </Link>
  );
}
