"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Plus, Search, MoreHorizontal, Trash2, Settings, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface HubBotsProps {
  hubId: string | null
}

interface BotType {
  id: string
  name: string
  description: string
  avatar: string
  isInstalled: boolean
  isVerified: boolean
  category: string
  features: string[]
}

export function HubBots({ hubId }: HubBotsProps) {
  const [bots, setBots] = useState<BotType[]>([
    {
      id: "bot1",
      name: "MusicMaster",
      description: "Play music in voice channels with high-quality audio.",
      avatar: "/placeholder.svg?height=80&width=80&text=🎵",
      isInstalled: true,
      isVerified: true,
      category: "Music",
      features: ["Music playback", "Playlists", "Lyrics"]
    },
    {
      id: "bot2",
      name: "ModeratorBot",
      description: "Automated moderation to keep your hub safe and clean.",
      avatar: "/placeholder.svg?height=80&width=80&text=🛡️",
      isInstalled: true,
      isVerified: true,
      category: "Moderation",
      features: ["Auto-moderation", "Anti-spam", "Word filtering"]
    },
    {
      id: "bot3",
      name: "GameStats",
      description: "Track gaming statistics and achievements for your members.",
      avatar: "/placeholder.svg?height=80&width=80&text=🎮",
      isInstalled: false,
      isVerified: true,
      category: "Gaming",
      features: ["Game stats", "Leaderboards", "Achievement tracking"]
    },
    {
      id: "bot4",
      name: "PollMaker",
      description: "Create polls and surveys for your hub members.",
      avatar: "/placeholder.svg?height=80&width=80&text=📊",
      isInstalled: false,
      isVerified: false,
      category: "Utility",
      features: ["Polls", "Surveys", "Voting"]
    },
    {
      id: "bot5",
      name: "WelcomeBot",
      description: "Automatically welcome new members to your hub.",
      avatar: "/placeholder.svg?height=80&width=80&text=👋",
      isInstalled: false,
      isVerified: true,
      category: "Utility",
      features: ["Welcome messages", "Role assignment", "Member tracking"]
    },
    {
      id: "bot6",
      name: "EventPlanner",
      description: "Schedule and manage events for your hub.",
      avatar: "/placeholder.svg?height=80&width=80&text=📅",
      isInstalled: false,
      isVerified: false,
      category: "Utility",
      features: ["Event scheduling", "Reminders", "RSVP tracking"]
    }
  ])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"installed" | "discover">("installed")
  const [showBotSettingsDialog, setShowBotSettingsDialog] = useState(false)
  const [selectedBot, setSelectedBot] = useState<BotType | null>(null)
  const [botSettings, setBotSettings] = useState({
    enableWelcomeMessage: true,
    enableAutoModeration: true,
    commandPrefix: "!",
    allowedChannels: ["general", "bot-commands"]
  })
  
  const installedBots = bots.filter(bot => bot.isInstalled)
  
  const filteredBots = bots.filter(bot => {
    // Filter by search query
    if (searchQuery && !bot.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !bot.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Filter by tab
    if (activeTab === "installed" && !bot.isInstalled) {
      return false
    }
    
    return true
  })

  const handleInstallBot = (botId: string) => {
    setBots(bots.map(bot => 
      bot.id === botId ? { ...bot, isInstalled: true } : bot
    ))
  }

  const handleUninstallBot = (botId: string) => {
    setBots(bots.map(bot => 
      bot.id === botId ? { ...bot, isInstalled: false } : bot
    ))
  }

  const openBotSettings = (bot: BotType) => {
    setSelectedBot(bot)
    setShowBotSettingsDialog(true)
  }

  const saveBotSettings = () => {
    // In a real app, we would save the bot settings
    setShowBotSettingsDialog(false)
  }

  return (
    <div className="border border-[#D4D0C8] rounded-md overflow-hidden bg-white h-full">
      <Tabs defaultValue="installed" className="h-full flex flex-col">
        <div className="bg-[#ECE9D8] border-b border-[#D4D0C8] p-2">
          <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8]">
            <TabsTrigger 
              value="installed" 
              className="text-xs data-[state=active]:bg-[#F5F4EA]"
              onClick={() => setActiveTab("installed")}
            >
              Installed ({installedBots.length})
            </TabsTrigger>
            <TabsTrigger 
              value="discover" 
              className="text-xs data-[state=active]:bg-[#F5F4EA]"
              onClick={() => setActiveTab("discover")}
            >
              Discover Bots
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 border-b border-[#D4D0C8] flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bots"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-white border-[#D4D0C8]"
            />
          </div>
          {activeTab === "installed" && (
            <Button 
              onClick={() => setActiveTab("discover")}
              className="bg-[#316AC5] hover:bg-[#2A5BD7] ml-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bot
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="installed" className="m-0 h-full">
            {filteredBots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBots.map(bot => (
                  <Card key={bot.id} className="border-[#D4D0C8]">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <img
                            src={bot.avatar || "/placeholder.svg"}
                            alt={bot.name}
                            className="w-10 h-10 rounded-md mr-3"
                          />
                          <div>
                            <CardTitle className="text-base flex items-center">
                              {bot.name}
                              {bot.isVerified && (
                                <Badge className="ml-2 bg-[#316AC5]" title="Verified Bot">
                                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>{bot.category}</CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white border border-[#D4D0C8]">
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => openBotSettings(bot)}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Documentation
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500 cursor-pointer"
                              onClick={() => handleUninstallBot(bot.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Uninstall
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-600">{bot.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bot.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-[#F5F4EA]">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-[#D4D0C8]"
                        onClick={() => openBotSettings(bot)}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Bot className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bots Installed</h3>
                <p className="text-gray-500 mb-4">
                  Add bots to enhance your hub with moderation, music, games, and more.
                </p>
                <Button 
                  onClick={() => setActiveTab("discover")}
                  className="bg-[#316AC5] hover:bg-[#2A5BD7]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bot
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="discover" className="m-0 h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBots.map(bot => (
                <Card key={bot.id} className="border-[#D4D0C8]">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <img
                          src={bot.avatar || "/placeholder.svg"}
                          alt={bot.name}
                          className="w-10 h-10 rounded-md mr-3"
                        />
                        <div>
                          <CardTitle className="text-base flex items-center">
                            {bot.name}
                            {bot.isVerified && (
                              <Badge className="ml-2 bg-[#316AC5]" title="Verified Bot">
                                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{bot.category}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-600">{bot.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bot.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-[#F5F4EA]">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    {bot.isInstalled ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs border-[#D4D0C8]"
                        onClick={() => handleUninstallBot(bot.id)}
                      >
                        Uninstall
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="text-xs bg-[#316AC5] hover:bg-[#2A5BD7]"
                        onClick={() => handleInstallBot(bot.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Hub
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Bot Settings Dialog */}
      <Dialog open={showBotSettingsDialog} onOpenChange={setShowBotSettingsDialog}>
        <DialogContent className="bg-[#F5F4EA] border border-[#D4D0C8]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedBot && (
                <>
                  <img
                    src={selectedBot.avatar || "/placeholder.svg"}
                    alt={selectedBot.name}
                    className="w-6 h-6 rounded-md mr-2"
                  />
                  {selectedBot.name} Settings
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Configure
            </DialogDescription>\
