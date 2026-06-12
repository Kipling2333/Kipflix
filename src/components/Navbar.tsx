import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import { Search, UserIcon, Logout, Chart } from "./icons";

const links = [
  { to: "/home", label: "Home" },
  { to: "/search", label: "Browse" },
  { to: "/profile", label: "My List" },
];

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-white/5 bg-[#08080b]/90 backdrop-blur-md" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Logo />
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`
                }
              >
                <Chart className="h-4 w-4" /> Admin
              </NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => nav("/search")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                onBlur={() => setTimeout(() => setMenu(false), 150)}
                className="flex items-center gap-2 rounded-full bg-white/5 py-1 pl-1 pr-2 ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-xs font-bold text-white">
                  {user.name[0].toUpperCase()}
                </span>
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-zinc-200 sm:block">
                  {user.name.split(" ")[0]}
                </span>
              </button>
              {menu && (
                <div className="animate-scale-in absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-md">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
                  >
                    <UserIcon className="h-4 w-4" /> Profile & Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
                    >
                      <Chart className="h-4 w-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      nav("/");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <Logout className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-colors hover:bg-red-500"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
