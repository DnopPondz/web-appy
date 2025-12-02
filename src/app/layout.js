import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";
import { Toaster } from "react-hot-toast"; // เพิ่ม Toaster

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Appy Web Dashboard",
  description: "Internal System Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionWrapper>
          <Toaster position="top-right" /> {/* เพิ่ม Component นี้ */}
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}