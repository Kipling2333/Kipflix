import { Link } from "react-router-dom";

/**
 * KipFlix brand logo.
 * - variant "wordmark" (default): compact icon + KipFlix text, ideal for the navbar.
 * - variant "full": the full brand lockup image (tagline + reel), for auth / hero.
 */
export function Logo({
  className = "",
  variant = "wordmark",
}: {
  className?: string;
  variant?: "wordmark" | "full";
}) {
  if (variant === "full") {
    return (
      <Link to="/" className={`inline-block ${className}`}>
        <img
          src="/brand/kipflix-logo.png"
          alt="KipFlix — Movies. Anytime. Anywhere."
          className="h-auto w-full max-w-[260px] object-contain"
        />
      </Link>
    );
  }

  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <img
        src="/brand/kipflix-icon.png"
        alt="KipFlix"
        className="h-9 w-9 rounded-lg object-contain transition-transform group-hover:scale-105"
      />
      <span className="text-xl font-black italic tracking-tight">
        <span className="text-white">Kip</span>
        <span className="bg-gradient-to-b from-red-500 to-red-700 bg-clip-text text-transparent">
          Flix
        </span>
      </span>
    </Link>
  );
}
