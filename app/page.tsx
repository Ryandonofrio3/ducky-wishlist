"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Heart, Edit2, Trash2, ExternalLink, Calendar, Tag, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { WishlistItem, Wishlist } from "@/lib/redis"

export default function WishlistApp() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [items, setItems] = useState<WishlistItem[]>([])
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isAddingWishlist, setIsAddingWishlist] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isLoading: authLoading, logout, requireAuth } = useAuth()

  // Auth check and data loading
  useEffect(() => {
    if (authLoading) return // Wait for auth check to complete
    
    if (!user) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      try {
        const [wishlistsRes, itemsRes] = await Promise.all([
          fetch('/api/wishlists'),
          fetch('/api/items')
        ])

        if (wishlistsRes.ok && itemsRes.ok) {
          const wishlistsData = await wishlistsRes.json()
          const itemsData = await itemsRes.json()
          setWishlists(wishlistsData)
          setItems(itemsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, authLoading, router])

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.site?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesWishlist = selectedWishlist ? item.wishlistId === selectedWishlist : true
    return matchesSearch && matchesWishlist
  })

  const handleAddItem = async (formData: any) => {
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newItem = await response.json()
        setItems([...items, newItem])
        
        // Update wishlist count in local state
        setWishlists(wishlists.map(w => 
          w.id === newItem.wishlistId 
            ? { ...w, itemCount: w.itemCount + 1 }
            : w
        ))
        
        setIsAddingItem(false)
      }
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const handleEditItem = async (formData: any) => {
    if (!editingItem) return

    try {
      const response = await fetch('/api/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingItem.id, ...formData }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems(items.map((item) => (item.id === editingItem.id ? updatedItem : item)))
        setEditingItem(null)
      }
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items?id=${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const deletedItem = items.find(item => item.id === itemId)
        setItems(items.filter((item) => item.id !== itemId))
        
        // Update wishlist count in local state
        if (deletedItem) {
          setWishlists(wishlists.map(w => 
            w.id === deletedItem.wishlistId 
              ? { ...w, itemCount: Math.max(0, w.itemCount - 1) }
              : w
          ))
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleAddWishlist = async (name: string) => {
    try {
      const response = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        const newWishlist = await response.json()
        setWishlists([...wishlists, newWishlist])
        setIsAddingWishlist(false)
      }
    } catch (error) {
      console.error('Error adding wishlist:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background texture-linen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading your wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background texture-linen">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-boutique">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Heart className="h-4 w-4 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-serif font-semibold text-foreground tracking-tight">
                  Ducky's Infinite Wishlist
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search your desires..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
                />
              </div>

              <div className="flex items-center space-x-2 bg-muted/50 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-3"
                >
                  Grid
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="h-8 px-3"
                >
                  List
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleLogout}
                className="rounded-full"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="space-y-8">
              <div className="bg-card rounded-2xl p-6 shadow-boutique">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-semibold text-foreground">Collections</h2>
                  <Dialog open={isAddingWishlist} onOpenChange={setIsAddingWishlist}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="rounded-full bg-transparent">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-serif">Create New Collection</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          const formData = new FormData(e.currentTarget)
                          handleAddWishlist(formData.get("name") as string)
                        }}
                      >
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium">
                              Collection Name
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              required
                              className="mt-1"
                              placeholder="e.g. Cozy Winter Essentials"
                            />
                          </div>
                          <Button type="submit" className="w-full rounded-full">
                            Create Collection
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedWishlist(null)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                      selectedWishlist === null
                        ? "bg-primary text-primary-foreground shadow-boutique"
                        : "hover:bg-muted/50 hover:shadow-boutique"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${selectedWishlist === null ? "bg-primary-foreground" : "bg-primary"}`}
                        />
                        <span className="font-medium">All Items</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {items.length}
                      </Badge>
                    </div>
                  </button>

                  {wishlists.map((wishlist) => (
                    <button
                      key={wishlist.id}
                      onClick={() => setSelectedWishlist(wishlist.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                        selectedWishlist === wishlist.id
                          ? "bg-primary text-primary-foreground shadow-boutique"
                          : "hover:bg-muted/50 hover:shadow-boutique"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              selectedWishlist === wishlist.id ? "bg-primary-foreground" : "bg-accent"
                            }`}
                          />
                          <span className="font-medium">{wishlist.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {items.filter((item) => item.wishlistId === wishlist.id).length}
                        </Badge>
                      </div>
                      {wishlist.description && (
                        <p
                          className={`text-xs ml-5 ${
                            selectedWishlist === wishlist.id ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          {wishlist.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 shadow-boutique">
                <h3 className="text-lg font-serif font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Items</span>
                    <span className="font-semibold">{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">High Priority</span>
                    <span className="font-semibold text-destructive">
                      {items.filter((item) => item.priority === "high").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-semibold text-primary">
                      {items.filter((item) => new Date(item.dateAdded).getMonth() === new Date().getMonth()).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl p-8 shadow-boutique">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
                    {selectedWishlist ? wishlists.find((w) => w.id === selectedWishlist)?.name : "All Items"}
                  </h2>
                  <p className="text-muted-foreground">
                    {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
                    {selectedWishlist &&
                      wishlists.find((w) => w.id === selectedWishlist)?.description &&
                      ` • ${wishlists.find((w) => w.id === selectedWishlist)?.description}`}
                  </p>
                </div>

                <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full shadow-boutique hover:shadow-boutique-hover transition-all">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-serif">Add New Item</DialogTitle>
                    </DialogHeader>
                    <ItemForm wishlists={wishlists} onSubmit={handleAddItem} defaultWishlist={selectedWishlist} />
                  </DialogContent>
                </Dialog>
              </div>

              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group hover:shadow-boutique-hover transition-all duration-300 overflow-hidden border-0 shadow-boutique bg-card"
                  >
                    <div
                      className={`${viewMode === "grid" ? "aspect-square" : "aspect-[4/3] md:aspect-[3/2]"} relative overflow-hidden`}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4 flex flex-col space-y-2">
                        <Badge className={`${getPriorityColor(item.priority)} shadow-sm`}>{item.priority}</Badge>
                        {item.tags && item.tags.length > 0 && (
                          <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                            <Tag className="h-3 w-3 mr-1" />
                            {item.tags[0]}
                          </Badge>
                        )}
                      </div>
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-base leading-tight mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{item.site}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(item.dateAdded).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg text-primary">{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">{item.originalPrice}</span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.notes}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingItem(item)}
                                className="rounded-full"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="font-serif">Edit Item</DialogTitle>
                              </DialogHeader>
                              <ItemForm wishlists={wishlists} onSubmit={handleEditItem} initialData={editingItem} />
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="rounded-full">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="font-serif">Remove Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{item.title}" from your wishlist? This action cannot
                                  be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        <Button size="sm" variant="ghost" className="rounded-full">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-serif font-semibold mb-3">No items found</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    {searchQuery
                      ? "Try adjusting your search terms or browse different collections"
                      : "Start curating your perfect wishlist with items you love"}
                  </p>
                  <Button onClick={() => setIsAddingItem(true)} className="rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemForm({ wishlists, onSubmit, initialData, defaultWishlist }: any) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    price: initialData?.price || "",
    originalPrice: initialData?.originalPrice || "",
    image: initialData?.image || "",
    site: initialData?.site || "",
    wishlistId: initialData?.wishlistId || defaultWishlist || wishlists[0]?.id || "",
    priority: initialData?.priority || "medium",
    notes: initialData?.notes || "",
    tags: initialData?.tags?.join(", ") || "",
  })
  
  const [url, setUrl] = useState("")
  const [isScrapingUrl, setIsScrapingUrl] = useState(false)
  const [scrapingError, setScrapingError] = useState("")

  const handleScrapeUrl = async () => {
    if (!url.trim()) return
    
    setIsScrapingUrl(true)
    setScrapingError("")
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        const data = result.data
        setFormData({
          ...formData,
          title: data.title || formData.title,
          price: data.price || formData.price,
          originalPrice: data.originalPrice || formData.originalPrice,
          image: data.image || formData.image,
          site: data.site || formData.site,
          notes: data.notes || formData.notes,
          tags: data.tags ? data.tags.join(", ") : formData.tags,
        })
      } else {
        setScrapingError(result.error || 'Failed to scrape URL')
      }
    } catch (error) {
      console.error('Error scraping URL:', error)
      setScrapingError('Failed to scrape URL. Please try again.')
    } finally {
      setIsScrapingUrl(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean),
      inStock: true,
    }
    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="url" className="text-sm font-medium">
          Product URL (Optional)
        </Label>
        <div className="flex space-x-2 mt-1">
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/product"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleScrapeUrl}
            disabled={!url.trim() || isScrapingUrl}
            variant="outline"
            className="min-w-[100px]"
          >
            {isScrapingUrl ? "Scraping..." : "Auto Fill"}
          </Button>
        </div>
        {scrapingError && (
          <p className="text-sm text-destructive mt-1">{scrapingError}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Paste a product URL to automatically fill in the details below
        </p>
      </div>

      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          Item Title
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="mt-1"
          placeholder="e.g. Vintage Leather Crossbody Bag"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="text-sm font-medium">
            Current Price
          </Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="$0.00"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="originalPrice" className="text-sm font-medium">
            Original Price
          </Label>
          <Input
            id="originalPrice"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            placeholder="$0.00"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="site" className="text-sm font-medium">
          Website
        </Label>
        <Input
          id="site"
          value={formData.site}
          onChange={(e) => setFormData({ ...formData, site: e.target.value })}
          placeholder="e.g. Anthropologie"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="image" className="text-sm font-medium">
          Image URL
        </Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://..."
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wishlist" className="text-sm font-medium">
            Collection
          </Label>
          <Select
            value={formData.wishlistId}
            onValueChange={(value) => setFormData({ ...formData, wishlistId: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {wishlists.map((wishlist: any) => (
                <SelectItem key={wishlist.id} value={wishlist.id}>
                  {wishlist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="priority" className="text-sm font-medium">
            Priority
          </Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tags" className="text-sm font-medium">
          Tags
        </Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="leather, everyday, cognac"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional thoughts or details..."
          rows={3}
          className="mt-1"
        />
      </div>

      <Button type="submit" className="w-full rounded-full">
        {initialData ? "Update Item" : "Add Item"}
      </Button>
    </form>
  )
}
