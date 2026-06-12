import type { AuthResponse, Movie, StoredUser, User } from "./types";
import { SEED_MOVIES } from "./seed";

/**
 * KipFlix client-side service layer.
 * Simulates a REST + JWT backend backed by a persistent local data store.
 * Mirrors the documented API surface: /auth, /movies, /favorites, /history.
 */

const USERS_KEY = "kipflix.users";
const MOVIES_KEY = "kipflix.movies";
const SEED_FLAG = "kipflix.seeded.v1";

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/* ------------------------------------------------------------------ */
/* "bcrypt-style" hashing (deterministic salted hash for the demo)     */
/* ------------------------------------------------------------------ */
function hashPassword(pw: string, salt = uid()): string {
  let h = 0x811c9dc5;
  const input = salt + ":" + pw;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // second pass for a little more diffusion
  let h2 = 0x811c9dc5 ^ h;
  for (let i = input.length - 1; i >= 0; i--) {
    h2 ^= input.charCodeAt(i);
    h2 = Math.imul(h2, 0x01000193);
  }
  return `kf$${salt}$${(h >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
}
function verifyPassword(pw: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  return hashPassword(pw, parts[1]) === stored;
}

/* ------------------------------------------------------------------ */
/* "JWT-style" token (base64 payload, not cryptographically signed)    */
/* ------------------------------------------------------------------ */
function createToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  );
  const sig = btoa("kipflix-secret-" + userId).slice(0, 24);
  return `${header}.${payload}.${sig}`;
}
function parseToken(token: string | null): { sub: string } | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Storage helpers                                                     */
/* ------------------------------------------------------------------ */
function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(u: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
function readMovies(): Movie[] {
  try {
    return JSON.parse(localStorage.getItem(MOVIES_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeMovies(m: Movie[]) {
  localStorage.setItem(MOVIES_KEY, JSON.stringify(m));
}

export function seedIfNeeded() {
  if (!localStorage.getItem(SEED_FLAG)) {
    writeMovies(SEED_MOVIES);
    const admin: StoredUser = {
      id: uid(),
      name: "KipFlix Admin",
      email: "admin@kipflix.com",
      role: "admin",
      passwordHash: hashPassword("admin123"),
      favorites: [],
      watchHistory: [],
      createdAt: new Date().toISOString(),
    };
    const demo: StoredUser = {
      id: uid(),
      name: "Demo Viewer",
      email: "demo@kipflix.com",
      role: "user",
      passwordHash: hashPassword("demo123"),
      favorites: ["neon-samurai", "echoes-of-andromeda"],
      watchHistory: [
        { movieId: "nightfall-protocol", watchedAt: new Date().toISOString() },
        { movieId: "quantum-heist", watchedAt: new Date(Date.now() - 8e7).toISOString() },
      ],
      createdAt: new Date().toISOString(),
    };
    writeUsers([admin, demo]);
    localStorage.setItem(SEED_FLAG, "1");
  }
  // ensure movies exist even if cleared
  if (readMovies().length === 0) writeMovies(SEED_MOVIES);
}

function strip(u: StoredUser): User {
  const { passwordHash, ...rest } = u;
  void passwordHash;
  return rest;
}
function requireUser(token: string | null): StoredUser {
  const payload = parseToken(token);
  if (!payload) throw new Error("Not authenticated. Please sign in again.");
  const user = readUsers().find((u) => u.id === payload.sub);
  if (!user) throw new Error("Account not found.");
  return user;
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */
export const api = {
  /* ---- AUTH ---- */
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    await delay();
    name = name.trim();
    email = email.trim().toLowerCase();
    if (!name || !email || !password) throw new Error("All fields are required.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email address.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const users = readUsers();
    if (users.some((u) => u.email === email))
      throw new Error("An account with this email already exists.");
    const user: StoredUser = {
      id: uid(),
      name,
      email,
      role: "user",
      passwordHash: hashPassword(password),
      favorites: [],
      watchHistory: [],
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    writeUsers(users);
    return { token: createToken(user.id), user: strip(user) };
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    await delay();
    email = email.trim().toLowerCase();
    const user = readUsers().find((u) => u.email === email);
    if (!user || !verifyPassword(password, user.passwordHash))
      throw new Error("Invalid email or password.");
    return { token: createToken(user.id), user: strip(user) };
  },

  async getUser(token: string | null): Promise<User> {
    await delay(80);
    return strip(requireUser(token));
  },

  async updateProfile(token: string | null, name: string): Promise<User> {
    await delay();
    const me = requireUser(token);
    const users = readUsers();
    const u = users.find((x) => x.id === me.id)!;
    u.name = name.trim() || u.name;
    writeUsers(users);
    return strip(u);
  },

  /* ---- MOVIES ---- */
  async getMovies(): Promise<Movie[]> {
    await delay(120);
    return readMovies();
  },

  async getMovie(id: string): Promise<Movie> {
    await delay(80);
    const m = readMovies().find((x) => x.id === id);
    if (!m) throw new Error("Movie not found.");
    return m;
  },

  async incrementViews(id: string): Promise<void> {
    const movies = readMovies();
    const m = movies.find((x) => x.id === id);
    if (m) {
      m.views += 1;
      writeMovies(movies);
    }
  },

  async createMovie(token: string | null, data: Partial<Movie>): Promise<Movie> {
    await delay();
    const me = requireUser(token);
    if (me.role !== "admin") throw new Error("Admin access required.");
    if (!data.title?.trim()) throw new Error("Title is required.");
    const movies = readMovies();
    const id =
      (data.title || "untitled")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      uid().slice(0, 4);
    const movie: Movie = {
      id,
      title: data.title!.trim(),
      description: data.description?.trim() || "No description provided.",
      genre: data.genre?.length ? data.genre : ["Drama"],
      year: data.year || new Date().getFullYear(),
      rating: data.rating ?? 7.5,
      duration: data.duration || 100,
      thumbnailUrl: data.thumbnailUrl?.trim() || undefined,
      accent: data.accent || "#e11d2e",
      videoUrl: data.videoUrl?.trim() || SEED_MOVIES[0].videoUrl,
      trailerUrl: data.trailerUrl?.trim() || data.videoUrl?.trim() || SEED_MOVIES[0].trailerUrl,
      views: 0,
      createdAt: new Date().toISOString(),
    };
    movies.unshift(movie);
    writeMovies(movies);
    return movie;
  },

  async updateMovie(token: string | null, id: string, data: Partial<Movie>): Promise<Movie> {
    await delay();
    const me = requireUser(token);
    if (me.role !== "admin") throw new Error("Admin access required.");
    const movies = readMovies();
    const m = movies.find((x) => x.id === id);
    if (!m) throw new Error("Movie not found.");
    Object.assign(m, {
      title: data.title?.trim() ?? m.title,
      description: data.description?.trim() ?? m.description,
      genre: data.genre?.length ? data.genre : m.genre,
      year: data.year ?? m.year,
      rating: data.rating ?? m.rating,
      duration: data.duration ?? m.duration,
      thumbnailUrl: data.thumbnailUrl !== undefined ? data.thumbnailUrl.trim() || undefined : m.thumbnailUrl,
      accent: data.accent ?? m.accent,
      videoUrl: data.videoUrl?.trim() || m.videoUrl,
      trailerUrl: data.trailerUrl?.trim() || m.trailerUrl,
    });
    writeMovies(movies);
    return m;
  },

  async deleteMovie(token: string | null, id: string): Promise<void> {
    await delay();
    const me = requireUser(token);
    if (me.role !== "admin") throw new Error("Admin access required.");
    writeMovies(readMovies().filter((x) => x.id !== id));
  },

  /* ---- FAVORITES ---- */
  async toggleFavorite(token: string | null, movieId: string): Promise<User> {
    await delay(120);
    const me = requireUser(token);
    const users = readUsers();
    const u = users.find((x) => x.id === me.id)!;
    u.favorites = u.favorites.includes(movieId)
      ? u.favorites.filter((f) => f !== movieId)
      : [...u.favorites, movieId];
    writeUsers(users);
    return strip(u);
  },

  /* ---- HISTORY ---- */
  async addHistory(token: string | null, movieId: string): Promise<User> {
    await delay(60);
    const me = requireUser(token);
    const users = readUsers();
    const u = users.find((x) => x.id === me.id)!;
    u.watchHistory = [
      { movieId, watchedAt: new Date().toISOString() },
      ...u.watchHistory.filter((h) => h.movieId !== movieId),
    ].slice(0, 30);
    writeUsers(users);
    return strip(u);
  },

  async clearHistory(token: string | null): Promise<User> {
    await delay();
    const me = requireUser(token);
    const users = readUsers();
    const u = users.find((x) => x.id === me.id)!;
    u.watchHistory = [];
    writeUsers(users);
    return strip(u);
  },
};
