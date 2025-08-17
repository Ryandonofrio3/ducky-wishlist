#!/usr/bin/env node

/**
 * Setup script to generate password hash for your wife's account
 * Run with: node scripts/setup-password.js
 */

import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askPassword() {
  return new Promise((resolve) => {
    rl.question('Enter the password for your wife to access the wishlist: ', (password) => {
      if (!password || password.length < 6) {
        console.log('Password must be at least 6 characters long.')
        resolve(askPassword())
      } else {
        resolve(password)
      }
    })
  })
}

async function main() {
  console.log('🔒 Setting up authentication for your wishlist app')
  console.log('━'.repeat(50))
  
  try {
    const password = await askPassword()
    
    console.log('\n⏳ Generating secure password hash...')
    const hash = await bcrypt.hash(password as string, 12)
    
    console.log('\n✅ Password hash generated successfully!')
    console.log('\n📝 Add this to your .env.local file:')
    console.log('━'.repeat(50))
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`)
    console.log('━'.repeat(50))
    
    console.log('\n🚀 Next steps:')
    console.log('1. Copy the ADMIN_PASSWORD_HASH line above to your .env.local file')
    console.log('2. Get your Upstash Redis credentials from https://console.upstash.com/')
    console.log('3. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local')
    console.log('4. Generate a random NEXTAUTH_SECRET and add it to .env.local')
    console.log('5. Run `npm run dev` to start your secure wishlist app!')
    
    rl.close()
  } catch (error) {
    console.error('Error generating password hash:', error)
    rl.close()
  }
}

main()