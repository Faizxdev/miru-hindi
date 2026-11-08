"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { heroFeatured, HeroItem } from "@/lib/heroData"

const AUTO_ADVANCE_MS = 7000   // 7 seconds per slide

interface HeroBannerProps {
  initialItems?: HeroItem[];
}

export default function HeroBanner({ initialItems }: HeroBannerProps) {
  const [items, setItems] = useState<HeroItem[]>(initialItems || heroFeatured)
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const bannerHeight = 600 // approximate threshold
      const progress = Math.min(scrollY / bannerHeight, 1)
      setScrollProgress(progress)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch dynamic featured items in background
  useEffect(() => {
    fetch('/api/featured')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data)
        }
      })
      .catch(err => console.error("Failed to load dynamic hero content:", err))
  }, [])
  
  const goTo = useCallback((index: number) => {
    if (index === current || transitioning) return
    setPrev(current)
    setTransitioning(true)
    setCurrent(index)
    setTimeout(() => {
      setPrev(null)
      setTransitioning(false)
    }, 700)   // match CSS transition duration
  }, [current, transitioning])

  const goNext = useCallback(() => {
    const nextIndex = (current + 1) % items.length
    goTo(nextIndex)
  }, [current, goTo, items.length])

  // Auto-advance timer
  useEffect(() => {
    if (isPaused || items.length === 0) return;

    const timer = setTimeout(() => {
      goNext();
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(timer);
  }, [current, isPaused, goNext, items.length]);

  // Touch handlers
  const touchStartX = useRef<number>(0)
  const touchEndX   = useRef<number>(0)

  function handleTouchStart(e: React.TouchEvent) {
    setIsPaused(true)
    touchStartX.current = e.changedTouches[0].screenX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    setIsPaused(false)
    touchEndX.current = e.changedTouches[0].screenX
    const delta = touchStartX.current - touchEndX.current
    if (Math.abs(delta) < 50) return
    if (delta > 0) goNext()
    else goTo((current - 1 + items.length) % items.length)
  }

  if (items.length === 0) return null;

  const item = items[current]

  return (
    <section 
      className="hero-banner" 
      aria-label="Featured anime"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ 
        transform: `scale(${1 + scrollProgress * 0.05})`,
      }}
    >
      {/* ── SCROLL OVERLAY ──────────────────────────── */}
      <div 
        className="hero-scroll-overlay"
        style={{ opacity: scrollProgress }}
      />

      {/* ── BACKDROP LAYERS ─────────────────────────── */}
      {items.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero-backdrop-layer ${
            i === current ? "active" :
            i === prev ? "prev" : "hidden"
          }`}
          aria-hidden="true"
        >
          <Image
            src={slide.backdropUrl}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ 
              objectFit: "cover", 
              objectPosition: "center 20%",
              transform: `translateY(${scrollProgress * 80}px) scale(${1 + scrollProgress * 0.1})`,
              filter: `brightness(${1 - scrollProgress * 0.5})`
            }}
          />
        </div>
      ))}

      {/* ── GRADIENT OVERLAYS ────────────────────────── */}
      <div className="hero-gradient-left"  aria-hidden="true" />
      <div className="hero-gradient-bottom" aria-hidden="true" />

      {/* ── CONTENT ─────────────────────────────────── */}
      <div 
        className="hero-content"
        style={{ 
          opacity: 1 - scrollProgress * 1.5,
          transform: `translateY(${scrollProgress * 100}px)`,
          filter: `blur(${scrollProgress * 10}px)`
        }}
      >

        {/* Spotlight Counter */}
        <div className="hero-spotlight-tag">#{current + 1} Spotlight</div>

        {/* Title */}
        <h1 className="hero-title">{item.title}</h1>

        {/* Meta row */}
        <div className="hero-meta">
          <div className="hero-meta-group">
            <span className="hero-meta-item">{item.year}</span>
            <span className="hero-meta-divider">|</span>
            <span className="hero-meta-item">{item.episodeCount} Episodes</span>
            <span className="hero-meta-divider">|</span>
            <span className="hero-meta-item hero-meta-rating">{item.rating || "8.5"}</span>
          </div>
          <div className="hero-genres">
            {item.genres.map(g => (
              <span key={g} className="hero-genre-tag">{g}</span>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="hero-description">{item.description}</p>

        {/* CTA Buttons */}
        <div className="hero-cta-row">
          <Link href={item.watchUrl} className="hero-btn-primary">
            <PlayIcon />
            Watch Now
          </Link>
          <Link href={item.titleUrl} className="hero-btn-secondary">
            More Info
          </Link>
        </div>
      </div>

      {/* ── SLIDE NAVIGATION ────────────────────────── */}
      <div className="hero-nav">

        {/* Progress bar for current slide */}
        <div className="hero-progress-bar">
          <div
            key={current}   /* key change restarts animation */
            className="hero-progress-fill"
            style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
          />
        </div>

        {/* Thumbnail dots */}
        <div className="hero-dots" role="tablist" aria-label="Featured titles">
          {items.map((slide, i) => (
            <button
              key={slide.id}
              role="tab"
              aria-selected={i === current}
              aria-label={`View ${slide.title}`}
              className={`hero-dot ${i === current ? "active" : ""}`}
              onClick={() => goTo(i)}
            >
              <div className="hero-dot-thumb">
                <Image
                  src={slide.posterUrl}
                  alt={slide.title}
                  fill
                  sizes="56px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span className="hero-dot-label">{slide.title}</span>
            </button>
          ))}
        </div>

        {/* Prev / Next arrows */}
        <div className="hero-arrows">
          <button
            className="hero-arrow"
            onClick={() => goTo((current - 1 + items.length) % items.length)}
            aria-label="Previous"
          >
            <ChevronLeftIcon />
          </button>
          <button
            className="hero-arrow"
            onClick={goNext}
            aria-label="Next"
          >
            <ChevronRightIcon />
          </button>
        </div>

      </div>
    </section>
  )
}

// ── SVG ICONS ────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2.5l10 5.5-10 5.5V2.5z"/>
    </svg>
  )
}
function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4L6 9l5 5"/>
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4l5 5-5 5"/>
    </svg>
  )
}
