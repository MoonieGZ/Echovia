import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Euro, Github } from "lucide-react"
import Link from "next/link"

import React from "react"

export function SiteHeader({ title }: { title?: string }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-50 bg-background rounded-t-lg">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title || "Echovia"}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Link href="https://mnsy.dev/pay" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Euro className="h-5 w-5" />
              <span className="sr-only">PayPal</span>
            </Button>
          </Link>
          <Link href="https://github.com/MoonieGZ/Echovia" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
