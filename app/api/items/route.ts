import { NextRequest, NextResponse } from 'next/server'
import { redis, WishlistItem, Wishlist } from '@/lib/redis'

// Get all items
export async function GET() {
  try {
    const items = await redis.get('items') as WishlistItem[] || []
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

// Create a new item
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      title,
      price,
      originalPrice,
      image,
      site,
      wishlistId,
      priority = 'medium',
      notes,
      tags = []
    } = data

    if (!title || !wishlistId) {
      return NextResponse.json({ error: 'Title and wishlist ID are required' }, { status: 400 })
    }

    // Get existing items
    const items = await redis.get('items') as WishlistItem[] || []

    // Create new item
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      title,
      price,
      originalPrice,
      image,
      site,
      wishlistId,
      priority,
      notes,
      tags: Array.isArray(tags) ? tags : [],
      inStock: true,
      dateAdded: new Date().toISOString().split('T')[0],
    }

    // Add to array and save
    const updatedItems = [...items, newItem]
    await redis.set('items', updatedItems)

    // Update wishlist item count
    await updateWishlistItemCount(wishlistId)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
}

// Update an existing item
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get existing items
    const items = await redis.get('items') as WishlistItem[] || []

    // Find and update item
    const updatedItems = items.map(item =>
      item.id === id 
        ? { ...item, ...updateData, tags: Array.isArray(updateData.tags) ? updateData.tags : item.tags }
        : item
    )

    // Save updated items
    await redis.set('items', updatedItems)

    const updatedItem = updatedItems.find(i => i.id === id)
    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

// Delete an item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get existing items
    const items = await redis.get('items') as WishlistItem[] || []

    // Find the item to get its wishlist ID before deletion
    const itemToDelete = items.find(item => item.id === id)
    
    // Remove item
    const updatedItems = items.filter(item => item.id !== id)

    // Save updated items
    await redis.set('items', updatedItems)

    // Update wishlist item count if item was found
    if (itemToDelete) {
      await updateWishlistItemCount(itemToDelete.wishlistId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}

// Helper function to update wishlist item counts
async function updateWishlistItemCount(wishlistId: string) {
  try {
    const items = await redis.get('items') as WishlistItem[] || []
    const wishlists = await redis.get('wishlists') as Wishlist[] || []

    const itemCount = items.filter(item => item.wishlistId === wishlistId).length

    const updatedWishlists = wishlists.map(wishlist =>
      wishlist.id === wishlistId
        ? { ...wishlist, itemCount }
        : wishlist
    )

    await redis.set('wishlists', updatedWishlists)
  } catch (error) {
    console.error('Error updating wishlist item count:', error)
  }
} 