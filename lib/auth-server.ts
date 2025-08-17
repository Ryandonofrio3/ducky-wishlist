import bcrypt from 'bcryptjs'
import { User } from './auth'

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Check if the provided password matches the admin password
export async function authenticateUser(password: string): Promise<User | null> {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
  
  if (!adminPasswordHash) {
    console.error('ADMIN_PASSWORD_HASH not set in environment variables')
    return null
  }

  const isValid = await verifyPassword(password, adminPasswordHash)
  
  if (isValid) {
    return {
      id: 'admin',
      name: 'Admin',
      isAuthenticated: true
    }
  }
  
  return null
} 