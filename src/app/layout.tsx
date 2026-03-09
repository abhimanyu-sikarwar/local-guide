import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BhashaSethu",
  description: "Live Hindi↔Kannada translator for travellers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
      </head>
      <body
        className={`${poppins.variable} antialiased bg-white`}
      >
        <div className="pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
