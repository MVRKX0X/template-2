import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "No Tilt",
  description: "Verified trading performance marketplace powered by live broker data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[color:var(--color-bg-surface-base)] text-[color:var(--color-text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}

