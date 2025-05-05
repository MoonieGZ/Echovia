"use client"

import React from "react"
import { useGenshinData } from "@/lib/genshin-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { RefreshCw } from "lucide-react"
import { useLanguage } from "@/lib/language-provider"
import { cn } from "@/lib/utils"

export default function ExcludedCharacters() {
  const { characters, settings, includeCharacter, toggleExclusion } = useGenshinData()
  const { t } = useLanguage()

  // Get excluded characters with their full data
  const excludedCharacters = characters.filter((char) => settings.characters.excluded.includes(char.name))

  return (
    <Card id="excluded-characters-section" className="scroll-mt-14">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-3xl font-medium">{t("excluded.title")}</span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Switch id="enable-exclusion" checked={settings.enableExclusion} onCheckedChange={toggleExclusion} />
              <Label htmlFor="enable-exclusion">{t("excluded.enableExclusion")}</Label>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      {settings.enableExclusion && (
        <CardContent>
          <div className="space-y-4">
            {excludedCharacters.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">{t("excluded.noCharacters")}</p>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      settings.characters.excluded.forEach((name) => {
                        includeCharacter(name)
                      })
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("excluded.resetAll")}
                  </Button>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {excludedCharacters.map((character) => (
                      <Card
                        key={character.name}
                        className={cn(
                          "overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-primary transition-all",
                          character.rarity === 5 ? "border-accent-5" : "border-accent-4",
                        )}
                        onClick={() => includeCharacter(character.name)}
                      >
                        <CardContent className="p-0 relative">
                          <div className="aspect-square relative overflow-hidden">
                            <div
                              className={cn(
                                "absolute inset-0 z-0",
                                character.rarity === 5 ? "rarity-5-gradient" : "rarity-4-gradient",
                              )}
                            ></div>

                            {/* Character image */}
                            <div className="absolute inset-0">
                              <Image
                                src={`/characters/${character.element}/${character.icon}?height=200&width=200&text=${encodeURIComponent(character.name)}`}
                                alt={character.name}
                                width={200}
                                height={200}
                                className="object-cover w-full h-full"
                              />
                            </div>

                            {/* Element icon in top-left corner */}
                            <div className="absolute top-2 left-2 z-10">
                              <div className="bg-background/80 rounded-full p-1">
                                <Image
                                  src={`/elements/${character.element}.webp?height=32&width=32`}
                                  alt={character.element}
                                  width={32}
                                  height={32}
                                  className="w-6 h-6"
                                />
                              </div>
                            </div>

                            {/* Character info overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent z-20">
                              <p className="text-sm font-medium truncate text-white">{character.name}</p>
                              <p className="text-xs text-white/80">
                                {character.rarity === 5 ? "⭐⭐⭐⭐⭐" : "⭐⭐⭐⭐"}
                              </p>
                            </div>

                            {/* Re-enable overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                              <span className="text-white font-medium">{t("excluded.clickToReEnable")}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
} 