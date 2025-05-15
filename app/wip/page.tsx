"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import React from "react"
import { useTranslations } from "next-intl"
import { AlertTriangle } from "lucide-react"

export default function WipPage() {
  const t = useTranslations()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("wip.title")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                  <div className="flex gap-4">
                    <AlertTriangle className="h-16 w-16 shrink-0" />
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-bold pt-1">{t("wip.title")}</h2>
                      <p className="text-muted-foreground">{t("wip.description")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 