import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import { Toaster } from "sonner";
import ScrollRestoration from "@/components/ScrollRestoration";
import { DemoProvider } from "@/lib/demo/demoContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-serif",
});

export const metadata: Metadata = {
  title: "xyz",
  description: "A modern banking platform for managing your finances.",
  icons: {
    icon: "/icons/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        <DemoProvider>
          <ScrollRestoration />
          {children}
          <Toaster position="top-right" />
        </DemoProvider>
      </body>
    </html>
  );
}
