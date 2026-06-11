"use client"

import { createContext, useContext, useState } from "react"

export type Theme = "dark" | "deep-black" | "cyber-grid"
export type InterfaceScale = "compact" | "default" | "spacious"

interface PreferencesContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  scale: InterfaceScale
  setScale: (scale: InterfaceScale) => void
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined
)

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setTheme] = useState<Theme>("dark")
  const [scale, setScale] = useState<InterfaceScale>("default")

  // TODO: Persist to localStorage on production:
  // useEffect(() => {
  //   localStorage.setItem("theme", theme)
  //   localStorage.setItem("scale", scale)
  // }, [theme, scale])
  //
  // useEffect(() => {
  //   const savedTheme = localStorage.getItem("theme") as Theme | null
  //   const savedScale = localStorage.getItem("scale") as InterfaceScale | null
  //   if (savedTheme) setTheme(savedTheme)
  //   if (savedScale) setScale(savedScale)
  // }, [])

  return (
    <PreferencesContext.Provider value={{ theme, setTheme, scale, setScale }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider")
  }
  return context
}

// Theme variants for backgrounds and accents
export const themeVariants = {
  dark: {
    bgGradient:
      "linear-gradient(135deg, oklch(0.16 0.012 250) 0%, oklch(0.18 0.014 260) 100%)",
    borderAccent: "oklch(0.78 0.16 195 / 0.3)",
    glowColor: "oklch(0.78 0.16 195 / 0.2)",
  },
  "deep-black": {
    bgGradient:
      "linear-gradient(135deg, oklch(0.08 0.006 250) 0%, oklch(0.12 0.008 260) 100%)",
    borderAccent: "oklch(0.78 0.16 195 / 0.15)",
    glowColor: "oklch(0.78 0.16 195 / 0.1)",
  },
  "cyber-grid": {
    bgGradient:
      "linear-gradient(135deg, oklch(0.14 0.016 200) 0%, oklch(0.16 0.018 250) 100%)",
    borderAccent: "oklch(0.74 0.16 60 / 0.4)",
    glowColor: "oklch(0.74 0.16 60 / 0.25)",
  },
}

// Scale variants for sizing
export const scaleVariants = {
  compact: {
    headingSize: "text-lg sm:text-xl",
    labelSize: "text-xs",
    bodySize: "text-xs sm:text-sm",
    cardPadding: "p-2 sm:p-3",
    containerPadding: "px-3 py-6 sm:px-4 lg:px-8",
    gapSize: "gap-2 sm:gap-3",
  },
  default: {
    headingSize: "text-2xl sm:text-3xl",
    labelSize: "text-sm",
    bodySize: "text-sm sm:text-base",
    cardPadding: "p-4 sm:p-5",
    containerPadding: "px-4 py-8 sm:px-6 lg:px-10 lg:py-12",
    gapSize: "gap-4 sm:gap-6",
  },
  spacious: {
    headingSize: "text-3xl sm:text-4xl",
    labelSize: "text-sm sm:text-base",
    bodySize: "text-base sm:text-lg",
    cardPadding: "p-6 sm:p-8",
    containerPadding: "px-6 py-12 sm:px-8 lg:px-12 lg:py-16",
    gapSize: "gap-6 sm:gap-8",
  },
}
