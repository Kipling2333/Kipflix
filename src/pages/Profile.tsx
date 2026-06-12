import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { useToast } from "../context/ToastContext";
import { MovieCard } from "../components/MovieCard";
import { Footer } from "../components/Footer";
import type { Movie } from "../lib/types";
import { Heart, Clock, Settings, Logout } from "../components/icons";
import { useNavigate } from "react-router-dom";

type Tab = "list" | "history" | "settings";

export default function Profile() {
  const { user, logout, clearHistory, updateName } = useAuth();
  const { movies } = useCatalog();
  const toast = useToast();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("list");
  const [name, setName] = useState(user?.name || "");

  const favorites = useMemo(
    () => (user ? (user.favorites.map((id) => movies.find((m) => m.id === id)).filter(Boolean) as Movie[]) : []),
    [user, movies]
  );
  const history = useMemo(
    () =>
      user
        ? (user.watchHistory
            .map((h) => {
              const m = movies.find((x) => x.id === h.movieId);
              return m ? { m, at: h.watchedAt } : null;
            })
            .filter(Boolean) as { m: Movie; at: string }[])
        : [],
    [user, movies]
  );

  if (!user) return null;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "list", label: "My List", icon: <Heart className="h-4 w-4" />, count: favorites.length },
    { key: "history", label: "Watch History", icon: <Clock className="h-4 w-4" />, count: history.length },
    { key: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen pb-20 pt-16 md:pb-0">
      {/* header */}
      <div className="border-b border-white/5 bg-gradient-to-b from-zinc-900/60 to-transparent">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-10">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-2xl font-black text-white shadow-lg">
            {user.name[0].toUpperCase()}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
              {user.role === "admin" && (
                <span className="rounded-full bg-red-600/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-red-400">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400">{user.email}</p>
            <p className="mt-1 text-xs text-zinc-600">
              Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              nav("/");
            }}
            className="flex items-center gap-2 self-start rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10"
          >
            <Logout className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        {/* tabs */}
        <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto border-b border-white/5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.key ? "border-red-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && (
                <span className="rounded-full bg-white/10 px-1.5 text-xs">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "list" &&
            (favorites.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {favorites.map((m) => (
                  <div key={m.id} className="mx-auto w-full max-w-[200px]">
                    <MovieCard movie={m} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                emoji="❤️"
                title="Your list is empty"
                sub="Tap the heart on any movie to save it here for later."
              />
            ))}

          {tab === "history" && (
            <>
              {history.length > 0 && (
                <div className="mb-5 flex justify-end">
                  <button
                    onClick={async () => {
                      await clearHistory();
                      toast("Watch history cleared", "success");
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10"
                  >
                    Clear history
                  </button>
                </div>
              )}
              {history.length ? (
                <div className="space-y-3">
                  {history.map(({ m, at }) => (
                    <Link
                      key={m.id + at}
                      to={`/movie/${m.id}`}
                      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                        {m.thumbnailUrl ? (
                          <img src={m.thumbnailUrl} className="h-full w-full object-cover" alt={m.title} />
                        ) : (
                          <div className="h-full w-full" style={{ background: m.accent }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-zinc-100">{m.title}</p>
                        <p className="text-xs text-zinc-500">
                          {m.genre.join(" · ")} · {m.year}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-zinc-500">
                        {new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <Empty emoji="🕗" title="No watch history yet" sub="Movies you play will appear here." />
              )}
            </>
          )}

          {tab === "settings" && (
            <div className="max-w-lg space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-base font-bold text-white">Account</h3>
                <label className="mt-4 block text-sm text-zinc-400">Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500/50"
                />
                <label className="mt-4 block text-sm text-zinc-400">Email</label>
                <input
                  value={user.email}
                  disabled
                  className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-500 outline-none"
                />
                <button
                  onClick={async () => {
                    await updateName(name);
                    toast("Profile updated", "success");
                  }}
                  className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
                >
                  Save changes
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-base font-bold text-white">Preferences</h3>
                {[
                  ["Autoplay next episode", true],
                  ["Autoplay previews while browsing", true],
                  ["Email me about new releases", false],
                ].map(([label, on]) => (
                  <div key={label as string} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-zinc-300">{label}</span>
                    <Toggle defaultOn={on as boolean} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Empty({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
      <div className="text-5xl">{emoji}</div>
      <p className="text-lg font-semibold text-zinc-300">{title}</p>
      <p className="text-sm text-zinc-500">{sub}</p>
      <Link to="/home" className="mt-3 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white">
        Browse movies
      </Link>
    </div>
  );
}

function Toggle({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn((o) => !o)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-red-600" : "bg-zinc-700"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}
