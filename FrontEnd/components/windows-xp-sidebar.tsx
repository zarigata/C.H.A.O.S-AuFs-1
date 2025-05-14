"use client"

import { MessageSquare, Users, User, Play, Smile, Palette, ChevronRight, Network } from "lucide-react"
import { ChaosLogo } from "./chaos-logo"

type View = "direct-messages" | "group-chat" | "profile" | "streaming" | "fun-channels" | "themes" | "server-list"

interface WindowsXPSidebarProps {
  onViewChange: (view: View) => void
  currentView: View
}

export function WindowsXPSidebar({ onViewChange, currentView }: WindowsXPSidebarProps) {
  const menuItems = [
    { id: "direct-messages", label: "Direct Messages", icon: MessageSquare },
    { id: "group-chat", label: "Group Chat", icon: Users },
    { id: "profile", label: "My Profile", icon: User },
    { id: "streaming", label: "Streaming Content", icon: Play },
    { id: "fun-channels", label: "Fun Channels", icon: Smile },
    { id: "themes", label: "Theme Settings", icon: Palette },
    { id: "server-list", label: "Communication Hubs", icon: Network },
  ]

  return (
    <div className="w-56 bg-[#D6D2C2] border-r border-[#A0A0A0] flex flex-col">
      <div className="p-3 bg-gradient-to-r from-[#2A5BD7] to-[#1C3E9C] text-white">
        <div className="flex items-center">
          <ChaosLogo className="w-5 h-5 mr-2" />
          <h2 className="text-sm font-bold">C.H.A.O.S.</h2>
        </div>
        <div className="text-xs mt-1 opacity-80">Communication Hub for Animated Online Socializing</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img
                src="/placeholder.svg?height=40&width=40"
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-[#3A6BE7]"
              />
              <div className="ml-2">
                <div className="text-sm font-semibold">CoolUser2000</div>
                <div className="text-xs flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as View)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                  currentView === item.id ? "bg-[#316AC5] text-white" : "hover:bg-[#EBE8D8] text-[#333333]"
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                <span>{item.label}</span>
                {currentView === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-[#D6D2C2] border-t border-[#A0A0A0]">
        <div className="text-xs text-[#333333]">
          <div className="flex justify-between">
            <span>C.H.A.O.S. Messenger</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
