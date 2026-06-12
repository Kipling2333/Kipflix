export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  favorites: string[];
  watchHistory: { movieId: string; watchedAt: string }[];
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  year: number;
  rating: number;
  duration: number; // minutes
  thumbnailUrl?: string; // real key-art for featured titles
  accent: string; // hex for procedural posters
  videoUrl: string;
  trailerUrl: string;
  views: number;
  featured?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
