import type { Movie } from "./types";

export const SEED_MOVIES: Movie[] = [
  {
    id: "swapped",
    title: "Swapped",
    description:
      "One mistake... and everything changed. A gripping Nigerian drama filled with suspense, conflict, and shocking revelations starring Maurice Sam and Chinenye Nnebe.",
    genre: ["Drama"],
    year: 2026,
    rating: 8.0,
    duration: 130,
    thumbnailUrl: "https://i.ibb.co/mrtkbX5c/swapped-movie-thumbnail.jpg",
    accent: "#e11d2e",
    videoUrl: "https://stream.mux.com/Y4ANziekvHvOMFkLwx161hGFhcCCx9EU5tvWhq1JsZw",
    trailerUrl: "https://www.youtube.com/embed/i-Dd_zjzRcs",
    views: 0,
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "she-knows-my-secret",
    title: "She Knows My Secret",
    description:
      "She Knows My Secret is a gripping emotional drama centered around a man who appears to have the perfect life on the outside, but hides a dark secret that could destroy everything he has built.",
    genre: ["Drama", "Romance", "Thriller"],
    year: 2026,
    rating: 8.0,
    duration: 101,
    thumbnailUrl: "https://i.ibb.co/QttKfRn/photo-2026-05-23-23-02-44.jpg",
    accent: "#e11d2e",
    videoUrl: "https://stream.mux.com/PxTR6J2772jiwyJqAAZGdrX637q7CEUXS0068Lr4UeQM",
    trailerUrl: "https://www.youtube.com/embed/f2r_q99S8I0",
    views: 0,
    featured: true,
    createdAt: new Date().toISOString(),
  },
];