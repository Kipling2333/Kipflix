import { useEffect, useRef } from "react";
import Hls from "hls.js";
import type { Movie } from "../lib/types";
import { X } from "./icons";

export function PlayerModal({
  movie,
  mode,
  onClose,
}: {
  movie: Movie;
  mode: "trailer" | "full";
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = mode === "trailer" ? movie.trailerUrl : movie.videoUrl;
  const isHls = src?.includes(".m3u8");
  const isYoutube = src?.includes("youtube.com") || src?.includes("youtu.be");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src || isYoutube) return;

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        video.src = src;
        video.play();
      }
    } else {
      video.src = src;
      video.play();
    }
  }, [src, isHls, isYoutube]);

  return (
    <div
      className="animate-fade fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-0 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="animate-scale-in relative w-full max-w-5xl overflow-hidden bg-black sm:rounded-2xl sm:ring-1 sm:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-red-500">
              {mode === "trailer" ? "Official Trailer" : "Now Playing"}
            </p>
            <h3 className="truncate text-base font-bold text-white">{movie.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          {isYoutube ? (
            <iframe
              src={src}
              className="h-full w-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              key={src}
              controls
              playsInline
              poster={movie.thumbnailUrl}
              className="h-full w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}