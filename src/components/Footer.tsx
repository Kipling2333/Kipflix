import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-black/40 px-4 pb-24 pt-12 sm:px-6 md:pb-12 lg:px-10">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo variant="full" className="max-w-[220px]" />
            <p className="mt-3 max-w-xs text-sm text-zinc-500">
              Movies. Anytime. Anywhere. Stream thousands of films in cinematic quality on any device.
            </p>
          </div>
          {[
            { h: "Browse", links: ["Trending", "New Releases", "Top Rated", "Genres"] },
            { h: "Company", links: ["About KipFlix", "Careers", "Press", "Blog"] },
            { h: "Support", links: ["Help Center", "Devices", "Terms of Use", "Privacy"] },
          ].map((c) => (
            <div key={c.h}>
              <h4 className="mb-3 text-sm font-bold text-zinc-200">{c.h}</h4>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-zinc-300">
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} KipFlix. A demo streaming platform.</p>
          <p>Crafted with cinematic care 🎬</p>
        </div>
      </div>
    </footer>
  );
}
