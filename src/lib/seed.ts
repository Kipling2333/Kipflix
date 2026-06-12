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
];