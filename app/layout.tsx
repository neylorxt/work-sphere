import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WorkSphere — Gestion des employés",
    template: "%s · WorkSphere",
  },
  description:
    "WorkSphere — Dashboard SaaS moderne de gestion des ressources humaines : employés, congés, présences, salaires, évaluations et documents.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const themeInit = `try{var t=localStorage.getItem("worksphere-theme");var isLight=t==="light";document.documentElement.classList.toggle("dark",!isLight);document.documentElement.setAttribute("data-theme",isLight?"light":"dark")}catch(e){document.documentElement.classList.add("dark");document.documentElement.setAttribute("data-theme","dark")}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}