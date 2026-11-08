import type { Metadata } from "next";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import OngoingSeriesClient from "./OngoingSeriesClient";
import { absoluteUrl } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Ongoing Anime Series - Currently Airing",
  description:
    "Watch currently airing anime series and ongoing shows on Miru Hindi. Stay updated with the latest episodes in HD. Hindi dubbed and English subbed.",
  alternates: { canonical: absoluteUrl("/ongoing") },
};

export default function OngoingPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  const page = Number(searchParams?.page || 1);
  const query = searchParams?.q || "";

  return (
    <div className="min-h-screen bg-bg-base text-content-primary font-sans selection:bg-accent/30 selection:text-accent">
      <NewNavbar />

      <main className="w-full px-4 md:px-6 py-12 space-y-12 pb-32">
        <div className="space-y-4">
          <h1 className="section-heading text-4xl md:text-5xl font-serif">Ongoing Series</h1>
          <p className="section-subtitle max-w-2xl text-lg">
            Currently airing anime series and ongoing shows. Stay updated with the latest releases.
          </p>
        </div>

        <OngoingSeriesClient initialPage={page} initialQuery={query} />
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
