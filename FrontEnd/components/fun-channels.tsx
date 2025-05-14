"use client"

import { useState } from "react"
import { Gamepad2, Gift, Smile, MessageSquare, Sparkles } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface GameItem {
  id: number
  title: string
  description: string
  image: string
  category: string
}

interface GiftItem {
  id: number
  title: string
  description: string
  image: string
  price: string
}

export function FunChannels() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const games: GameItem[] = [
    {
      id: 1,
      title: "Tic Tac Toe",
      description: "Challenge your friends to a classic game of Tic Tac Toe",
      image: "/placeholder.svg?height=100&width=100&text=TicTacToe",
      category: "board",
    },
    {
      id: 2,
      title: "Checkers",
      description: "Play checkers with friends or random opponents",
      image: "/placeholder.svg?height=100&width=100&text=Checkers",
      category: "board",
    },
    {
      id: 3,
      title: "Hangman",
      description: "Guess the word before it's too late",
      image: "/placeholder.svg?height=100&width=100&text=Hangman",
      category: "word",
    },
    {
      id: 4,
      title: "Snake",
      description: "Control the snake and eat as many apples as possible",
      image: "/placeholder.svg?height=100&width=100&text=Snake",
      category: "arcade",
    },
    {
      id: 5,
      title: "Minesweeper",
      description: "Clear the minefield without detonating any mines",
      image: "/placeholder.svg?height=100&width=100&text=Minesweeper",
      category: "puzzle",
    },
    {
      id: 6,
      title: "Solitaire",
      description: "The classic card game to pass the time",
      image: "/placeholder.svg?height=100&width=100&text=Solitaire",
      category: "card",
    },
  ]

  const gifts: GiftItem[] = [
    {
      id: 1,
      title: "Birthday Cake",
      description: "Send a virtual birthday cake to celebrate",
      image: "/placeholder.svg?height=100&width=100&text=Cake",
      price: "50 points",
    },
    {
      id: 2,
      title: "Bouquet",
      description: "A beautiful virtual flower bouquet",
      image: "/placeholder.svg?height=100&width=100&text=Flowers",
      price: "75 points",
    },
    {
      id: 3,
      title: "Trophy",
      description: "Award someone for their achievement",
      image: "/placeholder.svg?height=100&width=100&text=Trophy",
      price: "100 points",
    },
    {
      id: 4,
      title: "Teddy Bear",
      description: "A cute virtual teddy bear",
      image: "/placeholder.svg?height=100&width=100&text=Bear",
      price: "125 points",
    },
  ]

  const filteredGames = selectedCategory === "all" ? games : games.filter((game) => game.category === selectedCategory)

  const gameCategories = [
    { id: "all", label: "All Games", icon: Gamepad2 },
    { id: "board", label: "Board Games", icon: Gamepad2 },
    { id: "card", label: "Card Games", icon: Gamepad2 },
    { id: "word", label: "Word Games", icon: MessageSquare },
    { id: "arcade", label: "Arcade", icon: Gamepad2 },
    { id: "puzzle", label: "Puzzles", icon: Gamepad2 },
  ]

  return (
    <div className="border border-[#D4D0C8] rounded-md overflow-hidden bg-white h-full">
      <Tabs defaultValue="games" className="h-full flex flex-col">
        <div className="bg-[#ECE9D8] border-b border-[#D4D0C8] p-2">
          <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8]">
            <TabsTrigger value="games" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <Gamepad2 className="w-3 h-3 mr-1" />
              Games
            </TabsTrigger>
            <TabsTrigger value="gifts" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <Gift className="w-3 h-3 mr-1" />
              Virtual Gifts
            </TabsTrigger>
            <TabsTrigger value="emoticons" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              <Smile className="w-3 h-3 mr-1" />
              Emoticons
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="games" className="flex-1 p-4 m-0 overflow-auto">
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-3">Games & Activities</h3>
            <p className="text-sm text-gray-600 mb-3">Play games with your friends while chatting!</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {gameCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={
                    selectedCategory === category.id
                      ? "bg-[#316AC5] hover:bg-[#2A5BD7]"
                      : "border-[#D4D0C8] bg-[#F5F4EA]"
                  }
                >
                  <category.icon className="w-3 h-3 mr-1" />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game) => (
              <Card key={game.id} className="border-[#D4D0C8]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{game.title}</CardTitle>
                  <CardDescription className="text-xs">{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 pt-0 flex justify-center">
                  <img src={game.image || "/placeholder.svg"} alt={game.title} className="h-20 w-20 object-contain" />
                </CardContent>
                <CardFooter>
                  <Button className="w-full text-xs bg-[#316AC5] hover:bg-[#2A5BD7]">
                    <Gamepad2 className="w-3 h-3 mr-1" />
                    Play Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gifts" className="flex-1 p-4 m-0 overflow-auto">
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-3">Virtual Gifts</h3>
            <p className="text-sm text-gray-600 mb-3">Send virtual gifts to your friends to show you care!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gifts.map((gift) => (
              <Card key={gift.id} className="border-[#D4D0C8]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{gift.title}</CardTitle>
                  <CardDescription className="text-xs">{gift.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 pt-0 flex justify-center">
                  <img src={gift.image || "/placeholder.svg"} alt={gift.title} className="h-20 w-20 object-contain" />
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="text-xs text-center w-full font-medium">{gift.price}</div>
                  <Button className="w-full text-xs bg-[#316AC5] hover:bg-[#2A5BD7]">
                    <Gift className="w-3 h-3 mr-1" />
                    Send Gift
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="emoticons" className="flex-1 p-4 m-0 overflow-auto">
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-3">Emoticon Gallery</h3>
            <p className="text-sm text-gray-600 mb-3">Browse and use classic C.H.A.O.S. emoticons in your chats!</p>
          </div>

          <div className="border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA] mb-4">
            <h4 className="text-sm font-medium mb-2">Classic Emoticons</h4>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 bg-white p-2 rounded-md border border-[#D4D0C8]">
              {Array.from({ length: 30 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square flex items-center justify-center p-2 hover:bg-[#EBE8D8] rounded-md cursor-pointer"
                  title={`:emoticon${index + 1}:`}
                >
                  <Smile className="w-6 h-6 text-yellow-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA]">
            <h4 className="text-sm font-medium mb-2">Animated Emoticons</h4>
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 bg-white p-2 rounded-md border border-[#D4D0C8]">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square flex items-center justify-center p-2 hover:bg-[#EBE8D8] rounded-md cursor-pointer"
                  title={`:animated${index + 1}:`}
                >
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
