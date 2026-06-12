import { NavLink } from "react-router-dom";
import { Home, Search, Heart, UserIcon } from "./icons";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/search", label: "Browse", Icon: Search },
  { to: "/profile", label: "My List", Icon: Heart },
  { to: "/profile", label: "Me", Icon: UserIcon, key: "me" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0e]/95 backdrop-blur-lg md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ to, label, Icon, key }) => (
          <NavLink
            key={key || to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive ? "text-red-500" : "text-zinc-500"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
