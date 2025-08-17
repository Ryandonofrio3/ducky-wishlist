import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret-change-this')

export interface User {
  id: string
  name: string
  isAuthenticated: boolean
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