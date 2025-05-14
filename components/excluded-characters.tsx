"use client"

import React from "react"
import { useGenshinData } from "@/lib/genshin-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { RefreshCw, X } from "lucide-react"
import { useLanguage } from "@/lib/language-provider"
import { cn } from "@/lib/utils"
import { Tooltip } from "@/components/ui/tooltip"

export default function ExcludedCharacters() {
  const { characters, settings, includeCharacter, toggleExclusion, updateSettings } = useGenshinData()
  const { t } = useLanguage()

  // Get excluded characters with their full data
  const excludedCharacters = characters.filter((char) => settings.characters.excluded.includes(char.name))

  return (
    <Card id="excluded-characters-section" className="scroll-mt-14">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-3xl font-medium">{t("excluded.title")}</span>
          <div className="flex items-center space-x-2">
            {settings.enableExclusion && settings.characters.excluded.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Directly clear all excluded characters
                  updateSettings({
                    ...settings,
                    characters: {
                      ...settings.characters,
                      excluded: [],
                    },
                  })
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("excluded.resetAll")}
              </Button>
            )}
            <Label htmlFor="enable-exclusion">{t("excluded.enableExclusion")}</Label>
            <Switch id="enable-exclusion" checked={settings.enableExclusion} onCheckedChange={toggleExclusion} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {excludedCharacters.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t("excluded.noCharacters")}</p>
          ) : (
            <ScrollArea className="h-[100px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {excludedCharacters.map((character) => (
                  <Tooltip
                    key={character.name}
                    content={<p>{t("excluded.clickToReEnable")}</p>}
                    side="top"
                    align="center"
                  >
                    <div
                      className={cn(
                        "relative group cursor-pointer rounded-md overflow-hidden",
                        "border border-border hover:border-primary transition-colors",
                        "h-12 flex items-center gap-2 px-3",
                      )}
                      onClick={() => includeCharacter(character.name)}
                    >
                      <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                        <div
                          className={cn(
                            "absolute inset-0",
                            character.rarity === 5 ? "rarity-5-gradient" : "rarity-4-gradient",
                          )}
                        ></div>
                        <Image
                          src={`/characters/${character.element}/${character.icon}?height=32&width=32&text=${encodeURIComponent(character.name)}`}
                          alt={character.name}
                          width={32}
                          height={32}
                          className="object-cover relative z-10"
                        />
                      </div>
                      <span className="truncate text-sm flex-1 select-none">{character.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          includeCharacter(character.name)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 