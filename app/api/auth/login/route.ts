import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const token = await createToken(user)

    // Create response with token in cookie
    const response = NextResponse.json(
      { success: true, user },
      { status: 200 }
    )

    // Set httpOnly cookie with token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 