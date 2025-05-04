"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Define the Character and Boss types
export type Character = {
  name: string
  rarity: number
  element: string
  icon: string
}

export type Boss = {
  name: string
  icon: string
  location: string
  link: string
  coop: boolean
}

// Update the Settings type to include excluded characters and the exclusion toggle
export type Settings = {
  characters: {
    count: number
    enabled: Record<string, boolean>
    excluded: string[]
  }
  bosses: {
    count: number
    enabled: Record<string, boolean>
  }
  enableExclusion: boolean
  rules: {
    coopMode: boolean
    limitFiveStars: boolean
    maxFiveStars: number
  }
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  characters: {
    count: 4,
    enabled: {},
    excluded: [],
  },
  bosses: {
    count: 8,
    enabled: {},
  },
  enableExclusion: true,
  rules: {
    coopMode: false,
    limitFiveStars: false,
    maxFiveStars: 2,
  },
}

// Update the GenshinDataContextType to include new functions
type GenshinDataContextType = {
  characters: Character[]
  bosses: Boss[]
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  updateCharacterEnabled: (name: string, enabled: boolean) => void
  updateBossEnabled: (name: string, enabled: boolean) => void
  updateCharacterCount: (count: number) => void
  updateBossCount: (count: number) => void
  excludeCharacter: (name: string) => void
  includeCharacter: (name: string) => void
  toggleExclusion: (enabled: boolean) => void
  toggleCoopMode: (enabled: boolean) => void
  toggleLimitFiveStars: (enabled: boolean) => void
  updateMaxFiveStars: (count: number) => void
  getNonCoopBosses: () => Boss[]
  disableLegendBosses: () => void
  resetSettings: () => void
  isLoading: boolean
  bossLocations: string[]
}

const GenshinDataContext = createContext<GenshinDataContextType | undefined>(undefined)

// Local Storage key
const STORAGE_KEY = "echovia-settings"

// Update the initial state in the GenshinDataProvider
export function GenshinDataProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [bosses, setBosses] = useState<Boss[]>([])
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SETTINGS })
  const [isLoading, setIsLoading] = useState(true)
  const [bossLocations, setBossLocations] = useState<string[]>([])

  // Save settings to Local Storage
  const saveSettings = (newSettings: Settings) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    }
  }

  // Load settings from Local Storage
  const loadSettings = (): Settings | null => {
    if (typeof window === "undefined") return null
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  }

  // Initialize data
  const initializeData = (characters: Character[], bosses: Boss[], savedSettings: Settings | null) => {
    // Initialize enabled maps
    const characterEnabled: Record<string, boolean> = {}
    const bossEnabled: Record<string, boolean> = {}

    characters.forEach((char) => {
      characterEnabled[char.name] = savedSettings?.characters.enabled[char.name] ?? true
    })

    bosses.forEach((boss) => {
      bossEnabled[boss.name] = savedSettings?.bosses.enabled[boss.name] ?? true
    })

    // Get unique boss locations
    const locations = [...new Set(bosses.map((boss) => boss.location))]

    setCharacters(characters)
    setBosses(bosses)
    setBossLocations(locations)
    setSettings({
      ...DEFAULT_SETTINGS,
      ...savedSettings,
      characters: {
        ...DEFAULT_SETTINGS.characters,
        ...savedSettings?.characters,
        enabled: characterEnabled,
      },
      bosses: {
        ...DEFAULT_SETTINGS.bosses,
        ...savedSettings?.bosses,
        enabled: bossEnabled,
      },
    })
    setIsLoading(false)
  }

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [charactersData, bossesData] = await Promise.all([
          fetch("/data/characters.json").then((res) => res.json()),
          fetch("/data/bosses.json").then((res) => res.json()),
        ])

        const savedSettings = loadSettings()
        initializeData(charactersData, bossesData, savedSettings)
      } catch (error) {
        console.error("Failed to load data:", error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Update character enabled state
  const updateCharacterEnabled = (name: string, enabled: boolean) => {
    const updatedSettings = {
      ...settings,
      characters: {
        ...settings.characters,
        enabled: {
          ...settings.characters.enabled,
          [name]: enabled,
        },
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Update boss enabled state
  const updateBossEnabled = (name: string, enabled: boolean) => {
    const updatedSettings = {
      ...settings,
      bosses: {
        ...settings.bosses,
        enabled: {
          ...settings.bosses.enabled,
          [name]: enabled,
        },
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Update character count
  const updateCharacterCount = (count: number) => {
    const updatedSettings = {
      ...settings,
      characters: {
        ...settings.characters,
        count,
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Update boss count
  const updateBossCount = (count: number) => {
    const updatedSettings = {
      ...settings,
      bosses: {
        ...settings.bosses,
        count,
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Exclude character
  const excludeCharacter = (name: string) => {
    const updatedSettings = {
      ...settings,
      characters: {
        ...settings.characters,
        excluded: [...settings.characters.excluded, name],
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Include character
  const includeCharacter = (name: string) => {
    const updatedSettings = {
      ...settings,
      characters: {
        ...settings.characters,
        excluded: settings.characters.excluded.filter((char) => char !== name),
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Toggle exclusion
  const toggleExclusion = (enabled: boolean) => {
    const updatedSettings = {
      ...settings,
      enableExclusion: enabled,
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Get non-coop bosses
  const getNonCoopBosses = () => {
    return bosses.filter((boss) => !boss.coop)
  }

  // Toggle coop mode
  const toggleCoopMode = (enabled: boolean) => {
    const updatedSettings = {
      ...settings,
      rules: {
        ...settings.rules,
        coopMode: enabled,
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Toggle limit five stars
  const toggleLimitFiveStars = (enabled: boolean) => {
    const updatedSettings = {
      ...settings,
      rules: {
        ...settings.rules,
        limitFiveStars: enabled,
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Update max five stars
  const updateMaxFiveStars = (count: number) => {
    const updatedSettings = {
      ...settings,
      rules: {
        ...settings.rules,
        maxFiveStars: count,
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Disable legend bosses
  const disableLegendBosses = () => {
    const updatedSettings = {
      ...settings,
      bosses: {
        ...settings.bosses,
        enabled: {
          ...settings.bosses.enabled,
          ...Object.fromEntries(
            bosses
              .filter((boss) => boss.name.includes("⭐ -"))
              .map((boss) => [boss.name, false]),
          ),
        },
      },
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  // Reset settings
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
  }

  return (
    <GenshinDataContext.Provider
      value={{
        characters,
        bosses,
        settings,
        updateSettings,
        updateCharacterEnabled,
        updateBossEnabled,
        updateCharacterCount,
        updateBossCount,
        excludeCharacter,
        includeCharacter,
        toggleExclusion,
        toggleCoopMode,
        toggleLimitFiveStars,
        updateMaxFiveStars,
        getNonCoopBosses,
        disableLegendBosses,
        resetSettings,
        isLoading,
        bossLocations,
      }}
    >
      {children}
    </GenshinDataContext.Provider>
  )
}

export function useGenshinData() {
  const context = useContext(GenshinDataContext)
  if (context === undefined) {
    throw new Error("useGenshinData must be used within a GenshinDataProvider")
  }
  return context
} 