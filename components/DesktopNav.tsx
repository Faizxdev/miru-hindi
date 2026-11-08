"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { HomeIcon, MagnifyingGlassIcon, TvIcon, FilmIcon, SwatchIcon, Square3Stack3DIcon, CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";

import { useSettings } from "@/contexts/SettingsContext";

type RoutePath = "/" | "/search" | "/series" | "/movies" | "/anime" | "/cartoon" | "/schedule" | "/upcoming" | "/my-list" | "/watch-history";
type Item = { label: string; href: RoutePath; icon: (active: boolean) => JSX.Element };

function HomeIconComponent(active: boolean) {
  return <HomeIcon className={(active ? "text-accent" : "text-content-secondary") + " h-5 w-5 transition-colors duration-200"} />;
}

function SearchIconComponent(active: boolean) {
  return <MagnifyingGlassIcon className={(active ? "text-accent" : "text-content-secondary") + " h-5 w-5 transition-colors duration-200"} />;
}

function SeriesIconComponent(active: boolean) {
  return <TvIcon className={(active ? "text-accent" : "text-content-secondary") + " h-5 w-5 transition-colors duration-200"} />;
}

function MoviesIconComponent(active: boolean) {
  return <FilmIcon className={(active ? "text-accent" : "text-content-secondary") + " h-5 w-5 transition-colors duration-200"} />;
}

function AnimeIconComponent(active: boolean) {
  return <SwatchIcon className={(active ? "text-accent" : "text-content-secondary") + " h-5 w-5 transition-colors duration-200"} />;
}

function CartoonIconComponent(active: boolean) {
  return <Square3Stack3DIcon className={(active ? "text-accent" : "text-content-secondary") + " h-5 w-5 transition-colors duration-200"} />;
}

function ScheduleIconComponent(active: boolean) {
  return <CalendarDaysIcon className={(active ? "text-accent" : "text-content-secondary") + " h-5 w-5 transition-colors duration-200"} />;
}

function UpcomingIconComponent(active: boolean) {
  return <ClockIcon className={(active ? "text-accent" : "text-content-secondary") + " h-5 w-5 transition-colors duration-200"} />;
}

export default function DesktopNav() {
  const pathname = usePathname();
  const { settings } = useSettings();

  const items: Item[] = useMemo(() => {
    const baseItems: Item[] = [
      { label: "Home", href: "/", icon: HomeIconComponent },
      { label: "Search", href: "/search", icon: SearchIconComponent },
      { label: "Series", href: "/series", icon: SeriesIconComponent },
      { label: "Movies", href: "/movies", icon: MoviesIconComponent },
      { label: "Anime", href: "/anime", icon: AnimeIconComponent },
      { label: "Cartoon", href: "/cartoon", icon: CartoonIconComponent },
    ];

    if (settings) {
      if (!settings.hide_schedule) {
        baseItems.push({ label: "Schedule", href: "/schedule", icon: ScheduleIconComponent });
      }
      if (!settings.hide_upcoming) {
        baseItems.push({ label: "Upcoming", href: "/upcoming", icon: UpcomingIconComponent });
      }
    }
    
    return baseItems;
  }, [settings]);

  return (
    <nav className="hidden md:block fixed bottom-0 inset-x-0 z-50 bg-bg-surface border-t border-border-subtle safe-area-bottom">
      <div className="max-w-[1280px] mx-auto px-12">
        <ul className="flex justify-center space-x-12 py-3">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== "/" && pathname?.startsWith(it.href));
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="flex flex-col items-center gap-1 py-1 px-2 rounded transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                  aria-current={active ? "page" : undefined}
                >
                  {/* Active indicator dot */}
                  <div className={`w-1 h-1 rounded-full mb-1 transition-colors ${active ? "bg-accent" : "bg-transparent"}`} />
                  
                  {/* Icon */}
                  <div>
                    {it.icon(active)}
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[11px] font-medium tracking-wide transition-colors ${active ? "text-accent" : "text-content-tertiary"}`}>
                    {it.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
