import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Decode JWT token payload safely in Next.js Edge Runtime
      const payloadPart = accessToken.split(".")[1];
      if (!payloadPart) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      
      // Base64URL decoding
      const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayload = JSON.parse(
        Buffer.from(base64, "base64").toString("utf-8")
      );

      if (decodedPayload.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (e) {
      console.error("JWT decoding failed in middleware:", e);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
