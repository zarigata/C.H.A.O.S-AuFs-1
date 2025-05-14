"use client"

import { useState } from "react"
import { WindowsXPSidebar } from "./windows-xp-sidebar"
import { DirectMessages } from "./direct-messages"
import { GroupChat } from "./group-chat"
import { UserProfile } from "./user-profile"
import { StreamingContent } from "./streaming-content"
import { FunChannels } from "./fun-channels"
import { ThemePicker } from "./theme-picker"
import { WindowsXPHeader } from "./windows-xp-header"
import { ChaosLogo } from "./chaos-logo"
import { CommunicationHubs } from "./communication-hubs"
import { ServerList } from "./server-list"
import { ServerNavigation } from "./server-navigation"

type View =
  | "direct-messages"
  | "group-chat"
  | "profile"
  | "streaming"
  | "fun-channels"
  | "themes"
  | "hubs"
  | "server-list"

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<View>("direct-messages")
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [activeServer, setActiveServer] = useState<string | null>(null)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const handleViewChange = (view: View) => {
    setCurrentView(view)

    // Reset server selection when navigating away from hubs
    if (view !== "hubs" && view !== "server-list") {
      setActiveServer(null)
      setActiveChannel(null)
    }
  }

  const handleServerSelect = (serverId: string) => {
    setActiveServer(serverId)
    setCurrentView("hubs")

    // Add to navigation history
    const newHistory = [...navigationHistory.slice(0, historyIndex + 1), serverId]
    setNavigationHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId)
  }

  const handleNavigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setActiveServer(navigationHistory[newIndex])
    } else {
      // If at the beginning of history, go back to server list
      setCurrentView("server-list")
      setActiveServer(null)
    }
  }

  const handleNavigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setActiveServer(navigationHistory[newIndex])
    }
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleMaximize = () => {
    setIsMaximized(!isMaximized)
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-0 left-0 bg-gradient-to-r from-[#245EDC] to-[#1C3E9C] text-white p-2 rounded-t-md cursor-pointer z-50 flex items-center"
        onClick={() => setIsMinimized(false)}
      >
        <ChaosLogo className="w-5 h-5 mr-2" />
        <span>C.H.A.O.S. Messenger</span>
      </div>
    )
  }

  return (
    <div
      className={`flex h-screen bg-[#ECE9D8] overflow-hidden ${isMaximized ? "w-screen" : "w-[95vw] h-[95vh] mx-auto my-auto mt-6 rounded-md shadow-xl"}`}
    >
      <WindowsXPSidebar onViewChange={handleViewChange} currentView={currentView} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <WindowsXPHeader
          title={getViewTitle(currentView, activeServer)}
          onMinimize={handleMinimize}
          onMaximize={handleMaximize}
          isMaximized={isMaximized}
        />

        <main className="flex-1 overflow-auto p-4 bg-[#F5F4EA] border-l border-[#D4D0C8]">
          {currentView === "direct-messages" && <DirectMessages />}
          {currentView === "group-chat" && <GroupChat />}
          {currentView === "profile" && <UserProfile />}
          {currentView === "streaming" && <StreamingContent />}
          {currentView === "fun-channels" && <FunChannels />}
          {currentView === "themes" && <ThemePicker />}
          {currentView === "server-list" && <ServerList onServerSelect={handleServerSelect} />}
          {currentView === "hubs" && activeServer && (
            <div className="flex flex-col h-full">
              <ServerNavigation
                serverId={activeServer}
                onBack={handleNavigateBack}
                onForward={handleNavigateForward}
                canGoBack={historyIndex > 0 || activeServer !== null}
                canGoForward={historyIndex < navigationHistory.length - 1}
              />
              <div className="flex-1 mt-2">
                <CommunicationHubs
                  activeServer={activeServer}
                  activeChannel={activeChannel}
                  onChannelSelect={handleChannelSelect}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function getViewTitle(view: View, activeServer: string | null): string {
  switch (view) {
    case "direct-messages":
      return "Direct Messages"
    case "group-chat":
      return "Group Chat"
    case "profile":
      return "My Profile"
    case "streaming":
      return "Streaming Content"
    case "fun-channels":
      return "Fun Channels"
    case "themes":
      return "Theme Settings"
    case "server-list":
      return "Communication Hubs"
    case "hubs":
      return activeServer ? `Hub: ${getServerName(activeServer)}` : "Communication Hubs"
    default:
      return "C.H.A.O.S. Messenger"
  }
}

function getServerName(serverId: string | null): string {
  if (!serverId) return "Unknown Server"

  const servers = {
    server1: "Gaming Alliance",
    server2: "Tech Enthusiasts",
    server3: "Movie Buffs",
    server4: "Music Lovers",
  }

  return servers[serverId as keyof typeof servers] || "Unknown Server"
}
