import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import Link from "next/link";
import { BASE } from "@/server/scraper";

export default function NetworksPage() {
  const networks = [
    {
      name: "Crunchyroll",
      slug: "crunchyroll",
      image: `${BASE}/wp-content/uploads/crunchyroll-193x193.png`,
      description: "Premium anime streaming platform",
    },
    {
      name: "Disney+ Hotstar",
      slug: "disney",
      image: `${BASE}/wp-content/uploads/hotstar-193x193.png`,
      description: "Disney, Marvel, and Star content",
    },
    {
      name: "Netflix",
      slug: "netflix",
      image: `${BASE}/wp-content/uploads/netflix-193x193.png`,
      description: "Global streaming entertainment",
    },
    {
      name: "Prime Video",
      slug: "prime-video",
      image: `${BASE}/wp-content/uploads/primevideo-193x193.png`,
      description: "Amazon's streaming service",
    },
    {
      name: "Cartoon Network",
      slug: "cartoon-network",
      image: `${BASE}/wp-content/uploads/cartoonnetwork-193x193.png`,
      description: "Kids and family entertainment",
    },
    {
      name: "Sony Yay",
      slug: "sony-yay",
      image: `${BASE}/wp-content/uploads/sonyay-193x193.png`,
      description: "Sony's kids entertainment channel",
    },
    {
      name: "Hungama TV",
      slug: "hungama-tv",
      image: `${BASE}/wp-content/uploads/hungama-193x193.png`,
      description: "Indian kids entertainment",
    },
    {
      name: "Disney Channel",
      slug: "disney-channel",
      image: `${BASE}/wp-content/uploads/disney-193x193.png`,
      description: "Classic Disney channel content",
    }
  ];

  return (
    <div className="min-h-screen bg-bg-base text-content-primary font-sans selection:bg-accent/30 selection:text-accent">
      <NewNavbar />

      <main className="w-full px-4 md:px-6 py-12 space-y-12 pb-32">
        <div className="space-y-4">
          <h1 className="section-heading text-4xl md:text-5xl font-serif">Networks</h1>
          <p className="section-subtitle max-w-2xl text-lg">
            Browse content by streaming platform. Discover exclusive titles from your favorite networks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {networks.map((network) => (
            <Link
              key={network.slug}
              href={`/networks/${network.slug}`}
              className="group relative"
            >
              <div className="h-full bg-bg-surface border border-border-subtle rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-500 hover:border-accent/20 hover:bg-bg-elevated hover:shadow-2xl hover:shadow-accent/5">
                <div className="w-24 h-24 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-105">
                  <img
                    src={network.image}
                    alt={network.name}
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold font-serif mb-3 group-hover:text-accent transition-colors duration-300">
                  {network.name}
                </h3>
                <p className="text-content-tertiary text-sm leading-relaxed">
                  {network.description}
                </p>
                
                {/* Arrow Icon */}
                <div className="mt-6 w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-content-tertiary group-hover:bg-accent group-hover:text-bg-base group-hover:border-accent transition-all duration-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
