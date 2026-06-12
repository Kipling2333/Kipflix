import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { useToast } from "../context/ToastContext";
import { api } from "../lib/api";
import type { Movie } from "../lib/types";
import { GENRES, fmtViews, trending } from "../lib/helpers";
import { Chart, Edit, Trash, Plus, X, Star, Film, TrendUp } from "../components/icons";

const empty = {
  title: "",
  description: "",
  genre: [] as string[],
  year: new Date().getFullYear(),
  rating: 7.5,
  duration: 100,
  thumbnailUrl: "",
  videoUrl: "",
  trailerUrl: "",
  accent: "#e11d2e",
};

export default function Admin() {
  const { token } = useAuth();
  const { movies, refresh } = useCatalog();
  const toast = useToast();
  const [editing, setEditing] = useState<Movie | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [muxId, setMuxId] = useState("");
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const totalViews = movies.reduce((s, m) => s + m.views, 0);
    const avg = movies.length ? movies.reduce((s, m) => s + m.rating, 0) / movies.length : 0;
    return { count: movies.length, totalViews, avg, top: trending(movies).slice(0, 5) };
  }, [movies]);

  const maxViews = stats.top[0]?.views || 1;

  const applyMuxId = (id: string) => {
    const clean = id.trim();
    setMuxId(clean);
    if (clean) {
      setForm((f) => ({
        ...f,
        videoUrl: `https://stream.mux.com/${clean}.m3u8`,
        thumbnailUrl: `https://image.mux.com/${clean}/thumbnail.jpg`,
      }));
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty });
    setMuxId("");
    setOpen(true);
  };

  const openEdit = (m: Movie) => {
    setEditing(m);
    setMuxId("");
    setForm({
      title: m.title,
      description: m.description,
      genre: m.genre,
      year: m.year,
      rating: m.rating,
      duration: m.duration,
      thumbnailUrl: m.thumbnailUrl || "",
      videoUrl: m.videoUrl,
      trailerUrl: m.trailerUrl,
      accent: m.accent,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateMovie(token, editing.id, form);
        toast("Movie updated", "success");
      } else {
        await api.createMovie(token, form);
        toast("Movie published", "success");
      }
      await refresh();
      setOpen(false);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: Movie) => {
    if (!confirm(`Delete "${m.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteMovie(token, m.id);
      await refresh();
      toast("Movie deleted", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const toggleGenre = (g: string) =>
    setForm((f) => ({
      ...f,
      genre: f.genre.includes(g) ? f.genre.filter((x) => x !== g) : [...f.genre, g],
    }));

  return (
    <div className="min-h-screen pb-20 pt-20 md:pb-10">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-500">
              <Chart className="h-4 w-4" /> Admin
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Content Dashboard</h1>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-colors hover:bg-red-500"
          >
            <Plus className="h-4 w-4" /> Add Movie
          </button>
        </div>

        {/* stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<Film className="h-5 w-5" />} label="Total Movies" value={String(stats.count)} />
          <Stat icon={<TrendUp className="h-5 w-5" />} label="Total Views" value={fmtViews(stats.totalViews)} />
          <Stat icon={<Star className="h-5 w-5" />} label="Avg Rating" value={stats.avg.toFixed(1)} />
          <Stat icon={<Chart className="h-5 w-5" />} label="Genres" value={String(GENRES.length)} />
        </div>

        {/* top performers */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-400">Top Performing</h3>
            <div className="space-y-3">
              {stats.top.map((m, i) => (
                <div key={m.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate font-medium text-zinc-200">
                      {i + 1}. {m.title}
                    </span>
                    <span className="shrink-0 text-zinc-500">{fmtViews(m.views)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
                      style={{ width: `${(m.views / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* movie table */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] lg:col-span-2">
            <div className="border-b border-white/5 px-5 py-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-400">
                Library ({movies.length})
              </h3>
            </div>
            <div className="max-h-[520px] overflow-y-auto">
              {movies.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 border-b border-white/5 px-5 py-3 last:border-0 hover:bg-white/[0.02]"
                >
                  <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-zinc-800">
                    {m.thumbnailUrl ? (
                      <img src={m.thumbnailUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="h-full w-full" style={{ background: m.accent }} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-100">{m.title}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {m.year} · {m.genre.join(", ")}
                    </p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-semibold text-zinc-200">{fmtViews(m.views)}</p>
                    <p className="text-xs text-zinc-500">views</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(m)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white"
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(m)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-500/20 hover:text-red-400"
                      aria-label="Delete"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* modal */}
      {open && (
        <div className="animate-fade fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-8" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
            className="animate-scale-in my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? "Edit Movie" : "Add New Movie"}</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-zinc-400 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MUX PLAYBACK ID */}
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-400">Mux Video</p>
              <Field label="Mux Playback ID (auto-fills video & thumbnail)">
                <input
                  value={muxId}
                  onChange={(e) => applyMuxId(e.target.value)}
                  className={inputCls}
                  placeholder="Paste your Mux Playback ID here..."
                />
              </Field>
              {muxId && (
                <p className="mt-2 text-xs text-green-400">
                  ✓ Video and thumbnail URLs auto-filled from Mux
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" className="sm:col-span-2">
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Movie title" />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Short synopsis" />
              </Field>
              <Field label="Year">
                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} className={inputCls} />
              </Field>
              <Field label="Duration (min)">
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} className={inputCls} />
              </Field>
              <Field label="Rating (0-10)">
                <input type="number" step="0.1" min="0" max="10" value={form.rating} onChange={(e) => setForm({ ...form, rating: +e.target.value })} className={inputCls} />
              </Field>
              <Field label="Poster accent color">
                <div className="flex items-center gap-2">
                  <input type="color" value={form.accent} onChange={(e) => setForm({ ...form, accent: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
                  <span className="text-xs text-zinc-500">Used for the generated poster</span>
                </div>
              </Field>
              <Field label="Thumbnail URL (auto-filled from Mux)" className="sm:col-span-2">
                <input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} className={inputCls} placeholder="https://image.mux.com/..." />
              </Field>
              <Field label="Video URL (auto-filled from Mux)" className="sm:col-span-2">
                <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className={inputCls} placeholder="https://stream.mux.com/...m3u8" />
              </Field>
              <Field label="Trailer URL (YouTube embed)" className="sm:col-span-2">
                <input value={form.trailerUrl} onChange={(e) => setForm({ ...form, trailerUrl: e.target.value })} className={inputCls} placeholder="https://www.youtube.com/embed/..." />
              </Field>
              <Field label="Genres" className="sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => toggleGenre(g)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        form.genre.includes(g) ? "bg-red-600 text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/10">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60">
                {saving ? "Saving…" : editing ? "Save Changes" : "Publish Movie"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-red-500/50";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600/15 text-red-400">{icon}</div>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}