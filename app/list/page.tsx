"use client";
import AnimeGridCard from '@/components/AnimeGridCard'
import { useMyList } from '@/components/useMyList'

export default function ListPage() {
  const { list } = useMyList();
  return (
    <div className="w-full px-4 md:px-6 pb-24 pt-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold">My List</h1>
        <p className="text-text-dim">Favorites, Continue Watching, and Watch Later</p>
      </header>

      {list.length === 0 ? (
        <section className="card p-6 grid place-items-center text-center min-h-[40vh]">
          <div className="space-y-2">
            <div className="text-lg font-medium">Your list is empty</div>
            <p className="text-text-dim text-sm">Browse trending shows and tap Add to save them here.</p>
            <a href="/" className="btn btn-primary">Discover Anime</a>
          </div>
        </section>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {list.map((it) => (
            <AnimeGridCard key={it.url} url={it.url} title={it.title} image={it.image} postId={it.postId} />
          ))}
        </div>
      )}
    </div>
  );
}


