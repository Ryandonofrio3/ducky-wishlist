import bcrypt from 'bcryptjs'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-change-this')

export interface User {
  id: string
  name: string
  isAuthenticated: boolean
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Create JWT token
export async function createToken(user: User): Promise<string> {
  return await new jose.SignJWT({ id: user.id, name: user.name, isAuthenticated: user.isAuthenticated })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET)
}

// Verify JWT token
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return {
      id: payload.id as string,
      name: payload.name as string,
      isAuthenticated: payload.isAuthenticated as boolean
    }
  } catch (error) {
    return null
  }
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