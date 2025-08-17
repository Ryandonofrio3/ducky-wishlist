"use client"

import type React from "react"
import { useState } from "react"
import { Plus, Search, Heart, Edit2, Trash2, ExternalLink, Calendar, Tag } from "lucide-react"
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

const mockWishlists = [
  { id: "1", name: "Fashion Finds", itemCount: 12, color: "emerald", description: "Curated pieces for my wardrobe" },
  { id: "2", name: "Home Sanctuary", itemCount: 8, color: "terracotta", description: "Creating a cozy living space" },
  { id: "3", name: "Literary Escapes", itemCount: 15, color: "blush", description: "Books that call to my soul" },
  { id: "4", name: "Tech & Tools", itemCount: 6, color: "sage", description: "Gadgets that spark joy" },
]

const mockItems = [
  {
    id: "1",
    title: "Vintage Leather Crossbody Bag",
    price: "$128.00",
    originalPrice: "$160.00",
    image: "/placeholder-wakoz.png",
    site: "Anthropologie",
    wishlistId: "1",
    priority: "high",
    notes: "Perfect for everyday use, love the cognac color. Saw Sarah wearing one and it looked amazing.",
    dateAdded: "2024-01-15",
    tags: ["leather", "everyday", "cognac"],
    inStock: true,
  },
  {
    id: "2",
    title: "Ceramic Planter Set of Three",
    price: "$45.00",
    image: "/white-ceramic-planter-set.png",
    site: "West Elm",
    wishlistId: "2",
    priority: "medium",
    notes: "Would look perfect on the windowsill with my herbs. Need to measure the space first.",
    dateAdded: "2024-01-12",
    tags: ["ceramic", "plants", "white"],
    inStock: true,
  },
  {
    id: "3",
    title: "The Seven Husbands of Evelyn Hugo",
    price: "$16.99",
    image: "/seven-husbands-evelyn-hugo-cover.png",
    site: "Amazon",
    wishlistId: "3",
    priority: "low",
    notes: "Highly recommended by Sarah",
    dateAdded: "2024-01-10",
    tags: ["book", "fiction", "recommended"],
    inStock: true,
  },
  {
    id: "4",
    title: "Wireless Charging Stand",
    price: "$39.99",
    originalPrice: "$49.99",
    image: "/modern-wireless-charger.png",
    site: "Apple",
    wishlistId: "4",
    priority: "high",
    notes: "Need for bedside table",
    dateAdded: "2024-01-08",
    tags: ["tech", "gadget", "charging"],
    inStock: true,
  },
  {
    id: "5",
    title: "Linen Button-Down Shirt",
    price: "$78.00",
    image: "/white-linen-shirt.png",
    site: "Everlane",
    wishlistId: "1",
    priority: "medium",
    notes: "Size medium, white or cream",
    dateAdded: "2024-01-05",
    tags: ["shirt", "linen", "medium"],
    inStock: true,
  },
  {
    id: "6",
    title: "Moroccan Area Rug",
    price: "$299.00",
    originalPrice: "$399.00",
    image: "/placeholder-g422o.png",
    site: "Rugs USA",
    wishlistId: "2",
    priority: "high",
    notes: "8x10 size for living room",
    dateAdded: "2024-01-03",
    tags: ["rug", "moroccan", "living room"],
    inStock: true,
  },
]

export default function WishlistApp() {
  const [wishlists, setWishlists] = useState(mockWishlists)
  const [items, setItems] = useState(mockItems)
  const [selectedWishlist, setSelectedWishlist] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isAddingWishlist, setIsAddingWishlist] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.site.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesWishlist = selectedWishlist ? item.wishlistId === selectedWishlist : true
    return matchesSearch && matchesWishlist
  })

  const handleAddItem = (formData: any) => {
    const newItem = {
      id: Date.now().toString(),
      ...formData,
      dateAdded: new Date().toISOString().split("T")[0],
    }
    setItems([...items, newItem])
    setIsAddingItem(false)
  }

  const handleEditItem = (formData: any) => {
    setItems(items.map((item) => (item.id === editingItem.id ? { ...item, ...formData } : item)))
    setEditingItem(null)
  }

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  const handleAddWishlist = (name: string) => {
    const colors = ["emerald", "rose", "amber", "blue", "purple", "teal"]
    const newWishlist = {
      id: Date.now().toString(),
      name,
      itemCount: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      description: "",
    }
    setWishlists([...wishlists, newWishlist])
    setIsAddingWishlist(false)
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
