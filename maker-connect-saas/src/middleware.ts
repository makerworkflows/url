import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  console.log(`[Middleware] Path: ${req.nextUrl.pathname}, isLoggedIn: ${isLoggedIn}, Auth:`, req.auth ? "Session Found" : "No Session")
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/login")
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname === "/"
  
  if (isOnDashboard) {
    if (isLoggedIn) return NextResponse.next()
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isOnLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
