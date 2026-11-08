import { SeriesListItem } from "@/server/types";
import { HeroItem } from "./heroData";

export const FALLBACK_FEATURED: HeroItem[] = [
  {
    id: "solo-leveling",
    title: "Solo Leveling (Hindi Dub)",
    slug: "solo-leveling",
    backdropUrl: "https://image.tmdb.org/t/p/original/4uB3oOq6p2a1G8oD6y4pQf3kFk2.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuPxJ8BGdM.jpg",
    description: "In a world where hunters must battle deadly monsters, weak hunter Sung Jinwoo is chosen by a mysterious Program.",
    genres: ["Action", "Fantasy", "Adventure"],
    year: 2024,
    rating: "8.7",
    episodeCount: 12,
    badge: "TRENDING IN HINDI",
    watchUrl: "/watch/solo-leveling",
    titleUrl: "/title/solo-leveling"
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen (Hindi Dub)",
    slug: "jujutsu-kaisen",
    backdropUrl: "https://image.tmdb.org/t/p/original/gmECkdDc79kig19qZkO6v477qT8.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/hD8pZg03qG8u3oB7lW1sE7yH7oN.jpg",
    description: "Yuji Itadori swallows a cursed talisman and becomes host to Sukuna, the King of Curses, plunging into sorcery.",
    genres: ["Action", "Supernatural", "Shonen"],
    year: 2023,
    rating: "8.6",
    episodeCount: 47,
    badge: "POPULAR",
    watchUrl: "/watch/jujutsu-kaisen",
    titleUrl: "/title/jujutsu-kaisen"
  },
  {
    id: "demon-slayer-kimetsu-no-yaiba",
    title: "Demon Slayer: Kimetsu no Yaiba (Hindi)",
    slug: "demon-slayer-kimetsu-no-yaiba",
    backdropUrl: "https://image.tmdb.org/t/p/original/nTvM4mhqZlHI0B1bwhQry0q50f7.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    description: "Tanjiro Kamado embarks on a perilous quest to avenge his slaughtered family and cure his demon-turned sister Nezuko.",
    genres: ["Action", "Fantasy", "Historical"],
    year: 2024,
    rating: "8.7",
    episodeCount: 55,
    badge: "HASHIRA ARC",
    watchUrl: "/watch/demon-slayer-kimetsu-no-yaiba",
    titleUrl: "/title/demon-slayer-kimetsu-no-yaiba"
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan (Hindi Dub)",
    slug: "attack-on-titan",
    backdropUrl: "https://image.tmdb.org/t/p/original/vN0BqY9K5QJ2i1G6u0R2T2k5G9P.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/8C5LLQTm6ih4FkM4wU1D3vG0K4k.jpg",
    description: "Humanity fights for survival inside concentric walls protecting them from colossal humanoid Titans.",
    genres: ["Action", "Mystery", "Drama"],
    year: 2023,
    rating: "9.1",
    episodeCount: 89,
    badge: "MASTERPIECE",
    watchUrl: "/watch/attack-on-titan",
    titleUrl: "/title/attack-on-titan"
  },
  {
    id: "naruto-shippuden",
    title: "Naruto Shippuden (Hindi Dub)",
    slug: "naruto-shippuden",
    backdropUrl: "https://image.tmdb.org/t/p/original/7W8m1k6K8G3y4pT9Q1w6s5r2H9k.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/kV27gh2Mr7E6o4o4XjQ7V5hK1m.jpg",
    description: "Naruto Uzumaki returns to the Hidden Leaf village stronger and determined to save his friend Sasuke from the darkness.",
    genres: ["Action", "Adventure", "Martial Arts"],
    year: 2017,
    rating: "8.7",
    episodeCount: 500,
    badge: "ALL-TIME CLASSIC",
    watchUrl: "/watch/naruto-shippuden",
    titleUrl: "/title/naruto-shippuden"
  },
  {
    id: "one-piece",
    title: "One Piece (Hindi Sub & Dub)",
    slug: "one-piece",
    backdropUrl: "https://image.tmdb.org/t/p/original/4MCKNAc6AbWjEsM2Cr9hR5C4V6r.jpg",
    posterUrl: "https://image.tmdb.org/t/p/w500/fcXdJlbSdUEeMSJFsXK9g2whNTn.jpg",
    description: "Monkey D. Luffy and his Straw Hat crew sail the treacherous Grand Line in search of the legendary One Piece treasure.",
    genres: ["Action", "Adventure", "Fantasy"],
    year: 2024,
    rating: "8.9",
    episodeCount: 1120,
    badge: "EGGHEAD ARC",
    watchUrl: "/watch/one-piece",
    titleUrl: "/title/one-piece"
  }
];

