"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-text-dim text-sm">{error?.message || 'Unexpected error'}</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => reset()} className="btn btn-primary">Try again</button>
            <a href="/" className="btn btn-outline">Go Home</a>
          </div>
        </div>
      </body>
    </html>
  );
}


