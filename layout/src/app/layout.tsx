// layout/app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Micro Frontend Demo with Podium",
  description:
    "A demo application showcasing Podium micro frontends with Next.js App Router",
  viewport: "width=device-width, initial-scale=1",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
