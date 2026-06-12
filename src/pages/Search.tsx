import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import { MovieCard } from "../components/MovieCard";
import { Footer } from "../components/Footer";
import { GENRES } from "../lib/helpers";
import { Search as SearchIcon, X } from "../components/icons";

export default function Search() {
  const { movies } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [genre, setGenre] = useState(params.get("genre") || "All");
  const [sort, setSort] = useState<"popular" | "rating" | "newest">("popular");
  const [minRating, setMinRating] = useState(0);

  const years = useMemo(() => {
    const set = new Set(movies.map((m) => m.year));
    return ["All", ...Array.from(set).sort((a, b) => b - a).map(String)];
  }, [movies]);
  const [year, setYear] = useState(params.get("year") || "All");

  useEffect(() => {
    const p: Record<string, string> = {};
    if (q) p.q = q;
    if (genre !== "All") p.genre = genre;
    if (year !== "All") p.year = year;
    setParams(p, { replace: true });
  }, [q, genre, year, setParams]);

  const results = useMemo(() => {
    let r = movies.filter((m) => {
      const matchQ =
        !q ||
        m.title.toLowerCase().includes(q.toLowerCase()) ||
        m.genre.some((g) => g.toLowerCase().includes(q.toLowerCase())) ||
        m.description.toLowerCase().includes(q.toLowerCase());
      const matchG = genre === "All" || m.genre.includes(genre);
      const matchY = year === "All" || String(m.year) === year;
      const matchR = m.rating >= minRating;
      return matchQ && matchG && matchY && matchR;
    });
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    else if (sort === "newest") r = [...r].sort((a, b) => b.year - a.year);
    else r = [...r].sort((a, b) => b.views - a.views);
    return r;
  }, [movies, q, genre, year, minRating, sort]);

  const activeFilters = (genre !== "All" ? 1 : 0) + (year !== "All" ? 1 : 0) + (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen pb-16 pt-20 md:pb-0">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Browse & Search</h1>

        {/* Search bar */}
        <div className="relative mt-5">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Search movies, genres, keywords..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-12 text-base text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-red-500/50"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {["All", ...GENRES].map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  genre === g ? "bg-red-600 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-400">
              Year
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-red-500/50"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-400">
              Min Rating
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-red-500/50"
              >
                {[0, 7, 7.5, 8, 8.5].map((r) => (
                  <option key={r} value={r}>
                    {r === 0 ? "Any" : `${r}+`}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-400">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-red-500/50"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </label>

            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setGenre("All");
                  setYear("All");
                  setMinRating(0);
                }}
                className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          {results.length} {results.length === 1 ? "result" : "results"}
          {q && ` for “${q}”`}
        </p>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="text-5xl">🎬</div>
            <p className="text-lg font-semibold text-zinc-300">No movies found</p>
            <p className="text-sm text-zinc-500">Try a different search or clear your filters.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((m) => (
              <div key={m.id} className="mx-auto w-full max-w-[200px]">
                <MovieCard movie={m} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
