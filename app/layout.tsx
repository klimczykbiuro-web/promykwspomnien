import type { Metadata } from "next";
import "./globals.css";
import { branding } from "@/lib/domain/branding";

export const metadata: Metadata = {
  metadataBase: new URL("https://promykwspomnien.pl"),
  title: branding.siteName,
  description: branding.tagline,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
