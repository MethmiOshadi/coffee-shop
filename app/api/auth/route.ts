import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { action, username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password required' }, { status: 400 });
    }

    if (action === 'signup') {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await User.create({ username, passwordHash });

      const response = NextResponse.json({ success: true, message: 'Admin account created successfully!' });
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
      return response;
    }

    if (action === 'login') {
      const user = await User.findOne({ username });
      if (!user) {
        return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
      }

      const response = NextResponse.json({ success: true, message: 'Logged in successfully!' });
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Auth failed' }, { status: 500 });
  }
}

// GET route to check login status or logout
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'logout') {
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.set('admin_session', '', { maxAge: 0, path: '/' });
    return response;
  }

  const cookie = request.headers.get('cookie') || '';
  const isLoggedIn = cookie.includes('admin_session=authenticated');

  return NextResponse.json({ authenticated: isLoggedIn });
}