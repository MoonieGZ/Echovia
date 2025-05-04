"use client"

import { createContext, useContext, useState, useEffect } from "react"
import React from "react"

type Language = "en" | "fr"

type Translations = {
  [key: string]: string | { [key: string]: string }
}

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const DEFAULT_LANGUAGE: Language = "en"

// Local Storage key
const STORAGE_KEY = "echovia-language"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [translations, setTranslations] = useState<Translations>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load language from Local Storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language
      if (savedLanguage) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/translations/${language}.json`)
        const data = await response.json()
        setTranslations(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load translations:", error)
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [language])

  // Update language
  const updateLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLanguage)
    }
  }

  // Translation function
  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k]
      } else {
        return key
      }
    }

    return value || key
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: updateLanguage,
        t,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
} 