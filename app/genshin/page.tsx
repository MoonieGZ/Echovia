"use client"

import { useGenshinData } from "@/lib/genshin-data-provider"
import { SectionCards, CardDescription } from "@/components/section-cards"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Minus, Plus } from "lucide-react"
import React from "react"

export default function GenshinPage() {
  const { characters, bosses, settings, updateSettings } = useGenshinData()
  const { t } = useLanguage()

  const availableCharacters = characters.filter(
    (char) =>
      settings.characters.enabled[char.name] &&
      (!settings.enableExclusion || !settings.characters.excluded.includes(char.name)),
  ).length

  const availableBosses = bosses.filter((boss) => settings.bosses.enabled[boss.name]).length

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
        <SiteHeader title={t("genshin.title")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="space-y-8">
                  <SectionCards>
                    <Card data-slot="card" className="@container/card">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {availableCharacters}
                          </CardTitle>
                          <CardDescription>{t("genshin.availableCharacters")}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          {/* TODO: fix the invisible button hack */}
                          <Button variant="outline" size="icon" className="opacity-0 pointer-events-none">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="opacity-0 pointer-events-none">
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                    <Card data-slot="card" className="@container/card">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {availableBosses}
                          </CardTitle>
                          <CardDescription>{t("genshin.availableBosses")}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          {/* TODO: fix the invisible button hack */}
                          <Button variant="outline" size="icon" className="opacity-0 pointer-events-none">
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="opacity-0 pointer-events-none">
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                    <Card data-slot="card" className="@container/card">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {settings.characters.count ?? 1}
                          </CardTitle>
                          <CardDescription>{t("genshin.characterCount")}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const value = Math.min(availableCharacters, (settings.characters.count ?? 1) + 1)
                              updateSettings({
                                ...settings,
                                characters: {
                                  ...settings.characters,
                                  count: value,
                                },
                              })
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const value = Math.max(1, (settings.characters.count ?? 1) - 1)
                              updateSettings({
                                ...settings,
                                characters: {
                                  ...settings.characters,
                                  count: value,
                                },
                              })
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                    <Card data-slot="card" className="@container/card">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {settings.bosses.count ?? 1}
                          </CardTitle>
                          <CardDescription>{t("genshin.bossCount")}</CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const value = Math.min(availableBosses, (settings.bosses.count ?? 1) + 1)
                              updateSettings({
                                ...settings,
                                bosses: {
                                  ...settings.bosses,
                                  count: value,
                                },
                              })
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const value = Math.max(1, (settings.bosses.count ?? 1) - 1)
                              updateSettings({
                                ...settings,
                                bosses: {
                                  ...settings.bosses,
                                  count: value,
                                },
                              })
                            }}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  </SectionCards>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 