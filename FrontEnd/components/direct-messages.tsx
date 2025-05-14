"use client"

import type React from "react"

import { useState } from "react"
import { Send, Paperclip, Smile, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChaosLogo } from "@/components/chaos-logo"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isCurrentUser: boolean
}

interface Contact {
  id: number
  name: string
  status: "online" | "away" | "busy" | "offline"
  lastMessage: string
  avatar: string
}

export function DirectMessages() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const contacts: Contact[] = [
    {
      id: 1,
      name: "Jessica82",
      status: "online",
      lastMessage: "Hey, how are you?",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "CoolDude99",
      status: "away",
      lastMessage: "Check out this cool website",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "GamerGirl2000",
      status: "busy",
      lastMessage: "I'm playing that new game",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "TechWizard",
      status: "offline",
      lastMessage: "Did you fix that bug?",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const messages: Message[] = [
    {
      id: 1,
      sender: "Jessica82",
      content: "Hey, how are you?",
      timestamp: "10:30 AM",
      isCurrentUser: false,
    },
    {
      id: 2,
      sender: "You",
      content: "I'm good! Just working on this new project.",
      timestamp: "10:32 AM",
      isCurrentUser: true,
    },
    {
      id: 3,
      sender: "Jessica82",
      content: "That sounds cool! What are you building?",
      timestamp: "10:33 AM",
      isCurrentUser: false,
    },
    {
      id: 4,
      sender: "You",
      content: "A messaging app inspired by MSN Messenger and Discord!",
      timestamp: "10:35 AM",
      isCurrentUser: true,
    },
    {
      id: 5,
      sender: "Jessica82",
      content: "Wow, that's so nostalgic! I miss the old MSN days.",
      timestamp: "10:36 AM",
      isCurrentUser: false,
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
    if (messageInput.trim() === "") return
    // In a real app, we would add the message to the messages array
    setMessageInput("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value)

    // Show typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      // In a real app, we would send a typing indicator to the server
      setTimeout(() => setIsTyping(false), 3000)
    }
  }

  const sendNudge = () => {
    // In a real app, we would send a nudge to the contact
    const chatWindow = document.getElementById("chat-window")
    if (chatWindow) {
      chatWindow.classList.add("nudge-animation")
      setTimeout(() => {
        chatWindow.classList.remove("nudge-animation")
      }, 1000)
    }
  }

  return (
    <div className="flex h-full border border-[#D4D0C8] rounded-md overflow-hidden bg-white">
      <div className="w-64 border-r border-[#D4D0C8] bg-[#F5F4EA]">
        <div className="p-3 bg-[#ECE9D8] border-b border-[#D4D0C8]">
          <h3 className="text-sm font-semibold">Contacts</h3>
        </div>
        <div className="overflow-y-auto h-[calc(100%-40px)]">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-2 cursor-pointer hover:bg-[#EBE8D8] ${
                selectedContact?.id === contact.id ? "bg-[#EBE8D8]" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={contact.avatar || "/placeholder.svg"}
                    alt={contact.name}
                    className="w-8 h-8 rounded-full border border-[#D4D0C8]"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 ${getStatusColor(contact.status)} rounded-full border border-white`}
                  ></span>
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium">{contact.name}</div>
                  <div className="text-xs text-gray-500 truncate w-40">{contact.lastMessage}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-2 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={selectedContact.avatar || "/placeholder.svg"}
                    alt={selectedContact.name}
                    className="w-6 h-6 rounded-full border border-[#D4D0C8]"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-1.5 h-1.5 ${getStatusColor(selectedContact.status)} rounded-full border border-white`}
                  ></span>
                </div>
                <div className="ml-2 text-sm font-medium">{selectedContact.name}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs bg-[#F5F4EA] border-[#D4D0C8]"
                onClick={sendNudge}
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Nudge
              </Button>
            </div>

            <div id="chat-window" className="flex-1 overflow-y-auto p-3 bg-[#FFFFFF]">
              {messages.map((message) => (
                <div key={message.id} className={`mb-3 ${message.isCurrentUser ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block max-w-[80%] p-2 rounded-md ${
                      message.isCurrentUser ? "bg-[#D9E7F5] text-[#333333]" : "bg-[#F5F5F5] text-[#333333]"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">{message.isCurrentUser ? "You" : message.sender}</div>
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
                  </div>
                </div>
              ))}

              {isTyping && <div className="text-xs text-gray-500 italic ml-2">{selectedContact.name} is typing...</div>}
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
                  onChange={handleInputChange}
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
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4">
                <ChaosLogo className="w-16 h-16" />
              </div>
              <p>Select a contact to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
