"use client"

import { X, Minus, Maximize2, Minimize2 } from "lucide-react"
import { ChaosLogo } from "./chaos-logo"

interface WindowsXPHeaderProps {
  title: string
  onMinimize: () => void
  onMaximize: () => void
  isMaximized: boolean
}

export function WindowsXPHeader({ title, onMinimize, onMaximize, isMaximized }: WindowsXPHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-[#2A5BD7] to-[#1C3E9C] text-white h-8 px-2">
      <div className="flex items-center">
        <ChaosLogo className="w-4 h-4 mr-2" />
        <h1 className="text-sm font-semibold">{title}</h1>
      </div>
      <div className="flex space-x-1">
        <button
          onClick={onMinimize}
          className="flex items-center justify-center w-5 h-5 bg-[#2A5BD7] hover:bg-[#3A6BE7] rounded-sm"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          onClick={onMaximize}
          className="flex items-center justify-center w-5 h-5 bg-[#2A5BD7] hover:bg-[#3A6BE7] rounded-sm"
        >
          {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
        <button className="flex items-center justify-center w-5 h-5 bg-[#E81123] hover:bg-[#F1707A] rounded-sm">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
