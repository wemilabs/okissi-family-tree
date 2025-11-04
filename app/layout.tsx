import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OKISSI's Family Tree",
  description: "Construisons et visualisons notre héritage familial",
  metadataBase: new URL("https://okissi-family-tree.vercel.app/"),
  keywords: ["family", "okissi", "family tree", "genealogy", "family history"],
  authors: [
    {
      name: "Mr T",
      url: "https://cuttypiedev.vercel.app/",
    },
  ],
  creator: "Mr T",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://okissi-family-tree.vercel.app/",
    title: "OKISSI's Family Tree",
    description: "Construisons et visualisons notre héritage familial",
    siteName: "OKISSI's Family Tree",
    images: [
      {
        url: "https://ubrw5iu3hw.ufs.sh/f/TFsxjrtdWsEI2nMSS96OWeVvZR7TyuB8q0wYA9LGpXglijMJ",
        width: 1200,
        height: 630,
        alt: "OKISSI's Family Tree",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OKISSI's Family Tree",
    description: "Construisons et visualisons notre héritage familial",
    images: [
      "https://ubrw5iu3hw.ufs.sh/f/TFsxjrtdWsEI2nMSS96OWeVvZR7TyuB8q0wYA9LGpXglijMJ",
    ],
    creator: "@DorianTho5",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