export const FALLBACK_SERIES: SeriesListItem[] = [
  {
    title: "Solo Leveling (Hindi Dubbed)",
    url: "https://animesalt.cx/series/solo-leveling/",
    image: "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuPxJ8BGdM.jpg"
  },
  {
    title: "Jujutsu Kaisen Season 2 (Hindi Dubbed)",
    url: "https://animesalt.cx/series/jujutsu-kaisen/",
    image: "https://image.tmdb.org/t/p/w500/hD8pZg03qG8u3oB7lW1sE7yH7oN.jpg"
  },
  {
    title: "Demon Slayer: Hashira Training Arc (Hindi Dubbed)",
    url: "https://animesalt.cx/series/demon-slayer-kimetsu-no-yaiba/",
    image: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg"
  },
  {
    title: "Naruto Shippuden (Hindi Dubbed)",
    url: "https://animesalt.cx/series/naruto-shippuden/",
    image: "https://image.tmdb.org/t/p/w500/kV27gh2Mr7E6o4o4XjQ7V5hK1m.jpg"
  },
  {
    title: "Attack on Titan Final Season (Hindi Dubbed)",
    url: "https://animesalt.cx/series/attack-on-titan/",
    image: "https://image.tmdb.org/t/p/w500/8C5LLQTm6ih4FkM4wU1D3vG0K4k.jpg"
  },
  {
    title: "Bleach: Thousand-Year Blood War (Hindi Dubbed)",
    url: "https://animesalt.cx/series/bleach-thousand-year-blood-war/",
    image: "https://image.tmdb.org/t/p/w500/2Eewgp7o5AU1xCjrXY9HBqFgviK.jpg"
  },
  {
    title: "One Piece (Hindi Subbed)",
    url: "https://animesalt.cx/series/one-piece/",
    image: "https://image.tmdb.org/t/p/w500/fcXdJlbSdUEeMSJFsXK9g2whNTn.jpg"
  },
  {
    title: "Chainsaw Man (Hindi Dubbed)",
    url: "https://animesalt.cx/series/chainsaw-man/",
    image: "https://image.tmdb.org/t/p/w500/npdB6eFz4qt9CdISEgLOwL9AsY7.jpg"
  },
  {
    title: "Dragon Ball Super (Hindi Dubbed)",
    url: "https://animesalt.cx/series/dragon-ball-super/",
    image: "https://image.tmdb.org/t/p/w500/qeuOP0QjEZ9bB0v3mR9J9sK9j9.jpg"
  },
  {
    title: "Death Note (Hindi Dubbed)",
    url: "https://animesalt.cx/series/death-note/",
    image: "https://image.tmdb.org/t/p/w500/iigTJJskR1PcjjPL0iW1gI6j1.jpg"
  },
  {
    title: "Tokyo Ghoul (Hindi Dubbed)",
    url: "https://animesalt.cx/series/tokyo-ghoul/",
    image: "https://image.tmdb.org/t/p/w500/2L2fH8yJ9rF4x8Q9s1s4k8o2v.jpg"
  },
  {
    title: "Hunter x Hunter (Hindi Dubbed)",
    url: "https://animesalt.cx/series/hunter-x-hunter/",
    image: "https://image.tmdb.org/t/p/w500/ucmpDbKc7w2F30tB6mO8u8B6y3.jpg"
  }
];

export const FALLBACK_ONGOING: SeriesListItem[] = [
  {
    title: "Dandadan (Hindi Dubbed)",
    url: "https://animesalt.cx/series/dandadan/",
    image: "https://image.tmdb.org/t/p/w500/ybpqq8j6m3k1r2h9g1j6q2p4k.jpg"
  },
  {
    title: "Solo Leveling Season 2 (Hindi Dubbed)",
    url: "https://animesalt.cx/series/solo-leveling-season-2/",
    image: "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuPxJ8BGdM.jpg"
  },
  {
    title: "Bleach: TYBW - The Conflict (Hindi Dubbed)",
    url: "https://animesalt.cx/series/bleach-tybw-the-conflict/",
    image: "https://image.tmdb.org/t/p/w500/2Eewgp7o5AU1xCjrXY9HBqFgviK.jpg"
  },
  {
    title: "Blue Lock Season 2 (Hindi Dubbed)",
    url: "https://animesalt.cx/series/blue-lock-season-2/",
    image: "https://image.tmdb.org/t/p/w500/9kF1n9G4r2h8j6m3k1r2h9g1j.jpg"
  },
  {
    title: "Re:Zero Season 3 (Hindi Subbed)",
    url: "https://animesalt.cx/series/rezero-season-3/",
    image: "https://image.tmdb.org/t/p/w500/pB6o2v8x1r2j6m3k1r2h9g1j.jpg"
  },
  {
    title: "Tower of God Season 2 (Hindi Dubbed)",
    url: "https://animesalt.cx/series/tower-of-god-season-2/",
    image: "https://image.tmdb.org/t/p/w500/3oB7lW1sE7yH7oN9kF1n9G4r2.jpg"
  }
];

