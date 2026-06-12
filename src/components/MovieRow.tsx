import { useRef } from "react";
import type { Movie } from "../lib/types";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight } from "./icons";

export function MovieRow({
  title,
  movies,
  icon,
}: {
  title: string;
  movies: Movie[];
  icon?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (!movies.length) return null;

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="group/row relative">
      <div className="mb-3 flex items-center gap-2 px-4 sm:px-6 lg:px-10">
        {icon}
        <h2 className="text-lg font-bold tracking-tight text-zinc-100 sm:text-xl">{title}</h2>
      </div>
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-1 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black group-hover/row:opacity-100 lg:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div
          ref={ref}
          className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:gap-4 sm:px-6 lg:px-10"
        >
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
        <button
          onClick={() => scroll(1)}
          className="absolute right-1 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black group-hover/row:opacity-100 lg:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
