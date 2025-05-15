import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Geist } from "next/font/google"
import type React from "react"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"
import { GenshinDataProvider } from "@/lib/genshin-data-provider"
import { Toaster } from "@/components/ui/sonner"
import { getLocale } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"

export const metadata: Metadata = {
  title: "Echovia",
  description: "Minigames for anime games.",
}

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <Analytics />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale}>
            <GenshinDataProvider>
              {/* TODO: add language provider via next-i18next */}
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                {children}
              </Suspense>
              <Toaster />
            </GenshinDataProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