export const FALLBACK_MOVIES: SeriesListItem[] = [
  {
    title: "Demon Slayer: Kimetsu no Yaiba – Mugen Train (Hindi Dub)",
    url: "https://animesalt.cx/movies/demon-slayer-mugen-train/",
    image: "https://image.tmdb.org/t/p/w500/h8Rb9gBr48ODigYnZDCk3994BnW.jpg"
  },
  {
    title: "Jujutsu Kaisen 0 (Hindi Dubbed)",
    url: "https://animesalt.cx/movies/jujutsu-kaisen-0/",
    image: "https://image.tmdb.org/t/p/w500/3pTwMAnsELub6DP9Mu6kJRY94zs.jpg"
  },
  {
    title: "Suzume (Hindi Dubbed)",
    url: "https://animesalt.cx/movies/suzume/",
    image: "https://image.tmdb.org/t/p/w500/vIeu8WysLLv9hQGFteRYvG6v19m.jpg"
  },
  {
    title: "Your Name (Hindi Dubbed)",
    url: "https://animesalt.cx/movies/your-name/",
    image: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6qFsxVIihkrC.jpg"
  },
  {
    title: "Weathering With You (Hindi Dubbed)",
    url: "https://animesalt.cx/movies/weathering-with-you/",
    image: "https://image.tmdb.org/t/p/w500/qgrk7r1fV4KhFLRP9upBpFlSuOP.jpg"
  },
  {
    title: "A Silent Voice (Hindi Dubbed)",
    url: "https://animesalt.cx/movies/a-silent-voice/",
    image: "https://image.tmdb.org/t/p/w500/tuFaWiqX0TX3vP7A9g6m2f3j.jpg"
  },
  {
    title: "Dragon Ball Super: Super Hero (Hindi Dubbed)",
    url: "https://animesalt.cx/movies/dragon-ball-super-super-hero/",
    image: "https://image.tmdb.org/t/p/w500/rugyJii5FtFR7xilB2f0pL79j4.jpg"
  },
  {
    title: "One Piece Film: Red (Hindi Dubbed)",
    url: "https://animesalt.cx/movies/one-piece-film-red/",
    image: "https://image.tmdb.org/t/p/w500/m80ALVVv2045zepXk0111pI7w5j.jpg"
  }
];

export const FALLBACK_CARTOONS: SeriesListItem[] = [
  {
    title: "Doraemon Classic (Hindi Episodes)",
    url: "https://animesalt.cx/series/doraemon/",
    image: "https://image.tmdb.org/t/p/w500/vQkP5b7M9N4s1o8Y3w2q5f8g7.jpg"
  },
  {
    title: "Shinchan (Hindi Episodes)",
    url: "https://animesalt.cx/series/shinchan/",
    image: "https://image.tmdb.org/t/p/w500/7Lw9s1o8Y3w2q5f8g7m4s1o8.jpg"
  },
  {
    title: "Ben 10 Classic (Hindi Dubbed)",
    url: "https://animesalt.cx/series/ben-10-classic/",
    image: "https://image.tmdb.org/t/p/w500/e9v8x1r2j6m3k1r2h9g1j6q.jpg"
  },
  {
    title: "Ninja Hattori (Hindi Dubbed)",
    url: "https://animesalt.cx/series/ninja-hattori/",
    image: "https://image.tmdb.org/t/p/w500/8B6y3oB7lW1sE7yH7oN9kF1.jpg"
  },
  {
    title: "Beyblade Metal Fusion (Hindi Dubbed)",
    url: "https://animesalt.cx/series/beyblade-metal-fusion/",
    image: "https://image.tmdb.org/t/p/w500/1r2j6m3k1r2h9g1j6q2p4k8.jpg"
  },
  {
    title: "Perman (Hindi Dubbed)",
    url: "https://animesalt.cx/series/perman/",
    image: "https://image.tmdb.org/t/p/w500/4k8o2v8x1r2j6m3k1r2h9g1.jpg"
  },
  {
    title: "Pokemon Indigo League (Hindi Dubbed)",
    url: "https://animesalt.cx/series/pokemon-indigo-league/",
    image: "https://image.tmdb.org/t/p/w500/rOuGm0708mYgXz9hX4K0d7Q.jpg"
  },
  {
    title: "Oggy and the Cockroaches (Hindi Dubbed)",
    url: "https://animesalt.cx/series/oggy-and-the-cockroaches/",
    image: "https://image.tmdb.org/t/p/w500/6q2p4k8o2v8x1r2j6m3k1r2.jpg"
  }
];
