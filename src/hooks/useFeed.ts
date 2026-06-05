import { useEffect, useState } from 'react'
import type { Post } from '../data/types'
import { fallbackPosts } from '../data/writing'

export interface FeedState {
  posts: Post[]
  syncedAt: string
  live: boolean
}

function stamp(): string {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Hydrates the writing feed from /feed.json (generated at build time by
 * scripts/build_feed.py). Until that resolves — or if it 404s — the baked-in
 * fallback posts render, so the section is never empty and never shifts layout.
 */
export function useFeed(): FeedState {
  const [posts, setPosts] = useState<Post[]>(fallbackPosts)
  const [live, setLive] = useState(false)
  const [syncedAt, setSyncedAt] = useState<string>(stamp())

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}feed.json`)
      .then((r) => (r.ok ? (r.json() as Promise<Post[]>) : null))
      .then((data) => {
        if (cancelled || !data || !data.length) return
        setPosts(data.slice(0, 6))
        setLive(true)
        setSyncedAt(stamp())
      })
      .catch(() => {
        /* keep the fallback posts */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { posts, syncedAt, live }
}
