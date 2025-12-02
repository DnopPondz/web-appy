export { default } from "next-auth/middleware";

export const config = {
  // ระบุหน้าที่ต้องการป้องกัน (ใครไม่ Login จะถูกดีดไปหน้า Login)
  matcher: [
    "/", 
    "/wp", 
    "/sp", 
    "/reports", 
    "/log", 
    "/profile",
    "/api/websites/:path*", 
    "/api/supportpal/:path*",
    "/api/maintenance/:path*"
  ], 
};