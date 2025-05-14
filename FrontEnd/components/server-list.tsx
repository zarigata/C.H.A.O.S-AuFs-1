"use client"

import { useState } from "react"
import { Search, Plus, Network, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ServerListProps {
  onServerSelect: (serverId: string) => void
}

interface Server {
  id: string
  name: string
  description: string
  memberCount: number
  status: "online" | "maintenance" | "busy"
  icon: string
  categories: string[]
}

export function ServerList({ onServerSelect }: ServerListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateServerDialog, setShowCreateServerDialog] = useState(false)
  const [newServerName, setNewServerName] = useState("")
  const [newServerDescription, setNewServerDescription] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Sample data
  const servers: Server[] = [
    {
      id: "server1",
      name: "Gaming Alliance",
      description: "A hub for gamers to connect and play together",
      memberCount: 128,
      status: "online",
      icon: "🎮",
      categories: ["Gaming", "Featured"],
    },
    {
      id: "server2",
      name: "Tech Enthusiasts",
      description: "Discuss the latest in technology and programming",
      memberCount: 95,
      status: "online",
      icon: "💻",
      categories: ["Technology", "Featured"],
    },
    {
      id: "server3",
      name: "Movie Buffs",
      description: "For fans of cinema and film discussion",
      memberCount: 76,
      status: "maintenance",
      icon: "🎬",
      categories: ["Entertainment"],
    },
    {
      id: "server4",
      name: "Music Lovers",
      description: "Share and discover new music",
      memberCount: 112,
      status: "busy",
      icon: "🎵",
      categories: ["Entertainment", "Featured"],
    },
    {
      id: "server5",
      name: "Book Club",
      description: "Monthly book discussions and recommendations",
      memberCount: 54,
      status: "online",
      icon: "📚",
      categories: ["Education"],
    },
    {
      id: "server6",
      name: "Fitness Friends",
      description: "Workout tips and motivation",
      memberCount: 87,
      status: "online",
      icon: "💪",
      categories: ["Health"],
    },
  ]

  const categories = ["Featured", "Gaming", "Technology", "Entertainment", "Education", "Health"]

  const filteredServers = servers.filter((server) => {
    // Filter by search query
    if (
      searchQuery &&
      !server.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !server.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Filter by category
    if (activeCategory && !server.categories.includes(activeCategory)) {
      return false
    }

    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "maintenance":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "maintenance":
        return "Maintenance"
      case "busy":
        return "High Traffic"
      default:
        return "Unknown"
    }
  }

  const handleCreateServer = () => {
    // In a real app, we would create a new server
    setShowCreateServerDialog(false)
    setNewServerName("")
    setNewServerDescription("")
  }

  return (
    <div className="h-full flex border border-[#D4D0C8] rounded-md overflow-hidden bg-white">
      {/* Left sidebar with categories */}
      <div className="w-56 border-r border-[#D4D0C8] bg-[#F5F4EA] flex flex-col">
        <div className="p-3 bg-[#ECE9D8] border-b border-[#D4D0C8] flex justify-between items-center">
          <h3 className="text-sm font-semibold">Categories</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-2">
          <div className="relative mb-2">
            <Input
              placeholder="Search hubs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7 text-xs bg-white border-[#D4D0C8] pl-7"
            />
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0.5 p-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                activeCategory === null ? "bg-[#D9E7F5]" : "hover:bg-[#EBE8D8]"
              }`}
            >
              <Network className="w-4 h-4 mr-2 text-gray-500" />
              <span>All Hubs</span>
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                  activeCategory === category ? "bg-[#D9E7F5]" : "hover:bg-[#EBE8D8]"
                }`}
              >
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-[#D4D0C8]">
          <Button
            onClick={() => setShowCreateServerDialog(true)}
            className="w-full bg-[#316AC5] hover:bg-[#2A5BD7] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Hub
          </Button>
        </div>
      </div>

      {/* Main content area with server list */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 bg-[#ECE9D8] border-b border-[#D4D0C8]">
          <h2 className="text-md font-semibold">
            {activeCategory ? `${activeCategory} Hubs` : "All Communication Hubs"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {filteredServers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredServers.map((server) => (
                <div
                  key={server.id}
                  onClick={() => onServerSelect(server.id)}
                  className="border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA] hover:bg-[#EBE8D8] cursor-pointer"
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-[#316AC5] rounded-md flex items-center justify-center text-white text-xl mr-3">
                      {server.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{server.name}</h3>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 ${getStatusColor(server.status)} rounded-full mr-1`}></span>
                          <span className="text-xs text-gray-500">{getStatusText(server.status)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{server.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Users className="w-3 h-3 mr-1" />
                        <span>{server.memberCount} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <Network className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Hubs Found</h3>
              <p className="text-center mb-4">
                {searchQuery
                  ? `No hubs matching "${searchQuery}"`
                  : activeCategory
                    ? `No hubs in the ${activeCategory} category`
                    : "No communication hubs available"}
              </p>
              <Button onClick={() => setShowCreateServerDialog(true)} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                <Plus className="w-4 h-4 mr-2" />
                Create a Hub
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create Server Dialog */}
      <Dialog open={showCreateServerDialog} onOpenChange={setShowCreateServerDialog}>
        <DialogContent className="bg-[#F5F4EA] border border-[#D4D0C8]">
          <DialogHeader>
            <DialogTitle>Create a New Hub</DialogTitle>
            <DialogDescription>Create your own communication hub for your community.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="server-name" className="text-sm font-medium">
                Hub Name
              </label>
              <Input
                id="server-name"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
                placeholder="My Awesome Hub"
                className="bg-white border-[#D4D0C8]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="server-description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="server-description"
                value={newServerDescription}
                onChange={(e) => setNewServerDescription(e.target.value)}
                placeholder="What's your hub about?"
                className="bg-white border-[#D4D0C8]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateServerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateServer} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
              Create Hub
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
