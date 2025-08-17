import { NextRequest, NextResponse } from 'next/server'
import { redis, Wishlist } from '@/lib/redis'

// Get all wishlists
export async function GET() {
  try {
    const wishlists = await redis.get('wishlists') as Wishlist[] || []
    return NextResponse.json(wishlists)
  } catch (error) {
    console.error('Error fetching wishlists:', error)
    return NextResponse.json({ error: 'Failed to fetch wishlists' }, { status: 500 })
  }
}

// Create a new wishlist
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, description } = data

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Get existing wishlists
    const wishlists = await redis.get('wishlists') as Wishlist[] || []

    // Create new wishlist
    const colors = ['emerald', 'rose', 'amber', 'blue', 'purple', 'teal']
    const newWishlist: Wishlist = {
      id: Date.now().toString(),
      name,
      description: description || '',
      color: colors[Math.floor(Math.random() * colors.length)],
      itemCount: 0,
    }

    // Add to array and save
    const updatedWishlists = [...wishlists, newWishlist]
    await redis.set('wishlists', updatedWishlists)

    return NextResponse.json(newWishlist, { status: 201 })
  } catch (error) {
    console.error('Error creating wishlist:', error)
    return NextResponse.json({ error: 'Failed to create wishlist' }, { status: 500 })
  }
}

// Update an existing wishlist
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, name, description } = data

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get existing wishlists
    const wishlists = await redis.get('wishlists') as Wishlist[] || []

    // Find and update wishlist
    const updatedWishlists = wishlists.map(wishlist =>
      wishlist.id === id 
        ? { ...wishlist, name: name || wishlist.name, description: description ?? wishlist.description }
        : wishlist
    )

    // Save updated wishlists
    await redis.set('wishlists', updatedWishlists)

    const updatedWishlist = updatedWishlists.find(w => w.id === id)
    return NextResponse.json(updatedWishlist)
  } catch (error) {
    console.error('Error updating wishlist:', error)
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 })
  }
}

// Delete a wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get existing wishlists
    const wishlists = await redis.get('wishlists') as Wishlist[] || []

    // Remove wishlist
    const updatedWishlists = wishlists.filter(wishlist => wishlist.id !== id)

    // Save updated wishlists
    await redis.set('wishlists', updatedWishlists)

    // Also remove all items from this wishlist
    const items = await redis.get('items') as any[] || []
    const updatedItems = items.filter((item: any) => item.wishlistId !== id)
    await redis.set('items', updatedItems)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting wishlist:', error)
    return NextResponse.json({ error: 'Failed to delete wishlist' }, { status: 500 })
  }
} 