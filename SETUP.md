# 🔒 Secure Wishlist Setup Guide

This guide will help you set up your secure, personal wishlist application using Upstash Redis for storage.

## 📋 Prerequisites

- Node.js 18+ installed
- A free Upstash account (for Redis database)
- Basic terminal/command line knowledge

## 🚀 Quick Setup

### 1. Set Up Upstash Redis Database

1. Go to [Upstash Console](https://console.upstash.com/)
2. Sign up for a free account
3. Create a new Redis database:
   - Click "Create Database"
   - Choose a name (e.g., "wishlist-db")
   - Select a region close to you
   - Choose "Free" plan
4. Once created, copy your database credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 2. Generate Password Hash

Run the setup script to create a secure password:

```bash
node scripts/setup-password.js
```

Follow the prompts to enter a password for your wife. Copy the generated hash.

### 3. Create Environment Variables

Create a `.env.local` file in your project root with:

```env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here

# Authentication
NEXTAUTH_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NEXTAUTH_URL=http://localhost:3000

# Password Hash (generated from setup script)
ADMIN_PASSWORD_HASH=your_generated_hash_here
```

**Important:** Generate a random string for `NEXTAUTH_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` and you'll be redirected to the login page.

## 🔐 Security Features

- **Password Protection**: Simple but secure password-based authentication
- **JWT Tokens**: Secure session management with 30-day expiry
- **HTTP-Only Cookies**: Tokens stored securely, not accessible via JavaScript
- **Protected Routes**: All pages except login require authentication
- **Encrypted Storage**: Passwords are hashed using bcrypt with 12 rounds

## 🎯 Features

- ✅ **Create Collections**: Organize items into themed wishlists
- ✅ **Add Items**: Add wishlist items with images, prices, notes, and tags
- ✅ **Priority System**: Mark items as high, medium, or low priority
- ✅ **Search & Filter**: Find items quickly across all collections
- ✅ **Grid/List Views**: Choose your preferred viewing mode
- ✅ **Real-time Stats**: Track total items, high priority items, and monthly additions
- ✅ **Responsive Design**: Works beautifully on desktop and mobile

## 🛠 Usage

### First Time Setup
1. Login with the password you created
2. The app starts with no collections or items
3. Create your first collection using the "+" button
4. Add items to your collections

### Managing Collections
- Click the "+" next to "Collections" to create new wishlists
- Collections automatically count their items
- Click any collection to filter items

### Adding Items
- Click "Add Item" to create new wishlist items
- Include images, prices, websites, notes, and tags
- Set priority levels to organize by importance

### Security
- Sessions last 30 days
- Click the logout button (exit icon) in the header to sign out
- The app automatically redirects to login if your session expires

## 🌐 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN` 
   - `NEXTAUTH_SECRET`
   - `ADMIN_PASSWORD_HASH`
   - `NEXTAUTH_URL` (set to your Vercel domain)

### Other Platforms

The app works on any platform that supports Node.js. Just ensure all environment variables are properly set.

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   ├── wishlists/     # Wishlist CRUD operations
│   │   └── items/         # Item CRUD operations
│   ├── login/             # Login page
│   └── page.tsx           # Main wishlist app
├── lib/
│   ├── auth.ts            # Authentication utilities
│   ├── redis.ts           # Database configuration
│   └── utils.ts           # General utilities
├── middleware.ts          # Route protection
└── scripts/
    └── setup-password.js  # Password hash generator
```

## 🔧 Troubleshooting

### Can't connect to Redis
- Verify your Upstash credentials in `.env.local`
- Check that your Redis database is active in Upstash console

### Login not working
- Ensure `ADMIN_PASSWORD_HASH` is correctly set
- Try regenerating the password hash with the setup script

### App crashes on startup
- Check that all required environment variables are set
- Verify Node.js version is 18+

## 💡 Tips

- **Image URLs**: Use direct image links or upload to a service like Cloudinary
- **Organization**: Create specific collections like "Fashion", "Home", "Books"
- **Tags**: Use consistent tags for better organization
- **Priorities**: Use high priority for items you really want soon

## 🆘 Support

If you run into issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure your Upstash Redis database is running
4. Check that your password hash was generated correctly

---

**Enjoy your secure, personal wishlist! 🎉** 