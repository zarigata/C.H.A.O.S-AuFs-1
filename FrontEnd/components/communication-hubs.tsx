"use client"

import { useState } from "react"
import { Send, Paperclip, Smile, Hash, PlusCircle, Search, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CommunicationHubsProps {
  activeServer: string | null
  activeChannel: string | null
  onChannelSelect: (channelId: string) => void
}

interface Channel {
  id: string
  name: string
  type: "text" | "voice"
  category: string
}

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  avatar: string
}

interface Member {
  id: string
  name: string
  status: "online" | "away" | "busy" | "offline"
  role: string
  avatar: string
}

export function CommunicationHubs({ activeServer, activeChannel, onChannelSelect }: CommunicationHubsProps) {
  const [messageInput, setMessageInput] = useState("")
  const [activeTab, setActiveTab] = useState<"channels" | "online" | "all">("channels")

  // Sample data
  const channels: Channel[] = [
    { id: "channel1", name: "general", type: "text", category: "Text Channels" },
    { id: "channel2", name: "announcements", type: "text", category: "Text Channels" },
    { id: "channel3", name: "off-topic", type: "text", category: "Text Channels" },
    { id: "channel4", name: "gaming", type: "text", category: "Gaming" },
    { id: "channel5", name: "voice-chat", type: "voice", category: "Voice Channels" },
    { id: "channel6", name: "music", type: "voice", category: "Voice Channels" },
  ]

  const messages: Message[] = [
    {
      id: "msg1",
      content: "Hey everyone! Welcome to the new hub!",
      sender: "Admin",
      timestamp: "10:30 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "msg2",
      content: "This is awesome! I love the Windows XP theme.",
      sender: "GamerGirl2000",
      timestamp: "10:32 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "msg3",
      content: "Reminds me of the good old days of MSN Messenger!",
      sender: "TechWizard",
      timestamp: "10:35 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "msg4",
      content: "Can we add more channels for different topics?",
      sender: "CoolDude99",
      timestamp: "10:40 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "msg5",
      content: "What topics are you interested in?",
      sender: "Admin",
      timestamp: "10:42 AM",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const members = [
    { id: "user1", name: "Admin", status: "online", role: "Owner", avatar: "/placeholder.svg?height=40&width=40" },
    {
      id: "user2",
      name: "GamerGirl2000",
      status: "online",
      role: "Moderator",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    { id: "user3", name: "TechWizard", status: "away", role: "Member", avatar: "/placeholder.svg?height=40&width=40" },
    {
      id: "user4",
      name: "CoolDude99",
      status: "online",
      role: "Member",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user5",
      name: "Jessica82",
      status: "offline",
      role: "Member",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    { id: "user6", name: "ProGamer99", status: "busy", role: "Member", avatar: "/placeholder.svg?height=40&width=40" },
  ]

  const onlineMembers = members.filter(
    (member) => member.status === "online" || member.status === "away" || member.status === "busy",
  )

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return
    // In a real app, we would add the message to the messages array
    setMessageInput("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // If no server is selected, this shouldn't happen with the new navigation
  if (!activeServer) {
    return <div>No server selected</div>
  }

  return (
    <div className="h-full flex border border-[#D4D0C8] rounded-md overflow-hidden bg-white">
      {/* Left sidebar with channels */}
      <div className="w-56 border-r border-[#D4D0C8] bg-[#F5F4EA] flex flex-col">
        <div className="p-2">
          <div className="relative mb-2">
            <Input placeholder="Search channels" className="h-7 text-xs bg-white border-[#D4D0C8] pl-7" />
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Group channels by category */}
          {["Text Channels", "Gaming", "Voice Channels"].map((category) => {
            const categoryChannels = channels.filter((channel) => channel.category === category)
            if (categoryChannels.length === 0) return null

            return (
              <div key={category} className="mb-2">
                <div className="flex items-center justify-between px-3 py-1">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">{category}</h4>
                  <button className="w-4 h-4 rounded-full flex items-center justify-center text-xs text-gray-500 hover:bg-[#EBE8D8]">
                    <PlusCircle className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-0.5">
                  {categoryChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => onChannelSelect(channel.id)}
                      className={`w-full flex items-center px-3 py-1 text-sm rounded-md ${
                        activeChannel === channel.id ? "bg-[#D9E7F5]" : "hover:bg-[#EBE8D8]"
                      }`}
                    >
                      {channel.type === "text" ? (
                        <Hash className="w-4 h-4 mr-2 text-gray-500" />
                      ) : (
                        <Volume2 className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      <span>{channel.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <div className="p-2 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center justify-between">
          <div className="flex items-center">
            <Hash className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">general</span>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Messages area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-3 bg-white">
              {messages.map((message) => (
                <div key={message.id} className="mb-3 flex">
                  <img
                    src={message.avatar || "/placeholder.svg"}
                    alt={message.sender}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-sm mr-2">{message.sender}</span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <div className="text-sm">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#ECE9D8] border-t border-[#D4D0C8]">
              <div className="flex items-center">
                <Button variant="outline" size="icon" className="h-8 w-8 mr-2 bg-[#F5F4EA] border-[#D4D0C8]">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8 mr-2 bg-[#F5F4EA] border-[#D4D0C8]">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Message #general"
                  className="flex-1 h-8 bg-white border-[#D4D0C8]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage} className="ml-2 h-8 bg-[#316AC5] hover:bg-[#2A5BD7] text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Members sidebar */}
          <div className="w-48 border-l border-[#D4D0C8] bg-[#F5F4EA] flex flex-col">
            <div className="p-2 bg-[#ECE9D8] border-b border-[#D4D0C8]">
              <TabsList className="w-full bg-[#ECE9D8] border border-[#D4D0C8] grid grid-cols-3">
                <TabsTrigger
                  value="channels"
                  className="text-xs data-[state=active]:bg-[#F5F4EA]"
                  onClick={() => setActiveTab("channels")}
                >
                  Channels
                </TabsTrigger>
                <TabsTrigger
                  value="online"
                  className="text-xs data-[state=active]:bg-[#F5F4EA]"
                  onClick={() => setActiveTab("online")}
                >
                  Online
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="text-xs data-[state=active]:bg-[#F5F4EA]"
                  onClick={() => setActiveTab("all")}
                >
                  All
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {activeTab === "channels" && (
                <div className="space-y-1">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => onChannelSelect(channel.id)}
                      className="w-full flex items-center px-2 py-1 text-xs rounded-md hover:bg-[#EBE8D8]"
                    >
                      {channel.type === "text" ? (
                        <Hash className="w-3 h-3 mr-1 text-gray-500" />
                      ) : (
                        <Volume2 className="w-3 h-3 mr-1 text-gray-500" />
                      )}
                      <span>{channel.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "online" && (
                <div>
                  {["Owner", "Moderator", "Member"].map((role) => {
                    const roleMembers = onlineMembers.filter((member) => member.role === role)
                    if (roleMembers.length === 0) return null

                    return (
                      <div key={role} className="mb-2">
                        <h4 className="text-xs font-bold text-gray-500 px-2 py-1">
                          {role}s — {roleMembers.length}
                        </h4>
                        <div className="space-y-1">
                          {roleMembers.map((member) => (
                            <div key={member.id} className="flex items-center px-2 py-1 rounded-md hover:bg-[#EBE8D8]">
                              <div className="relative">
                                <img
                                  src={member.avatar || "/placeholder.svg"}
                                  alt={member.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span
                                  className={`absolute bottom-0 right-0 w-2 h-2 ${getStatusColor(member.status)} rounded-full border border-white`}
                                ></span>
                              </div>
                              <span className="ml-2 text-xs">{member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === "all" && (
                <div>
                  {["Owner", "Moderator", "Member"].map((role) => {
                    const roleMembers = members.filter((member) => member.role === role)
                    if (roleMembers.length === 0) return null

                    return (
                      <div key={role} className="mb-2">
                        <h4 className="text-xs font-bold text-gray-500 px-2 py-1">
                          {role}s — {roleMembers.length}
                        </h4>
                        <div className="space-y-1">
                          {roleMembers.map((member) => (
                            <div key={member.id} className="flex items-center px-2 py-1 rounded-md hover:bg-[#EBE8D8]">
                              <div className="relative">
                                <img
                                  src={member.avatar || "/placeholder.svg"}
                                  alt={member.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span
                                  className={`absolute bottom-0 right-0 w-2 h-2 ${getStatusColor(member.status)} rounded-full border border-white`}
                                ></span>
                              </div>
                              <span className="ml-2 text-xs">{member.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
