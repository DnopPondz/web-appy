// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma), // 1. เชื่อมต่อ DB
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      allowDangerousEmailAccountLinking: true, // อนุญาตให้เชื่อมบัญชีอัตโนมัติ
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  // 2. ส่วนสำคัญ: บันทึก Log เมื่อ Login สำเร็จ
  events: {
    async signIn({ user }) {
      try {
        await prisma.loginLog.create({
          data: {
            email: user.email,
            name: user.name,
          },
        });
        console.log(`✅ Log saved for: ${user.email}`);
      } catch (error) {
        console.error("❌ Error saving log:", error);
      }
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) session.user.id = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };