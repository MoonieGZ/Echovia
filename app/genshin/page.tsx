"use client"

import { useGenshinData } from "@/lib/genshin-data-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Minus, Plus, X, Settings2, Users, Filter, RefreshCw, Dices, Dice5 } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn, fisherYatesShuffle } from "@/lib/utils"
import { toast } from "sonner"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useTranslations } from "next-intl"

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
  const { characters, bosses, settings, excludeCharacter, updateSettings, includeCharacter } = useGenshinData()
  const [result, setResult] = useState<RandomResult | null>(null)
  const [open, setOpen] = useState(false)
  const [randomizeType, setRandomizeType] = useState<"characters" | "bosses" | "combined">("characters")
  const [streamsOpen, setStreamsOpen] = useState(false)
  const t = useTranslations()
  const [isAnimating, setIsAnimating] = useState(false)

  const availableBosses = bosses.filter((boss) => settings.bosses.enabled[boss.name]).length
  const availableCharacters = characters.filter(
    (char) =>
      settings.characters.enabled[char.name] &&
      (!settings.enableExclusion || !settings.characters.excluded.includes(char.name)),
  ).length
  const excludedCharacters = characters.filter((char) => settings.characters.excluded.includes(char.name))

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

    // Exclude all selected characters at once
    excludeCharacter(selectedCharacters.map((char) => char.name))

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

  function StatsCard({
    title,
    value,
    readOnly = false,
    onIncrease,
    onDecrease,
  }: {
    title: string
    value: number
    readOnly?: boolean
    onIncrease?: () => void
    onDecrease?: () => void
  }) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-xs text-muted-foreground">{title}</p>
            </div>
            <div className={cn("flex flex-col gap-1", readOnly && "opacity-0")}>
              <Button variant="outline" size="icon" className="h-6 w-6" onClick={onIncrease}>
                <Plus className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="icon" className="h-6 w-6" onClick={onDecrease}>
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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
                <Tabs defaultValue="randomizer" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="randomizer" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span>{t("genshin.randomizer")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      <span>{t("rules.title")}</span>
                    </TabsTrigger>
                    <TabsTrigger value="excluded" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {t("excluded.title")}{" "}
                        {settings.enableExclusion && excludedCharacters.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {excludedCharacters.length}
                          </Badge>
                        )}
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="randomizer" className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatsCard title={t("genshin.availableCharacters")} value={availableCharacters} readOnly />
                      <StatsCard title={t("genshin.availableBosses")} value={availableBosses} readOnly />
                      <StatsCard
                        title={t("genshin.characterCount")}
                        value={settings.characters.count ?? 1}
                        onIncrease={() => {
                          const value = Math.min(availableCharacters, (settings.characters.count ?? 1) + 1)
                          updateSettings({
                            ...settings,
                            characters: {
                              ...settings.characters,
                              count: value,
                            },
                          })
                        }}
                        onDecrease={() => {
                          const value = Math.max(1, (settings.characters.count ?? 1) - 1)
                          updateSettings({
                            ...settings,
                            characters: {
                              ...settings.characters,
                              count: value,
                            },
                          })
                        }}
                      />
                      <StatsCard
                        title={t("genshin.bossCount")}
                        value={settings.bosses.count ?? 1}
                        onIncrease={() => {
                          const value = Math.min(availableBosses, (settings.bosses.count ?? 1) + 1)
                          updateSettings({
                            ...settings,
                            bosses: {
                              ...settings.bosses,
                              count: value,
                            },
                          })
                        }}
                        onDecrease={() => {
                          const value = Math.max(1, (settings.bosses.count ?? 1) - 1)
                          updateSettings({
                            ...settings,
                            bosses: {
                              ...settings.bosses,
                              count: value,
                            },
                          })
                        }}
                      />
                    </div>

                    {/* Randomize Buttons */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("genshin.randomizer")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {settings.rules.coopMode && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              {t("rules.coopMode.enabled")}
                            </Badge>
                          )}
                          {settings.rules.limitFiveStars && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                              {t("rules.fiveStarLimit.enabled")} ({settings.rules.maxFiveStars})
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                          <Button className="flex-1" onClick={() => handleRandomize("characters")}>
                            <Dice5 className="h-4 w-4 mr-2" />
                            {t("main.roll.characters")}
                          </Button>
                          <Button className="flex-1" onClick={() => handleRandomize("bosses")}>
                            <Dice5 className="h-4 w-4 mr-2" />
                            {t("main.roll.bosses")}
                          </Button>
                          <Button className="flex-1" onClick={() => handleRandomize("combined")}>
                            <Dices className="h-4 w-4 mr-2" />
                            {t("main.roll.both")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{t("genshin.streams")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Collapsible open={streamsOpen} onOpenChange={setStreamsOpen}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              <span>{t("settings.toggle.group")}</span>
                              {streamsOpen ? (
                                <Minus className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h3 className="text-lg font-medium">Klys_A</h3>
                                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                  <iframe
                                    src="https://player.twitch.tv/?channel=Klys_A&parent=localhost&muted=true"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allowFullScreen
                                    title="Klys_A Stream"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-lg font-medium">SimaSimaa</h3>
                                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                  <iframe
                                    src="https://player.twitch.tv/?channel=SimaSimaa&parent=localhost&muted=true"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allowFullScreen
                                    title="SimaSimaa Stream"
                                  />
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rules">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t("rules.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium">{t("rules.activeRules")}</h3>
                            <div className="flex flex-wrap gap-2">
                              {settings.rules.coopMode && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-green-500" />
                                  {t("rules.coopMode.enabled")}
                                </Badge>
                              )}
                              {settings.rules.limitFiveStars && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                                  {t("rules.fiveStarLimit.enabled")} ({settings.rules.maxFiveStars})
                                </Badge>
                              )}
                              {!settings.rules.coopMode && !settings.rules.limitFiveStars && (
                                <span className="text-sm text-muted-foreground">{t("rules.noActiveRules")}</span>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Rules Settings */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <h4 className="text-base font-medium">{t("rules.coopMode.title")}</h4>
                                <p className="text-sm text-muted-foreground">{t("rules.coopMode.description")}</p>
                              </div>
                              <Switch
                                checked={settings.rules.coopMode}
                                onCheckedChange={(checked) =>
                                  updateSettings({
                                    ...settings,
                                    rules: {
                                      ...settings.rules,
                                      coopMode: checked,
                                    },
                                  })
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <h4 className="text-base font-medium">{t("rules.fiveStarLimit.title")}</h4>
                                <p className="text-sm text-muted-foreground">{t("rules.fiveStarLimit.description")}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                {settings.rules.limitFiveStars && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateSettings({
                                          ...settings,
                                          rules: {
                                            ...settings.rules,
                                            maxFiveStars: Math.max(0, settings.rules.maxFiveStars - 1),
                                          },
                                        })
                                      }
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center">{settings.rules.maxFiveStars}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateSettings({
                                          ...settings,
                                          rules: {
                                            ...settings.rules,
                                            maxFiveStars: settings.rules.maxFiveStars + 1,
                                          },
                                        })
                                      }
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                                <Switch
                                  checked={settings.rules.limitFiveStars}
                                  onCheckedChange={(checked) =>
                                    updateSettings({
                                      ...settings,
                                      rules: {
                                        ...settings.rules,
                                        limitFiveStars: checked,
                                      },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="excluded">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <span>
                            {t("excluded.title")} ({excludedCharacters.length})
                          </span>
                          <div className="flex items-center space-x-2">
                            {settings.enableExclusion && excludedCharacters.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
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
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="enable-exclusion"
                                checked={settings.enableExclusion}
                                onCheckedChange={(checked) => {
                                  updateSettings({
                                    ...settings,
                                    enableExclusion: checked,
                                  })
                                }}
                              />
                              <label htmlFor="enable-exclusion" className="text-sm cursor-pointer">
                                {t("excluded.enableExclusion")}
                              </label>
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {!settings.enableExclusion ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">{t("excluded.disabled")}</p>
                            <p className="text-sm text-muted-foreground mt-1">{t("excluded.enableToUse")}</p>
                          </div>
                        ) : excludedCharacters.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Users className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">{t("excluded.noCharacters")}</p>
                          </div>
                        ) : (
                          <TooltipProvider>
                            <ScrollArea className="h-[300px] pr-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {excludedCharacters.map((character) => (
                                  <Tooltip key={character.name} content={t("excluded.clickToReEnable")}>
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
                          </TooltipProvider>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="streams">
                    <Card>
                      <CardHeader>
                        <CardTitle>Live Streams</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Collapsible open={streamsOpen} onOpenChange={setStreamsOpen}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              <span>Toggle Streams</span>
                              {streamsOpen ? (
                                <Minus className="h-4 w-4" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h3 className="text-lg font-medium">Klys_A</h3>
                                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                  <iframe
                                    src="https://player.twitch.tv/?channel=Klys_A&parent=localhost&muted=true"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allowFullScreen
                                    title="Klys_A Stream"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-lg font-medium">SimaSimaa</h3>
                                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                  <iframe
                                    src="https://player.twitch.tv/?channel=SimaSimaa&parent=localhost&muted=true"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    allowFullScreen
                                    title="SimaSimaa Stream"
                                  />
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Dialog
                  open={open}
                  onOpenChange={(newOpen) => {
                    if (!newOpen) {
                      setTimeout(() => setOpen(false), 10)
                    } else {
                      setOpen(true)
                    }
                  }}
                >
                  <DialogContent className="max-w-3xl dialog-content">
                    <DialogHeader>
                      <DialogTitle>{t("results.title")}</DialogTitle>
                    </DialogHeader>
                    {result && (
                      <ScrollArea className="max-h-[70vh]">
                        <div className="space-y-6 p-1">
                          {result?.bosses.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="text-lg font-medium">
                                {t("common.bosses")} ({result.bosses.length})
                              </h3>
                              <div className="results-grid">
                                {result.bosses.map((boss) => (
                                  <div
                                    key={boss.name}
                                    className={cn(
                                      "transition-opacity duration-300",
                                      boss.visible ? "opacity-100" : "opacity-0",
                                    )}
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
                                            className={cn(
                                              "absolute inset-0 z-0",
                                              isLegendBoss(boss.name) && "rarity-5-gradient",
                                            )}
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
                                {t("common.characters")} ({result.characters.length})
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
                                randomizeType === "bosses" ||
                                !settings.enableExclusion ||
                                result.characters.length === 0
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
      </SidebarInset>
    </SidebarProvider>
  )
}
