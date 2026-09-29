export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*", "/tasks/:path*", "/ai/:path*"],
};
