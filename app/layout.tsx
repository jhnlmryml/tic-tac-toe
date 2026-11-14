import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@fontsource/pirata-one/400.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grand Line Arcade — Nakama Tic-Tac-Toe",
  description:
    "Pick your Straw Hat crew and challenge a friend or the computer in a cinematic, round-based Grand Line tic-tac-toe match.",
  applicationName: "Grand Line Arcade",
  keywords: ["tic-tac-toe", "One Piece", "Straw Hat crew", "Nakama", "multiplayer game"],
  authors: [{ name: "Jhon Almar Yumul" }],
  openGraph: {
    title: "Grand Line Arcade — Nakama Tic-Tac-Toe",
    description: "Pick your crew. Claim the board. Make some memories.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
