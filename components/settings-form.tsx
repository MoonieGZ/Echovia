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
import { Search, ExternalLink, Upload } from "lucide-react"
import { toast } from "sonner"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  const [showLevelDialog, setShowLevelDialog] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState("20")
  const [importData, setImportData] = useState<any>(null)

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

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (!data.characters || !Array.isArray(data.characters)) {
        throw new Error(t("settings.import.invalidFormat"))
      }

      setImportData(data)
    } catch (error) {
      console.error(error)
      toast.error(t("settings.import.error"))
    }
  }

  // Calculate how many characters will be imported with current settings
  const getFilteredCharacterCount = () => {
    if (!importData?.characters) return 0
    const minLevel = parseInt(selectedLevel)
    const filteredCharacters = importData.characters.filter((char: any) => char.level >= minLevel)
    
    // Check if any Traveler is in the filtered characters
    const hasTraveler = filteredCharacters.some((char: any) => char.key === "Traveler")
    
    // Count all Traveler elements if Traveler is found
    const travelerCount = hasTraveler ? items.filter((item: any) => item.name.startsWith("Traveler (")).length : 0
    
    // Return the count of filtered characters plus Traveler elements if applicable
    return filteredCharacters.length + (hasTraveler ? travelerCount - 1 : 0) // Subtract 1 to account for the base Traveler
  }

  return (
    <Card id={type === "characters" ? "characters-section" : "bosses-section"} className="scroll-mt-14">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-3xl font-medium">{type === "characters" ? t("common.characters") : t("common.bosses")}</span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              {type === "characters" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLevelDialog(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t("settings.import.title")}
                </Button>
              )}
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
            <div className="relative">
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
                          src={`/elements/${group}.webp`}
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
                      className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted cursor-pointer"
                      onClick={() => {
                        if (!(type === "bosses" && settings.rules.coopMode && !(item as any).coop)) {
                          updateEnabled(item.name, !enabledMap[item.name])
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Image
                          src={
                            type === "bosses"
                              ? `/bosses/${item.location}/${item.icon}?height=32&width=32`
                              : `/characters/${item.element}/${item.icon}?height=32&width=32`
                          }
                          alt={item.name}
                          width={32}
                          height={32}
                          className="rounded-full flex-shrink-0"
                        />
                        <div className="flex flex-col min-w-0 flex-1">
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
                                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-auto mr-2"
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
                              {item.name.startsWith("⭐ - ") && t("common.legend")}
                              {item.name.startsWith("⭐ - ") && !(item as any).coop && " • "}
                              {!(item as any).coop && t("settings.coopDisabled")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="switch-container flex items-center" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={enabledMap[item.name]}
                          onCheckedChange={(checked: boolean) => {
                            if (!(type === "bosses" && settings.rules.coopMode && !(item as any).coop)) {
                              updateEnabled(item.name, checked)
                            }
                          }}
                          disabled={type === "bosses" && settings.rules.coopMode && !(item as any).coop}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("settings.import.title")}</DialogTitle>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {t("settings.import.description")}
              </p>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {importData ? t("settings.import.jsonLoaded") : t("settings.import.clickToUpload")}
                  </span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="level-select">{t("settings.import.minLevel")}:</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger id="level-select" className="w-[180px]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 20, 30, 40, 50, 60, 70, 80, 90].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {t("settings.import.level")} {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {importData && (
                <div className="text-sm text-muted-foreground text-center">
                  {t("settings.import.preview").replace("{x}", getFilteredCharacterCount().toString())}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLevelDialog(false)
                  setImportData(null)
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={() => {
                  const importProcess = async () => {
                    if (!importData) {
                      toast.error(t("settings.import.error"))
                      return
                    }

                    // Disable all characters first
                    const updatedEnabled = { ...enabledMap }
                    items.forEach((item: any) => {
                      updatedEnabled[item.name] = false
                    })

                    // Enable only characters from the import file that meet the level requirement
                    const minLevel = parseInt(selectedLevel)
                    const filteredCharacters = importData.characters.filter(
                      (char: any) => char.level >= minLevel
                    )

                    // Check if any Traveler is in the filtered characters
                    const hasTraveler = filteredCharacters.some((char: any) => 
                      char.key === "Traveler"
                    )

                    filteredCharacters.forEach((char: any) => {
                      const charName = char.key.replace(/([A-Z])/g, ' $1').trim()
                      if (Object.prototype.hasOwnProperty.call(updatedEnabled, charName)) {
                        updatedEnabled[charName] = true
                      }
                    })

                    // If Traveler is found, enable all Traveler elements
                    if (hasTraveler) {
                      items.forEach((item: any) => {
                        if (item.name.startsWith("Traveler (")) {
                          updatedEnabled[item.name] = true
                        }
                      })
                    }

                    updateSettings({
                      characters: {
                        ...settings.characters,
                        enabled: updatedEnabled,
                      },
                    })

                    // Add a fake delay
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    return { characters: filteredCharacters }
                  }

                  toast.promise(importProcess, {
                    loading: t("settings.import.loading"),
                    success: (data) => {
                      if (!data?.characters) return t("settings.import.error")
                      return t("settings.import.success").replace("{x}", data.characters.length.toString())
                    },
                    error: (err) => err.message || t("settings.import.error"),
                  })

                  setShowLevelDialog(false)
                  setImportData(null)
                }}
                disabled={!importData}
              >
                {t("common.import")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}