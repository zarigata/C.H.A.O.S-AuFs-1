"use client"

import { useState } from "react"
import { Check, Palette, ImageIcon, Monitor, Sun, Moon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

interface ThemeOption {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  preview: string
}

export function ThemePicker() {
  const { setTheme, theme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState("default")

  const themeOptions: ThemeOption[] = [
    {
      id: "default",
      name: "C.H.A.O.S. Classic",
      primaryColor: "#245EDC",
      secondaryColor: "#ECE9D8",
      accentColor: "#316AC5",
      preview: "/placeholder.svg?height=100&width=150&text=Classic",
    },
    {
      id: "olive",
      name: "Olive Green",
      primaryColor: "#6D8C22",
      secondaryColor: "#F5F5DC",
      accentColor: "#8AAD37",
      preview: "/placeholder.svg?height=100&width=150&text=Olive",
    },
    {
      id: "silver",
      name: "Silver",
      primaryColor: "#7B8C98",
      secondaryColor: "#F0F0F0",
      accentColor: "#A9B6C2",
      preview: "/placeholder.svg?height=100&width=150&text=Silver",
    },
    {
      id: "royale",
      name: "Windows XP Royale",
      primaryColor: "#0A246A",
      secondaryColor: "#E3EAF6",
      accentColor: "#1C3E9C",
      preview: "/placeholder.svg?height=100&width=150&text=Royale",
    },
    {
      id: "bubblegum",
      name: "Bubblegum",
      primaryColor: "#FF69B4",
      secondaryColor: "#FFF0F5",
      accentColor: "#FF1493",
      preview: "/placeholder.svg?height=100&width=150&text=Bubblegum",
    },
    {
      id: "matrix",
      name: "Matrix",
      primaryColor: "#00FF00",
      secondaryColor: "#000000",
      accentColor: "#008800",
      preview: "/placeholder.svg?height=100&width=150&text=Matrix",
    },
  ]

  const backgroundOptions = [
    { id: "default", name: "Default", preview: "/placeholder.svg?height=80&width=120&text=Default" },
    { id: "bliss", name: "Bliss", preview: "/placeholder.svg?height=80&width=120&text=Bliss" },
    { id: "clouds", name: "Clouds", preview: "/placeholder.svg?height=80&width=120&text=Clouds" },
    { id: "abstract", name: "Abstract", preview: "/placeholder.svg?height=80&width=120&text=Abstract" },
    { id: "geometric", name: "Geometric", preview: "/placeholder.svg?height=80&width=120&text=Geometric" },
    { id: "custom", name: "Custom", preview: "/placeholder.svg?height=80&width=120&text=Custom" },
  ]

  return (
    <div className="border border-[#D4D0C8] rounded-md overflow-hidden bg-white h-full">
      <Tabs defaultValue="themes" className="h-full flex flex-col">
        <div className="bg-[#ECE9D8] border-b border-[#D4D0C8] p-2">
          <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8]">
            <TabsTrigger value="themes" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <Palette className="w-3 h-3 mr-1" />
              Themes
            </TabsTrigger>
            <TabsTrigger value="backgrounds" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <ImageIcon className="w-3 h-3 mr-1" />
              Backgrounds
            </TabsTrigger>
            <TabsTrigger value="display" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <Monitor className="w-3 h-3 mr-1" />
              Display
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="themes" className="flex-1 p-4 m-0 overflow-auto">
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-3">Choose a Theme</h3>
            <p className="text-sm text-gray-600 mb-3">
              Select a theme to customize the look and feel of your messenger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themeOptions.map((option) => (
              <Card
                key={option.id}
                onClick={() => setSelectedTheme(option.id)}
                className={`cursor-pointer border-2 ${
                  selectedTheme === option.id ? `border-[${option.accentColor}]` : "border-[#D4D0C8]"
                }`}
              >
                <CardContent className="p-3">
                  <div className="relative">
                    <img
                      src={option.preview || "/placeholder.svg"}
                      alt={option.name}
                      className="w-full h-auto rounded-sm border border-[#D4D0C8] mb-2"
                    />
                    {selectedTheme === option.id && (
                      <div className="absolute top-1 right-1 bg-[#316AC5] text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium">{option.name}</div>
                  <div className="flex mt-2 space-x-1">
                    <div
                      className="w-4 h-4 rounded-full border border-[#D4D0C8]"
                      style={{ backgroundColor: option.primaryColor }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full border border-[#D4D0C8]"
                      style={{ backgroundColor: option.secondaryColor }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full border border-[#D4D0C8]"
                      style={{ backgroundColor: option.accentColor }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button className="bg-[#316AC5] hover:bg-[#2A5BD7]">Apply Theme</Button>
          </div>
        </TabsContent>

        <TabsContent value="backgrounds" className="flex-1 p-4 m-0 overflow-auto">
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-3">Background Image</h3>
            <p className="text-sm text-gray-600 mb-3">Choose a background image for your chat windows.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {backgroundOptions.map((option) => (
              <div key={option.id} className="border border-[#D4D0C8] rounded-md p-2 cursor-pointer hover:bg-[#EBE8D8]">
                <img
                  src={option.preview || "/placeholder.svg"}
                  alt={option.name}
                  className="w-full h-auto rounded-sm border border-[#D4D0C8] mb-2"
                />
                <div className="text-sm text-center">{option.name}</div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Background Options</h4>
            <div className="space-y-2 border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA]">
              <div className="flex items-center">
                <input type="checkbox" id="stretch" className="mr-2" />
                <label htmlFor="stretch" className="text-sm">
                  Stretch to fit window
                </label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="tile" className="mr-2" />
                <label htmlFor="tile" className="text-sm">
                  Tile background
                </label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="center" className="mr-2" checked />
                <label htmlFor="center" className="text-sm">
                  Center background
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="mr-2 border-[#D4D0C8]">
              Browse...
            </Button>
            <Button className="bg-[#316AC5] hover:bg-[#2A5BD7]">Apply Background</Button>
          </div>
        </TabsContent>

        <TabsContent value="display" className="flex-1 p-4 m-0 overflow-auto">
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-3">Display Settings</h3>
            <p className="text-sm text-gray-600 mb-3">Customize how the messenger appears on your screen.</p>
          </div>

          <div className="space-y-4">
            <div className="border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA]">
              <h4 className="text-sm font-medium mb-2">Color Mode</h4>
              <div className="flex gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className={theme === "light" ? "bg-[#316AC5] hover:bg-[#2A5BD7]" : "border-[#D4D0C8]"}
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className={theme === "dark" ? "bg-[#316AC5] hover:bg-[#2A5BD7]" : "border-[#D4D0C8]"}
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Dark Mode
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className={theme === "system" ? "bg-[#316AC5] hover:bg-[#2A5BD7]" : "border-[#D4D0C8]"}
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </Button>
              </div>
            </div>

            <div className="border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA]">
              <h4 className="text-sm font-medium mb-2">Font Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <label className="text-sm w-24">Font Size:</label>
                  <select className="text-sm border border-[#D4D0C8] rounded-sm p-1 bg-white">
                    <option>Small</option>
                    <option selected>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="text-sm w-24">Font Family:</label>
                  <select className="text-sm border border-[#D4D0C8] rounded-sm p-1 bg-white">
                    <option>Arial</option>
                    <option selected>Tahoma</option>
                    <option>Verdana</option>
                    <option>Comic Sans MS</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA]">
              <h4 className="text-sm font-medium mb-2">Window Behavior</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="minimize" className="mr-2" checked />
                  <label htmlFor="minimize" className="text-sm">
                    Minimize to taskbar
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="startup" className="mr-2" checked />
                  <label htmlFor="startup" className="text-sm">
                    Start with Windows
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="sounds" className="mr-2" checked />
                  <label htmlFor="sounds" className="text-sm">
                    Enable notification sounds
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="animations" className="mr-2" checked />
                  <label htmlFor="animations" className="text-sm">
                    Enable animations
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button className="bg-[#316AC5] hover:bg-[#2A5BD7]">Save Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
