import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import { Header } from "@/components/Header";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "InfluConnect — Find Instagram Creators Who Fit Your Budget",
  description:
    "Connect your cloud kitchen or small restaurant with hyperlocal micro-influencers in Vasai-Virar and Mumbai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <AppProvider>
          <Header />
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
