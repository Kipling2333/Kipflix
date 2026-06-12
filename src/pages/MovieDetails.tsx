import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PosterArt } from "../components/PosterArt";
import { MovieRow } from "../components/MovieRow";
import { PlayerModal } from "../components/PlayerModal";
import { Footer } from "../components/Footer";
import { api } from "../lib/api";
import { fmtDuration, fmtViews } from "../lib/helpers";
import { Play, Info, Plus, Check, Star, ChevronLeft } from "../components/icons";

interface Comment {
  id: string;
  name: string;
  text: string;
  at: string;
}

function loadComments(id: string): Comment[] {
  try {
    return JSON.parse(localStorage.getItem("kipflix.comments." + id) || "[]");
  } catch {
    return [];
  }
}
function saveComments(id: string, c: Comment[]) {
  localStorage.setItem("kipflix.comments." + id, JSON.stringify(c));
}

export default function MovieDetails() {
  const { id = "" } = useParams();
  const { movies, getById } = useCatalog();
  const { user, toggleFavorite, recordWatch } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  const movie = getById(id);
  const [mode, setMode] = useState<"trailer" | "full" | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    setComments(loadComments(id));
  }, [id]);

  const related = useMemo(() => {
    if (!movie) return [];
    return movies
      .filter((m) => m.id !== movie.id && m.genre.some((g) => movie.genre.includes(g)))
      .slice(0, 12);
  }, [movie, movies]);

  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-2xl font-bold">Movie not found</p>
        <Link to="/home" className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white">
          Back to Home
        </Link>
      </div>
    );
  }

  const faved = !!user?.favorites.includes(movie.id);

  const play = () => {
    setMode("full");
    api.incrementViews(movie.id);
    recordWatch(movie.id);
  };

  const onFav = async () => {
    if (!user) return toast("Sign in to save movies to My List.", "info");
    const now = await toggleFavorite(movie.id);
    toast(now ? "Added to My List" : "Removed from My List", "success");
  };

  const postComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast("Sign in to join the conversation.", "info");
    if (!draft.trim()) return;
    const c: Comment = {
      id: Math.random().toString(36).slice(2),
      name: user.name,
      text: draft.trim(),
      at: new Date().toISOString(),
    };
    const next = [c, ...comments];
    setComments(next);
    saveComments(movie.id, next);
    setDraft("");
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Backdrop */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {movie.thumbnailUrl ? (
            <img src={movie.thumbnailUrl} alt={movie.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ background: `radial-gradient(80% 80% at 70% 20%, ${movie.accent}40, #08080b)` }} />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080b] via-[#08080b]/50 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        <button
          onClick={() => nav(-1)}
          className="absolute left-4 top-20 z-20 flex items-center gap-1 rounded-full bg-black/50 px-3 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-black/70 sm:left-6 lg:left-10"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="relative z-10 mx-auto -mt-48 max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div className="w-40 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 sm:w-56">
            <div className="aspect-[2/3]">
              <PosterArt movie={movie} />
            </div>
          </div>

          <div className="flex-1 pt-2 sm:pt-20">
            <h1 className="text-balance text-3xl font-black tracking-tight text-white sm:text-5xl">
              {movie.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-300">
              <span className="flex items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 text-amber-300">
                <Star className="h-3.5 w-3.5" /> {movie.rating.toFixed(1)}
              </span>
              <span>{movie.year}</span>
              <span>{fmtDuration(movie.duration)}</span>
              <span className="rounded border border-white/20 px-1.5 text-xs">HD</span>
              <span className="text-zinc-400">{fmtViews(movie.views)} views</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {movie.genre.map((g) => (
                <Link
                  key={g}
                  to={`/search?genre=${encodeURIComponent(g)}`}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
                >
                  {g}
                </Link>
              ))}
            </div>

            <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300">
              {movie.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={play}
                className="flex items-center gap-2 rounded-lg bg-white px-7 py-3 font-bold text-black shadow-xl transition-transform hover:scale-105"
              >
                <Play className="h-5 w-5" /> Play
              </button>
              <button
                onClick={() => setMode("trailer")}
                className="flex items-center gap-2 rounded-lg bg-white/15 px-6 py-3 font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                <Info className="h-5 w-5" /> Trailer
              </button>
              <button
                onClick={onFav}
                className={`flex items-center gap-2 rounded-lg border px-5 py-3 font-semibold transition-colors ${
                  faved ? "border-red-500 bg-red-600/20 text-red-300" : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                {faved ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {faved ? "In My List" : "My List"}
              </button>
            </div>
          </div>
        </div>

        {/* Comments */}
        <section className="mt-14 max-w-3xl">
          <h2 className="mb-4 text-xl font-bold tracking-tight">
            Comments <span className="text-zinc-500">({comments.length})</span>
          </h2>
          <form onSubmit={postComment} className="mb-6">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={user ? "Share your thoughts on this film..." : "Sign in to leave a comment"}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-red-500/50"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                disabled={!draft.trim()}
              >
                Post Comment
              </button>
            </div>
          </form>
          <div className="space-y-4">
            {comments.length === 0 && (
              <p className="text-sm text-zinc-500">Be the first to share your thoughts.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 text-sm font-bold text-white">
                  {c.name[0].toUpperCase()}
                </span>
                <div className="rounded-xl rounded-tl-sm border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-100">{c.name}</p>
                    <p className="text-xs text-zinc-500">
                      {new Date(c.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-300">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-16">
        <MovieRow title="More Like This" movies={related} />
      </div>

      <Footer />
      {mode && <PlayerModal movie={movie} mode={mode} onClose={() => setMode(null)} />}
    </div>
  );
}
