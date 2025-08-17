import { NextRequest, NextResponse } from 'next/server'
import FirecrawlApp from '@mendable/firecrawl-js'
import { z } from 'zod'

const app = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY!
})

// Define schema for product extraction
const productSchema = z.object({
  title: z.string().describe("The product name or title"),
  price: z.string().optional().describe("Current price of the product"),
  originalPrice: z.string().optional().describe("Original or retail price if different from current price"),
  image: z.string().optional().describe("Main product image URL"),
  description: z.string().optional().describe("Product description or summary"),
  brand: z.string().optional().describe("Brand or manufacturer name"),
  availability: z.boolean().optional().describe("Whether the product is in stock or available"),
  tags: z.array(z.string()).optional().describe("Product categories, tags, or keywords")
})

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    if (!process.env.FIRECRAWL_API_KEY) {
      return NextResponse.json({ error: 'Firecrawl API key not configured' }, { status: 500 })
    }

    console.log('Scraping URL:', url)

    // Scrape the URL with structured extraction
    const scrapeResult = await app.scrapeUrl(url, {
      formats: ['json'],
      jsonOptions: { 
        prompt: `Extract product information including: title, current price, original price (if on sale), main product image URL, brief description, brand name, stock availability, and relevant tags/categories. Focus on e-commerce product details.`
      }
    })

    if (!scrapeResult.success) {
      console.error('Firecrawl error:', scrapeResult.error)
      return NextResponse.json({ error: 'Failed to scrape URL' }, { status: 500 })
    }

    // Extract the structured data
    const productData = scrapeResult.json || {}
    const metadata = scrapeResult.metadata || {}

    // Prepare the response with extracted data
    const extractedData = {
      title: productData.title || metadata.title || '',
      price: productData.price || '',
      originalPrice: productData.originalPrice || '',
      image: productData.image || metadata.ogImage || '',
      site: new URL(url).hostname.replace('www.', ''),
      notes: productData.description || metadata.description || '',
      tags: productData.tags || [],
      inStock: productData.availability !== false, // Default to true unless explicitly false
      metadata: {
        sourceUrl: url,
        title: metadata.title,
        description: metadata.description,
        ogImage: metadata.ogImage
      }
    }

    console.log('Extracted data:', extractedData)

    return NextResponse.json({ success: true, data: extractedData })

  } catch (error) {
    console.error('Scraping error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during scraping' 
    }, { status: 500 })
  }
} 