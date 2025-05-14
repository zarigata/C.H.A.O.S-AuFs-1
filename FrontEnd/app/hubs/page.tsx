"use client"

import { useState } from "react"
import { CommunicationHubs } from "@/components/communication-hubs"
import { HubSettings } from "@/components/hub-settings"
import { HubChannels } from "@/components/hub-channels"
import { HubMembers } from "@/components/hub-members"
import { HubBots } from "@/components/hub-bots"

export default function HubsPage() {
  const [activeHub, setActiveHub] = useState<string | null>(null)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"main" | "settings" | "channels" | "members" | "bots">("main")

  const handleChannelSelect = (channelId: string) => {
    if (!activeHub) {
      setActiveHub("hub1") // Default to first hub when selecting from hub selection screen
    }
    setActiveChannel(channelId)
    setActiveView("main")
  }

  const handleSettingsOpen = () => {
    setActiveView("settings")
  }

  const handleChannelsOpen = () => {
    setActiveView("channels")
  }

  const handleMembersOpen = () => {
    setActiveView("members")
  }

  const handleBotsOpen = () => {
    setActiveView("bots")
  }

  const handleBackToMain = () => {
    setActiveView("main")
  }

  return (
    <div className="h-full flex flex-col">
      {activeView === "main" ? (
        <CommunicationHubs
          activeHub={activeHub}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
          onSettingsOpen={handleSettingsOpen}
          onChannelsOpen={handleChannelsOpen}
          onMembersOpen={handleMembersOpen}
          onBotsOpen={handleBotsOpen}
        />
      ) : activeView === "settings" ? (
        <div className="h-full flex flex-col">
          <div className="p-2 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center">
            <button onClick={handleBackToMain} className="text-sm text-[#316AC5] hover:underline">
              ← Back to Hub
            </button>
            <h2 className="text-sm font-semibold ml-4">Hub Settings</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <HubSettings hubId={activeHub} />
          </div>
        </div>
      ) : activeView === "channels" ? (
        <div className="h-full flex flex-col">
          <div className="p-2 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center">
            <button onClick={handleBackToMain} className="text-sm text-[#316AC5] hover:underline">
              ← Back to Hub
            </button>
            <h2 className="text-sm font-semibold ml-4">Manage Channels</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <HubChannels hubId={activeHub} />
          </div>
        </div>
      ) : activeView === "members" ? (
        <div className="h-full flex flex-col">
          <div className="p-2 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center">
            <button onClick={handleBackToMain} className="text-sm text-[#316AC5] hover:underline">
              ← Back to Hub
            </button>
            <h2 className="text-sm font-semibold ml-4">Hub Members</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <HubMembers hubId={activeHub} />
          </div>
        </div>
      ) : activeView === "bots" ? (
        <div className="h-full flex flex-col">
          <div className="p-2 bg-[#ECE9D8] border-b border-[#D4D0C8] flex items-center">
            <button onClick={handleBackToMain} className="text-sm text-[#316AC5] hover:underline">
              ← Back to Hub
            </button>
            <h2 className="text-sm font-semibold ml-4">Hub Bots</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <HubBots hubId={activeHub} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
