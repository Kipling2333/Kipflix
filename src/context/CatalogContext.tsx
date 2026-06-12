import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import type { Movie } from "../lib/types";

interface CatalogCtx {
  movies: Movie[];
  loading: boolean;
  refresh: () => Promise<void>;
  getById: (id: string) => Movie | undefined;
}

const Ctx = createContext<CatalogCtx | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const m = await api.getMovies();
    setMovies(m);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getById = useCallback((id: string) => movies.find((m) => m.id === id), [movies]);

  const value = useMemo(() => ({ movies, loading, refresh, getById }), [movies, loading, refresh, getById]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCatalog must be used within CatalogProvider");
  return c;
}
