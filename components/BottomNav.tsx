"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { HomeIcon as HomeOutline, MagnifyingGlassIcon, BookmarkIcon, UserIcon, RectangleStackIcon, FilmIcon } from "@heroicons/react/24/outline";

type RoutePath = "/" | "/anime" | "/movies" | "/search" | "/list" | "/profile";
type Item = { label: string; href: RoutePath; icon: (active: boolean) => JSX.Element };

function HomeIcon(active: boolean) {
  return <HomeOutline className={(active ? "scale-110 text-primary " : "text-text-dim ") + "h-6 w-6 transition-transform"} />;
}
function SearchIcon(active: boolean) {
  return <MagnifyingGlassIcon className={(active ? "scale-110 text-primary " : "text-text-dim ") + "h-6 w-6 transition-transform"} />;
}
function ListIcon(active: boolean) {
  return <BookmarkIcon className={(active ? "scale-110 text-primary " : "text-text-dim ") + "h-6 w-6 transition-transform"} />;
}
function ProfileIcon(active: boolean) {
  return <UserIcon className={(active ? "scale-110 text-primary " : "text-text-dim ") + "h-6 w-6 transition-transform"} />;
}
function AnimeIcon(active: boolean) {
  return <RectangleStackIcon className={(active ? "scale-110 text-primary " : "text-text-dim ") + "h-6 w-6 transition-transform"} />;
}
function MoviesIcon(active: boolean) {
  return <FilmIcon className={(active ? "scale-110 text-primary " : "text-text-dim ") + "h-6 w-6 transition-transform"} />;
}

export default function BottomNav() {
  const pathname = usePathname();
  const items: Item[] = useMemo(() => ([
    { label: "Home", href: "/", icon: HomeIcon },
    { label: "Anime", href: "/anime", icon: AnimeIcon },
    { label: "Movies", href: "/movies", icon: MoviesIcon },
    { label: "Search", href: "/search", icon: SearchIcon },
    { label: "My List", href: "/list", icon: ListIcon },
    { label: "Profile", href: "/profile", icon: ProfileIcon },
  ]), []);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-stroke bg-bg-900/90 backdrop-blur">
      <ul className="grid grid-cols-6 px-2 py-2">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname?.startsWith(it.href));
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className="w-full flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                aria-current={active ? "page" : undefined}
              >
                {it.icon(active)}
                <span className={active ? "text-text-high" : "text-text-dim"}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}


