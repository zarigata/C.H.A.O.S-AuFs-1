"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface ThemeContextProps {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: () => {},
})

export const ThemeProvider = ({
  children,
  ...props
}: {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    if (storedTheme) {
      setTheme(storedTheme)
    } else if (props.enableSystem) {
      setTheme("system")
    }
  }, [props.enableSystem])

  useEffect(() => {
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      document.documentElement.setAttribute("data-theme", systemTheme)
    } else if (theme) {
      document.documentElement.setAttribute("data-theme", theme)
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
