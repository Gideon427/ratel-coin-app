// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/login', '/signup'];

  // If trying to access protected route without login
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access auth routes  if (authRoutes.some(route => pathname.startsWith(route)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();


export const config = {
  matcher: ['/dashboard', '/login', '/signup'],
};