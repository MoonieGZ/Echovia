"use client"

import { Settings, useGenshinData } from "@/lib/genshin-data-provider"
import { SectionCards, CardDescription } from "@/components/section-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Minus, Plus } from "lucide-react"
import React, { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn, fisherYatesShuffle } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"

type RandomResult = {
    characters: Array<{
        name: string
        rarity: number
        element: string
        icon: string
        selected?: boolean
        visible?: boolean
    }>
    bosses: Array<{
        name: string
        icon: string
        location: string
        link: string
        coop: boolean
        visible?: boolean
    }>
}

export default function GenshinPage() {
  const { characters, bosses, settings, excludeCharacter } = useGenshinData()
  const [result, setResult] = useState<RandomResult | null>(null)
  const [open, setOpen] = useState(false)
  const [randomizeType, setRandomizeType] = useState<"characters" | "bosses" | "combined">("characters")
  const { t } = useLanguage()
  const [isAnimating, setIsAnimating] = useState(false)

  // Check if all characters are currently selected
  const areAllCharactersSelected = result?.characters.every((char) => char.selected) || false

  // Function to animate items appearing one by one
  const animateResults = (newResult: RandomResult) => {
    setIsAnimating(true)

    // Initialize all items as not visible
    const initialResult = {
      characters: newResult.characters.map((char) => ({ ...char, visible: false })),
      bosses: newResult.bosses.map((boss) => ({ ...boss, visible: false })),
    }

    setResult(initialResult)

    // Animate bosses first, then characters
    const allItems = [
      ...initialResult.bosses.map((item, index) => ({ type: "boss", index })),
      ...initialResult.characters.map((item, index) => ({ type: "character", index })),
    ]

    // Reveal items one by one with a delay
    allItems.forEach((item, i) => {
      setTimeout(() => {
        setResult((prev) => {
          if (!prev) return prev

          if (item.type === "boss") {
            const updatedBosses = [...prev.bosses]
            updatedBosses[item.index] = { ...updatedBosses[item.index], visible: true }
            return { ...prev, bosses: updatedBosses }
          } else {
            const updatedCharacters = [...prev.characters]
            updatedCharacters[item.index] = { ...updatedCharacters[item.index], visible: true }
            return { ...prev, characters: updatedCharacters }
          }
        })

        // Set animating to false when all items are revealed
        if (i === allItems.length - 1) {
          setTimeout(() => setIsAnimating(false), 300)
        }
      }, i * 100) // 100ms delay between each item
    })
  }

  const getRandomizedCharacters = () => {
    // Step 1: Get eligible characters
    const enabledCharacters = characters.filter(
      (char) =>
        settings.characters.enabled[char.name] &&
        (!settings.enableExclusion || !settings.characters.excluded.includes(char.name)),
    )

    // Edge case: not enough characters in total
    if (enabledCharacters.length < settings.characters.count) {
      toast.error(t("rules.notEnoughCharacters.title"), {
        description: t("rules.notEnoughCharacters.description"),
      })
      return null
    }

    // Step 2: Split by rules
    const travelers = enabledCharacters.filter((c) => c.name.startsWith("Traveler ("))
    const nonTravelers = enabledCharacters.filter((c) => !c.name.startsWith("Traveler ("))

    const candidatePool = [...nonTravelers]

    // Step 3: If coopMode is disabled, optionally add 1 random Traveler
    if (!settings.rules.coopMode && travelers.length > 0) {
      const randomTraveler = travelers[Math.floor(Math.random() * travelers.length)]
      candidatePool.push(randomTraveler)
    }

    // Step 4: Apply 5-star rule (if active)
    let finalCharacters: typeof characters = []

    if (settings.rules.limitFiveStars) {
      const max5 = settings.rules.maxFiveStars
      const count = settings.characters.count

      const fiveStars = candidatePool.filter((c) => c.rarity === 5)
      const fourStars = candidatePool.filter((c) => c.rarity < 5)

      if (fiveStars.length < max5 || fourStars.length < count - max5) {
        toast.error(t("rules.notEnoughCharacters.title"), {
          description: t("rules.notEnoughCharacters.description"),
        })
        return null
      }

      const selected5 = [...fiveStars].sort(() => Math.random() - 0.5).slice(0, max5)
      const selected4 = [...fourStars].sort(() => Math.random() - 0.5).slice(0, count - selected5.length)

      finalCharacters = fisherYatesShuffle([...selected5, ...selected4])
    } else {
      // No 5-star limit, just take a random sample of the pool
      finalCharacters = fisherYatesShuffle(candidatePool).slice(0, settings.characters.count)
    }

    return finalCharacters.map((char) => ({ ...char, selected: false, visible: false }))
  }

  const getRandomizedBosses = () => {
    // Filter enabled bosses
    // If co-op mode is enabled, only include bosses with coop=true
    const enabledBosses = bosses.filter(
      (boss) => settings.bosses.enabled[boss.name] && (!settings.rules.coopMode || boss.coop),
    )

    // Check if we have enough enabled bosses
    if (enabledBosses.length < settings.bosses.count) {
      toast.error(t("rules.notEnoughBosses.title"), {
        description: t("rules.notEnoughBosses.description").replace("{count}", settings.bosses.count.toString()),
      })
      return null
    }

    // Shuffle and select bosses
    const selectedBosses = fisherYatesShuffle([...enabledBosses])
      .slice(0, settings.bosses.count)
      .map((boss) => ({ ...boss, visible: false }))

    return selectedBosses
  }

  const handleRandomize = (type: "characters" | "bosses" | "combined") => {
    setRandomizeType(type)

    let selectedCharacters: any[] = []
    let selectedBosses: any[] = []

    if (type === "characters" || type === "combined") {
      const characters = getRandomizedCharacters()
      if (!characters) return // Error occurred
      selectedCharacters = characters
    }

    if (type === "bosses" || type === "combined") {
      const bosses = getRandomizedBosses()
      if (!bosses) return // Error occurred
      selectedBosses = bosses
    }

    const newResult = {
      characters: selectedCharacters,
      bosses: selectedBosses,
    }

    setOpen(true)
    animateResults(newResult)
  }

  const toggleCharacterSelection = (index: number) => {
    if (!result || isAnimating) return

    setResult({
      ...result,
      characters: result.characters.map((char, i) => (i === index ? { ...char, selected: !char.selected } : char)),
    })
  }

  const toggleAllCharacters = () => {
    if (!result || isAnimating) return

    // If all characters are currently selected, deselect all
    // Otherwise, select all
    const newSelectedState = !areAllCharactersSelected

    setResult({
      ...result,
      characters: result.characters.map((char) => ({ ...char, selected: newSelectedState })),
    })
  }

  const handleAcceptSelected = () => {
    if (!result || isAnimating) return

    // Get selected characters
    const selectedCharacters = result.characters.filter((char) => char.selected)

    if (selectedCharacters.length === 0) {
      toast.error(t("results.noCharactersSelected"), {
        description: t("results.selectAtLeastOne"),
      })
      return
    }

    // Exclude selected characters
    selectedCharacters.forEach((char) => {
      excludeCharacter(char.name)
    })

    toast.success(t("results.charactersAccepted"), {
      description: `${selectedCharacters.length} ${t("results.charactersExcluded")}`,
    })

    setOpen(false)
  }

  const handleBossClick = (link: string) => {
    if (isAnimating) return
    window.open(link, "_blank", "noopener,noreferrer")
  }

  // Function to process boss name - remove "⭐ - " prefix if present
  const processBossName = (name: string) => {
    if (name.startsWith("⭐ - ")) {
      return name.substring(4) // Remove the "⭐ - " prefix
    }
    return name
  }

  // Function to determine if a boss is a legend
  const isLegendBoss = (name: string) => {
    return name.startsWith("⭐ - ")
  }

  // Reset animation state when dialog closes
  useEffect(() => {
    if (!open) {
      setIsAnimating(false)
    }
  }, [open])

  const availableBosses = bosses.filter((boss) => settings.bosses.enabled[boss.name]).length
  const availableCharacters = characters.filter((char) => settings.characters.enabled[char.name] && (!settings.enableExclusion || !settings.characters.excluded.includes(char.name))).length

  const updateSettings = (newSettings: Partial<Settings>) => {
    updateSettings(newSettings)
  }

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
                  <Card className="@container/card">
                    <CardHeader>
                      <CardTitle>{t("genshin.randomizer")}</CardTitle>
                    </CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      <Button className="flex-1" onClick={() => handleRandomize("characters")}>{t("main.roll.characters")}</Button>
                      <Button className="flex-1" onClick={() => handleRandomize("bosses")}>{t("main.roll.bosses")}</Button>
                      <Button className="flex-1" onClick={() => handleRandomize("combined")}>{t("main.roll.both")}</Button>
                    </div>
                  </Card>
                  <Card className="@container/card">
                    <CardHeader>
                      <CardTitle>{t("main.activeRules")}</CardTitle>
                    </CardHeader>
                    <div className="p-4 flex flex-wrap gap-2">
                      {settings.rules.coopMode && <span className="badge">Co-op Mode: Enabled</span>}
                      {settings.rules.limitFiveStars && <span className="badge">5★ Limit: Max {settings.rules.maxFiveStars}</span>}
                      {!settings.rules.coopMode && !settings.rules.limitFiveStars && <span className="text-muted-foreground">{t("main.noRules")}</span>}
                    </div>
                  </Card>
                  {settings.enableExclusion && settings.characters.excluded.length > 0 && (
                    <Card className="@container/card">
                      <CardHeader>
                        <CardTitle>{t("accepted.title")} ({settings.characters.excluded.length})</CardTitle>
                      </CardHeader>
                      <div className="p-4 flex flex-wrap gap-2">
                        {characters.filter((char) => settings.characters.excluded.includes(char.name)).map((char) => (
                          <span key={char.name} className="badge">{char.name}</span>
                        ))}
                      </div>
                    </Card>
                  )}
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-3xl dialog-content">
                      <DialogHeader>
                        <DialogTitle>{t("results.title")}</DialogTitle>
                      </DialogHeader>
                      {open && result && (
                        <ScrollArea className="max-h-[70vh]">
                          <div className="space-y-6 p-1">
                            {result?.bosses.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                  {t("main.bosses")} ({result.bosses.length})
                                </h3>
                                <div className="results-grid">
                                  {result.bosses.map((boss) => (
                                    <div
                                      key={boss.name}
                                      className={cn("transition-opacity duration-300", boss.visible ? "opacity-100" : "opacity-0")}
                                    >
                                      <Card
                                        className={cn(
                                          "overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all boss-card",
                                          boss.visible && "animate-appear",
                                        )}
                                        onClick={() => handleBossClick(boss.link)}
                                      >
                                        <CardContent className="p-0 relative">
                                          <div className="aspect-square relative overflow-hidden">
                                            <div
                                              className={cn("absolute inset-0 z-0", isLegendBoss(boss.name) && "rarity-5-gradient")}
                                            ></div>
                                            <div className="boss-image-container">
                                              <Image
                                                src={`/bosses/${boss.location}/${boss.icon}?text=${encodeURIComponent(boss.name)}`}
                                                alt={processBossName(boss.name)}
                                                width={256}
                                                height={256}
                                                className="object-cover"
                                              />
                                            </div>
                                            {isLegendBoss(boss.name) && (
                                              <div className="card-corner-element right">
                                                <Badge className="legend-badge">{t("main.legend")}</Badge>
                                              </div>
                                            )}
                                            <div className="boss-info-overlay">
                                              <p
                                                className="text-sm font-medium truncate text-shadow"
                                                title={processBossName(boss.name)}
                                              >
                                                {processBossName(boss.name)}
                                              </p>
                                              <p className="text-xs text-white/80 text-shadow">{boss.location}</p>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {result.characters.length > 0 && (
                              <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                  {t("main.characters")} ({result.characters.length})
                                </h3>
                                <div className="results-grid">
                                  {result.characters.map((character, index) => (
                                    <div
                                      key={character.name}
                                      className={cn(
                                        "transition-opacity duration-300",
                                        character.visible ? "opacity-100" : "opacity-0",
                                      )}
                                    >
                                      <Card
                                        className={cn(
                                          "overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all character-card",
                                          character.selected ? "ring-2 ring-primary" : "",
                                          character.visible && "animate-appear",
                                          character.rarity === 5 ? "border-accent-5" : "border-accent-4",
                                        )}
                                        onClick={() => settings.enableExclusion && toggleCharacterSelection(index)}
                                      >
                                        <CardContent className="p-0 relative">
                                          <div className="aspect-square relative overflow-hidden">
                                            <div
                                              className={cn(
                                                "absolute inset-0 z-0",
                                                character.rarity === 5 ? "rarity-5-gradient" : "rarity-4-gradient",
                                              )}
                                            ></div>
                                            <div className="character-image-container">
                                              <Image
                                                src={`/characters/${character.element}/${character.icon}?text=${encodeURIComponent(character.name)}`}
                                                alt={character.name}
                                                width={256}
                                                height={256}
                                                className="object-cover"
                                              />
                                            </div>
                                            <div className="card-corner-element left">
                                              <div className="element-icon-container">
                                                <Image
                                                  src={`/elements/${character.element}.webp?height=32&width=32`}
                                                  alt={character.element}
                                                  width={32}
                                                  height={32}
                                                  className="element-icon"
                                                />
                                              </div>
                                            </div>
                                            {settings.enableExclusion && (
                                              <div className="card-corner-element right">
                                                <div className="checkbox-container">
                                                  <Checkbox
                                                    checked={character.selected}
                                                    onCheckedChange={() => toggleCharacterSelection(index)}
                                                    id={`select-${character.name}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="checkbox-select"
                                                  />
                                                </div>
                                              </div>
                                            )}
                                            <div className="character-info-overlay">
                                              <p className="text-sm font-medium truncate text-shadow">{character.name}</p>
                                              <p className="text-xs text-white/80 text-shadow">
                                                {character.rarity === 5 ? "⭐⭐⭐⭐⭐" : "⭐⭐⭐⭐"}
                                              </p>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex justify-end space-x-2">
                              {(randomizeType === "characters" || randomizeType === "combined") &&
                                result.characters.length > 0 &&
                                settings.enableExclusion && (
                                <Button
                                  variant="outline"
                                  onClick={toggleAllCharacters}
                                  disabled={isAnimating}
                                  className="button-enhanced"
                                >
                                  {areAllCharactersSelected ? t("results.unselectAll") : t("results.selectAll")}
                                </Button>
                              )}
                              <Button
                                onClick={
                                  randomizeType === "bosses" || !settings.enableExclusion || result.characters.length === 0
                                    ? () => setOpen(false)
                                    : handleAcceptSelected
                                }
                                disabled={isAnimating}
                                className="button-enhanced"
                              >
                                {randomizeType === "bosses" || !settings.enableExclusion || result.characters.length === 0
                                  ? t("results.close")
                                  : t("results.accept")}
                              </Button>
                            </div>
                          </div>
                        </ScrollArea>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 