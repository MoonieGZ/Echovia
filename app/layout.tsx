import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Geist } from "next/font/google"
import type React from "react"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"
import { GenshinDataProvider } from "@/lib/genshin-data-provider"
import { LanguageProvider } from "@/lib/language-provider"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Echovia",
  description: "Minigames for anime games.",
}

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <GenshinDataProvider>
              {/* TODO: add language provider via next-i18next */}
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                {children}
              </Suspense>
              <Toaster />
            </GenshinDataProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
