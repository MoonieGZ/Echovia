"use client"

import { useGenshinData } from "@/lib/genshin-data-provider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import Image from "next/image"
import { useLanguage } from "@/lib/language-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ExternalLink } from "lucide-react"
import React from "react"

export default function SettingsForm({ type }: { type: "characters" | "bosses" }) {
  const {
    characters,
    bosses,
    settings,
    updateCharacterEnabled,
    updateBossEnabled,
    disableLegendBosses,
    bossLocations,
    updateSettings,
  } = useGenshinData()
  const [filter, setFilter] = useState("")
  const { t } = useLanguage()

  const items = type === "characters" ? characters : bosses
  const updateEnabled = type === "characters" ? updateCharacterEnabled : updateBossEnabled
  const enabledMap = type === "characters" ? settings.characters.enabled : settings.bosses.enabled

  // Group characters by element or bosses by location
  const groupedItems = items.reduce(
    (acc: Record<string, any[]>, item: any) => {
      const groupKey = type === "characters" ? (item as any).element : (item as any).location
      if (!acc[groupKey]) {
        acc[groupKey] = []
      }
      acc[groupKey].push(item)
      return acc
    },
    {} as Record<string, any[]>,
  )

  // Get group keys in the correct order
  let groupKeys: string[]
  if (type === "characters") {
    // Sort elements alphabetically for characters
    groupKeys = Object.keys(groupedItems).sort()
  } else {
    // Use the order from the JSON file for bosses
    groupKeys = bossLocations.filter((location: string) => groupedItems[location])
  }

  // Filter items based on search
  const filteredGroups = filter
    ? groupKeys.reduce(
      (acc: Record<string, any[]>, group: string) => {
        const filteredItems = groupedItems[group].filter((item: any) =>
          item.name.toLowerCase().includes(filter.toLowerCase()),
        )
        if (filteredItems.length > 0) {
          acc[group] = filteredItems
        }
        return acc
      },
      {} as Record<string, any[]>,
    )
    : groupedItems

  // Get filtered group keys in the correct order
  let filteredGroupKeys: string[]
  if (type === "characters") {
    // Sort elements alphabetically for characters
    filteredGroupKeys = Object.keys(filteredGroups).sort()
  } else {
    // Use the order from the JSON file for bosses
    filteredGroupKeys = bossLocations.filter((location: string) => filteredGroups[location])
  }

  // Toggle all items in a group
  const toggleGroup = (group: string, enabled: boolean) => {
    const items = filteredGroups[group]
    const updatedEnabled = { ...enabledMap }
    
    items.forEach((item: any) => {
      // Skip non-co-op bosses when co-op mode is enabled
      if (type === "bosses" && settings.rules.coopMode && !(item as any).coop) {
        return
      }
      updatedEnabled[item.name] = enabled
    })

    // Update all items at once
    if (type === "characters") {
      updateSettings({
        characters: {
          ...settings.characters,
          enabled: updatedEnabled,
        },
      })
    } else {
      updateSettings({
        bosses: {
          ...settings.bosses,
          enabled: updatedEnabled,
        },
      })
    }
  }

  // Check if all items in a group are enabled/disabled
  const isGroupEnabled = (group: string) => {
    const items = filteredGroups[group]
    return items.every((item: any) => enabledMap[item.name])
  }

  const isGroupPartiallyEnabled = (group: string) => {
    const items = filteredGroups[group]
    const enabledCount = items.filter((item: any) => enabledMap[item.name]).length
    return enabledCount > 0 && enabledCount < items.length
  }

  return (
    <Card id={type === "characters" ? "characters-section" : "bosses-section"}>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-lg font-medium">{type === "characters" ? t("settings.tabs.characters") : t("settings.tabs.bosses")}</span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const updatedEnabled = { ...enabledMap }
                  items.forEach((item: any) => {
                    if (type === "bosses" && settings.rules.coopMode && !(item as any).coop) {
                      return
                    }
                    updatedEnabled[item.name] = true
                  })
                  if (type === "characters") {
                    updateSettings({
                      characters: {
                        ...settings.characters,
                        enabled: updatedEnabled,
                      },
                    })
                  } else {
                    updateSettings({
                      bosses: {
                        ...settings.bosses,
                        enabled: updatedEnabled,
                      },
                    })
                  }
                }}
              >
                {t("settings.enableAll")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const updatedEnabled = { ...enabledMap }
                  items.forEach((item: any) => {
                    if (type === "bosses" && settings.rules.coopMode && !(item as any).coop) {
                      return
                    }
                    updatedEnabled[item.name] = false
                  })
                  if (type === "characters") {
                    updateSettings({
                      characters: {
                        ...settings.characters,
                        enabled: updatedEnabled,
                      },
                    })
                  } else {
                    updateSettings({
                      bosses: {
                        ...settings.bosses,
                        enabled: updatedEnabled,
                      },
                    })
                  }
                }}
              >
                {t("settings.disableAll")}
              </Button>
            </div>
            {type === "bosses" && (
              <Button
                variant="outline"
                size="sm"
                onClick={disableLegendBosses}
              >
                {t("settings.disableLegends")}
              </Button>
            )}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("settings.search.search")}
                className="pl-8 w-full"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {filteredGroupKeys.map((group) => (
              <div key={group} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium flex items-center gap-2">
                    {type === "characters" ? (
                      <>
                        <Image
                          src={`/elements/${group.toLowerCase()}.webp`}
                          alt={group}
                          width={24}
                          height={24}
                          className="rounded-sm"
                        />
                        {group}
                      </>
                    ) : (
                      group
                    )}
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleGroup(group, true)}
                      disabled={isGroupEnabled(group)}
                    >
                      {t("settings.enableAll")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleGroup(group, false)}
                      disabled={!isGroupEnabled(group) && !isGroupPartiallyEnabled(group)}
                    >
                      {t("settings.disableAll")}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
                  {filteredGroups[group].map((item: any) => (
                    <div
                      key={item.name}
                      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer ${
                        enabledMap[item.name] ? "border" : "border-muted"
                      }`}
                      onClick={(e) => {
                        // Prevent toggling if clicking the switch
                        if (!(e.target as HTMLElement).closest('.switch-container')) {
                          updateEnabled(item.name, !enabledMap[item.name])
                        }
                      }}
                    >
                      <Image
                        src={
                          type === "bosses"
                            ? `/bosses/${item.location}/${item.icon}?height=32&width=32`
                            : `/characters/${item.element}/${item.icon}?height=32&width=32`
                        }
                        alt={item.name}
                        width={32}
                        height={32}
                        className={`rounded-sm ${!enabledMap[item.name] ? "grayscale opacity-50" : ""}`}
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-1">
                          <p 
                            className={`text-sm font-medium truncate ${!enabledMap[item.name] ? "text-muted-foreground" : ""}`}
                            title={item.name}
                          >
                            {item.name.replace("⭐ - ", "")}
                          </p>
                          {type === "bosses" && item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title={t("settings.openWiki")}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {type === "characters" ? (
                          <p className="text-xs text-muted-foreground">
                            {item.rarity}★
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {item.name.startsWith("⭐ - ") && t("main.legend")}
                            {item.name.startsWith("⭐ - ") && !(item as any).coop && " • "}
                            {!(item as any).coop && t("settings.coopDisabled")}
                          </p>
                        )}
                      </div>
                      <div className="switch-container flex items-center" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={enabledMap[item.name]}
                          onCheckedChange={(checked: boolean) => updateEnabled(item.name, checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 