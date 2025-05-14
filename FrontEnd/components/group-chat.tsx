"use client"

import { useState } from "react"
import { Send, Paperclip, Smile, Users, PlusCircle, Video, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  avatar: string
}

interface GroupMember {
  id: number
  name: string
  status: "online" | "away" | "busy" | "offline"
  avatar: string
}

interface ChatGroup {
  id: number
  name: string
  members: GroupMember[]
  messages: Message[]
}

export function GroupChat() {
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null)
  const [messageInput, setMessageInput] = useState("")

  const groups: ChatGroup[] = [
    {
      id: 1,
      name: "Gaming Squad",
      members: [
        { id: 1, name: "CoolUser2000", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 2, name: "GamerGirl2000", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 3, name: "ProGamer99", status: "away", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 4, name: "NoobMaster69", status: "offline", avatar: "/placeholder.svg?height=32&width=32" },
      ],
      messages: [
        {
          id: 1,
          sender: "GamerGirl2000",
          content: "Anyone up for some gaming tonight?",
          timestamp: "2:30 PM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: 2,
          sender: "ProGamer99",
          content: "I'm in! What are we playing?",
          timestamp: "2:32 PM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: 3,
          sender: "CoolUser2000",
          content: "How about that new MMO everyone's talking about?",
          timestamp: "2:35 PM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
    {
      id: 2,
      name: "Project Team",
      members: [
        { id: 1, name: "CoolUser2000", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 5, name: "ProjectManager", status: "busy", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 6, name: "DesignerDude", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 7, name: "CodeWizard", status: "away", avatar: "/placeholder.svg?height=32&width=32" },
      ],
      messages: [
        {
          id: 1,
          sender: "ProjectManager",
          content: "Team meeting tomorrow at 10 AM",
          timestamp: "11:00 AM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: 2,
          sender: "DesignerDude",
          content: "I'll have the mockups ready by then",
          timestamp: "11:05 AM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: 3,
          sender: "CodeWizard",
          content: "Backend is almost done, just fixing some bugs",
          timestamp: "11:10 AM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
    {
      id: 3,
      name: "C.H.A.O.S. Team",
      members: [
        { id: 1, name: "CoolUser2000", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 8, name: "SystemAdmin", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 9, name: "UXDesigner", status: "busy", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 10, name: "BackendDev", status: "away", avatar: "/placeholder.svg?height=32&width=32" },
        { id: 11, name: "FrontendDev", status: "online", avatar: "/placeholder.svg?height=32&width=32" },
      ],
      messages: [
        {
          id: 1,
          sender: "SystemAdmin",
          content: "Welcome to the C.H.A.O.S. team channel!",
          timestamp: "9:00 AM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: 2,
          sender: "UXDesigner",
          content: "I've uploaded the new design mockups for the emoticon system",
          timestamp: "9:15 AM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: 3,
          sender: "BackendDev",
          content: "Server update scheduled for tonight at 2 AM",
          timestamp: "9:30 AM",
          avatar: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
  ]

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

  const handleSendMessage = () => {
    if (messageInput.trim() === "" || !selectedGroup) return
    // In a real app, we would add the message to the messages array
    setMessageInput("")
  }

  return (
    <div className="flex h-full border border-[#D4D0C8] rounded-md overflow-hidden bg-white">
      <div className="w-64 border-r border-[#D4D0C8] bg-[#F5F4EA]">
        <div className="p-3 bg-[#ECE9D8] border-b border-[#D4D0C8] flex justify-between items-center">
          <h3 className="text-sm font-semibold">Groups</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-40px)]">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`p-2 cursor-pointer hover:bg-[#EBE8D8] ${
                selectedGroup?.id === group.id ? "bg-[#EBE8D8]" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-[#316AC5] to-[#1C3E9C] text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium">{group.name}</div>
                  <div className="text-xs text-gray-500">{group.members.length} members</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <Tabs defaultValue="chat" className="flex flex-col h-full">
            <div className="p-2 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-[#316AC5] to-[#1C3E9C] text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <Users className="w-3 h-3" />
                </div>
                <div className="ml-2 text-sm font-medium">{selectedGroup.name}</div>
              </div>
              <div className="flex items-center">
                <Button variant="outline" size="icon" className="h-6 w-6 mr-1 bg-[#F5F4EA] border-[#D4D0C8]">
                  <Phone className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-6 w-6 mr-2 bg-[#F5F4EA] border-[#D4D0C8]">
                  <Video className="h-3 w-3" />
                </Button>
                <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8]">
                  <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-[#F5F4EA]">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="members" className="text-xs data-[state=active]:bg-[#F5F4EA]">
                    Members
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
              <div className="flex-1 overflow-y-auto p-3 bg-[#FFFFFF]">
                {selectedGroup.messages.map((message) => (
                  <div key={message.id} className="mb-3">
                    <div className="flex">
                      <img
                        src={message.avatar || "/placeholder.svg"}
                        alt={message.sender}
                        className="w-8 h-8 rounded-full border border-[#D4D0C8] mr-2"
                      />
                      <div className="bg-[#F5F5F5] p-2 rounded-md max-w-[80%]">
                        <div className="text-xs font-semibold mb-1">{message.sender}</div>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
                      </div>
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
                    placeholder="Type a message..."
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
            </TabsContent>

            <TabsContent value="members" className="flex-1 p-0 m-0 overflow-y-auto">
              <div className="p-3">
                <h4 className="text-sm font-semibold mb-2">Members ({selectedGroup.members.length})</h4>
                <div className="space-y-2">
                  {selectedGroup.members.map((member) => (
                    <div key={member.id} className="flex items-center p-2 hover:bg-[#EBE8D8] rounded-md">
                      <div className="relative">
                        <img
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.name}
                          className="w-8 h-8 rounded-full border border-[#D4D0C8]"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2 h-2 ${getStatusColor(member.status)} rounded-full border border-white`}
                        ></span>
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{member.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="bg-gradient-to-r from-[#316AC5] to-[#1C3E9C] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <p>Select a group to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
