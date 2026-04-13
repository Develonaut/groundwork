import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import { SerwistProvider } from "./serwist-provider";
import "./globals.css";

const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Variable.woff2", style: "normal" },
    { path: "./fonts/Switzer-VariableItalic.woff2", style: "italic" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Groundwork",
  description: "A zen training journal for Brazilian Jiu-Jitsu",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Groundwork",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${switzer.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
      </body>
    </html>
  );
}
