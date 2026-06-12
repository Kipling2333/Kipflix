import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { api, seedIfNeeded } from "../lib/api";
import type { User } from "../lib/types";

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  toggleFavorite: (movieId: string) => Promise<boolean>;
  recordWatch: (movieId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedIfNeeded();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const t = await firebaseUser.getIdToken();
          const u = await api.getUser(t);
          setToken(t);
          setUser(u);
        } catch {
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    setToken(token);
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user } = await api.register(name, email, password);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
    setToken(null);
    setUser(null);
  }, []);

  const toggleFavorite = useCallback(
    async (movieId: string) => {
      if (!token) throw new Error("auth");
      const updated = await api.toggleFavorite(token, movieId);
      setUser(updated);
      return updated.favorites.includes(movieId);
    },
    [token]
  );

  const recordWatch = useCallback(
    async (movieId: string) => {
      if (!token) return;
      const updated = await api.addHistory(token, movieId);
      setUser(updated);
    },
    [token]
  );

  const clearHistory = useCallback(async () => {
    if (!token) return;
    setUser(await api.clearHistory(token));
  }, [token]);

  const updateName = useCallback(
    async (name: string) => {
      if (!token) return;
      setUser(await api.updateProfile(token, name));
    },
    [token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      toggleFavorite,
      recordWatch,
      clearHistory,
      updateName,
    }),
    [user, token, loading, login, register, logout, toggleFavorite, recordWatch, clearHistory, updateName]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}