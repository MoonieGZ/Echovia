"use client"

import { AppSidebar } from "@/components/app-sidebar"
import SettingsForm from "@/components/settings-form"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import React from "react"
import RulesSection from "@/components/rules-section"
import ExcludedCharacters from "@/components/excluded-characters"
import { useTranslations } from "next-intl"

export default function SettingsPage() {
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
        <SiteHeader title={t("settings.title")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="space-y-8">
                  <SettingsForm type="characters" />
                  <ExcludedCharacters />
                  <SettingsForm type="bosses" />
                  <RulesSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 