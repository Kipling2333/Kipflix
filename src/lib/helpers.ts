import type { Movie } from "./types";

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

export const trending = (m: Movie[]) => [...m].sort((a, b) => b.views - a.views);
export const newReleases = (m: Movie[]) => [...m].sort((a, b) => b.year - a.year || b.rating - a.rating);
export const topRated = (m: Movie[]) => [...m].sort((a, b) => b.rating - a.rating);
export const byGenre = (m: Movie[], g: string) => m.filter((x) => x.genre.includes(g));
export const featured = (m: Movie[]) => m.filter((x) => x.featured);

export function recommended(m: Movie[], favorites: string[]): Movie[] {
  if (!favorites.length) return topRated(m).slice(0, 12);
  const likedGenres = new Set<string>();
  m.filter((x) => favorites.includes(x.id)).forEach((x) => x.genre.forEach((g) => likedGenres.add(g)));
  return [...m]
    .filter((x) => !favorites.includes(x.id))
    .map((x) => ({ x, score: x.genre.filter((g) => likedGenres.has(g)).length + x.rating / 10 }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.x)
    .slice(0, 14);
}

export const fmtViews = (v: number) =>
  v >= 1_000_000 ? (v / 1_000_000).toFixed(1) + "M" : v >= 1000 ? (v / 1000).toFixed(1) + "K" : "" + v;

export const fmtDuration = (min: number) => `${Math.floor(min / 60)}h ${min % 60}m`;
