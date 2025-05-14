"use client"

import { ChevronLeft, ChevronRight, Home, Settings, Users, Bot, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ServerNavigationProps {
  serverId: string
  onBack: () => void
  onForward: () => void
  canGoBack: boolean
  canGoForward: boolean
}

export function ServerNavigation({ serverId, onBack, onForward, canGoBack, canGoForward }: ServerNavigationProps) {
  const serverName = getServerName(serverId)

  return (
    <div className="border border-[#D4D0C8] rounded-md bg-[#ECE9D8] p-2">
      <div className="flex items-center">
        <div className="flex items-center space-x-1 mr-3">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack} disabled={!canGoBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onForward} disabled={!canGoForward}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-6 h-6 bg-[#316AC5] rounded-md flex items-center justify-center text-white text-xs mr-2">
            {getServerIcon(serverId)}
          </div>
          <h2 className="text-sm font-semibold">{serverName}</h2>
        </div>

        <div className="flex items-center space-x-1">
          <Tabs defaultValue="channels" className="w-auto">
            <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8] h-7">
              <TabsTrigger value="channels" className="text-xs h-5 data-[state=active]:bg-[#F5F4EA]">
                <Hash className="h-3 w-3 mr-1" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="members" className="text-xs h-5 data-[state=active]:bg-[#F5F4EA]">
                <Users className="h-3 w-3 mr-1" />
                Members
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-[#D4D0C8]">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                <span>Hub Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Hash className="w-4 h-4 mr-2" />
                <span>Manage Channels</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Users className="w-4 h-4 mr-2" />
                <span>Members</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Bot className="w-4 h-4 mr-2" />
                <span>Bots</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function getServerName(serverId: string | null): string {
  if (!serverId) return "Unknown Server"

  const servers = {
    server1: "Gaming Alliance",
    server2: "Tech Enthusiasts",
    server3: "Movie Buffs",
    server4: "Music Lovers",
    server5: "Book Club",
    server6: "Fitness Friends",
  }

  return servers[serverId as keyof typeof servers] || "Unknown Server"
}

function getServerIcon(serverId: string | null): string {
  if (!serverId) return "?"

  const icons = {
    server1: "🎮",
    server2: "💻",
    server3: "🎬",
    server4: "🎵",
    server5: "📚",
    server6: "💪",
  }

  return icons[serverId as keyof typeof icons] || "?"
}
