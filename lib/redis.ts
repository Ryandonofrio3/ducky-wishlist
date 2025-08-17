import { Redis } from '@upstash/redis'

if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables')
}

export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

// Data types for Redis storage
export interface WishlistItem {
  id: string
  title: string
  price?: string
  originalPrice?: string
  image?: string
  site?: string
  wishlistId: string
  priority: 'low' | 'medium' | 'high'
  notes?: string
  tags: string[]
  inStock: boolean
  dateAdded: string
}

export interface Wishlist {
  id: string
  name: string
  description?: string
  color: string
  itemCount: number
} 