# Miru Hindi (मिारू हिंदी)

> Fast, minimal, ad-free anime streaming experience built with Next.js 14, Tailwind CSS, and Cheerio.

## Features

- **Blazing Fast**: Optimized server-side scraping with in-memory TTL caching and parallel requests.
- **Instant Skeletons**: Zero-CLS layout matching skeletons with progressive image reveals.
- **No Intrusive Sign-ins**: Watch history and list syncing powered by local storage and fast client-side caching.
- **Hindi Audio & Subtitles**: Comprehensive discovery for Hindi dubbed and subbed anime, movies, and ongoing series.
- **Responsive & Accessible**: Clean, modern dark UI designed without generic templates or layout clutter.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Scraping Engine**: Cheerio + Axios with timeout failovers
- **Player**: HLS.js video streaming player
- **Icons**: Heroicons & Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20 or 22 recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Faizxdev/miru-hindi.git

# Enter the project directory
cd miru-hindi

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example or create .env.local:
# SITE_BASE=https://animesalt.cx
# NEXT_PUBLIC_SITE_BASE=https://animesalt.cx

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
