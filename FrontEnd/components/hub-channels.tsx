"use client"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hash, Volume2, Plus, Pencil, Trash2, GripVertical, Lock, Settings } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface HubChannelsProps {
  hubId: string | null
}

interface Channel {
  id: string
  name: string
  type: "text" | "voice"
  category: string
  isPrivate: boolean
  position: number
}

export function HubChannels({ hubId }: HubChannelsProps) {
  const [channels, setChannels] = useState<Channel[]>([
    { id: "channel1", name: "general", type: "text", category: "Text Channels", isPrivate: false, position: 0 },
    { id: "channel2", name: "announcements", type: "text", category: "Text Channels", isPrivate: true, position: 1 },
    { id: "channel3", name: "off-topic", type: "text", category: "Text Channels", isPrivate: false, position: 2 },
    { id: "channel4", name: "gaming", type: "text", category: "Gaming", isPrivate: false, position: 0 },
    { id: "channel5", name: "voice-chat", type: "voice", category: "Voice Channels", isPrivate: false, position: 0 },
    { id: "channel6", name: "music", type: "voice", category: "Voice Channels", isPrivate: false, position: 1 },
  ])

  const [categories, setCategories] = useState<string[]>(["Text Channels", "Gaming", "Voice Channels"])

  const [showAddChannelDialog, setShowAddChannelDialog] = useState(false)
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false)
  const [showEditChannelDialog, setShowEditChannelDialog] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState<"text" | "voice">("text")
  const [newChannelCategory, setNewChannelCategory] = useState("Text Channels")
  const [newChannelPrivate, setNewChannelPrivate] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)

  const handleAddChannel = () => {
    if (newChannelName.trim() === "") return

    const newChannel: Channel = {
      id: `channel${channels.length + 1}`,
      name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
      type: newChannelType,
      category: newChannelCategory,
      isPrivate: newChannelPrivate,
      position: channels.filter((c) => c.category === newChannelCategory).length,
    }

    setChannels([...channels, newChannel])
    setShowAddChannelDialog(false)
    setNewChannelName("")
    setNewChannelType("text")
    setNewChannelCategory("Text Channels")
    setNewChannelPrivate(false)
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") return

    setCategories([...categories, newCategoryName])
    setShowAddCategoryDialog(false)
    setNewCategoryName("")
  }

  const handleEditChannel = () => {
    if (!editingChannel || newChannelName.trim() === "") return

    const updatedChannels = channels.map((channel) =>
      channel.id === editingChannel.id
        ? {
            ...channel,
            name: newChannelName.toLowerCase().replace(/\s+/g, "-"),
            type: newChannelType,
            category: newChannelCategory,
            isPrivate: newChannelPrivate,
          }
        : channel,
    )

    setChannels(updatedChannels)
    setShowEditChannelDialog(false)
    setEditingChannel(null)
  }

  const handleDeleteChannel = (channelId: string) => {
    setChannels(channels.filter((channel) => channel.id !== channelId))
  }

  const openEditChannelDialog = (channel: Channel) => {
    setEditingChannel(channel)
    setNewChannelName(channel.name)
    setNewChannelType(channel.type)
    setNewChannelCategory(channel.category)
    setNewChannelPrivate(channel.isPrivate)
    setShowEditChannelDialog(true)
  }

  return (
    <div className="border border-[#D4D0C8] rounded-md overflow-hidden bg-white h-full">
      <Tabs defaultValue="channels" className="h-full flex flex-col">
        <div className="bg-[#ECE9D8] border-b border-[#D4D0C8] p-2">
          <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8]">
            <TabsTrigger value="channels" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              Channels
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              Categories
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              Permissions
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="channels" className="p-4 m-0">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Hub Channels</h2>
                <Button onClick={() => setShowAddChannelDialog(true)} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Channel
                </Button>
              </div>

              <div className="space-y-4">
                {categories.map((category) => {
                  const categoryChannels = channels.filter((channel) => channel.category === category)
                  if (categoryChannels.length === 0) return null

                  return (
                    <div key={category} className="border border-[#D4D0C8] rounded-md overflow-hidden">
                      <div className="bg-[#ECE9D8] p-2 font-semibold text-sm flex justify-between items-center">
                        <span>{category}</span>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="divide-y divide-[#F0F0F0]">
                        {categoryChannels.map((channel) => (
                          <div key={channel.id} className="p-2 hover:bg-[#F5F4EA] flex items-center">
                            <div className="mr-2 cursor-move text-gray-400">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <div className="mr-2">
                              {channel.type === "text" ? (
                                <Hash className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Volume2 className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="text-sm">{channel.name}</span>
                                {channel.isPrivate && <Lock className="h-3 w-3 ml-1 text-gray-500" />}
                              </div>
                              <span className="text-xs text-gray-500">
                                {channel.type === "text" ? "Text Channel" : "Voice Channel"}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openEditChannelDialog(channel)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={() => handleDeleteChannel(channel.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="p-4 m-0">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Channel Categories</h2>
                <Button onClick={() => setShowAddCategoryDialog(true)} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="border border-[#D4D0C8] rounded-md overflow-hidden">
                <div className="bg-[#ECE9D8] p-2 font-semibold text-sm">
                  <span>Categories</span>
                </div>
                <div className="divide-y divide-[#F0F0F0]">
                  {categories.map((category, index) => (
                    <div key={index} className="p-2 hover:bg-[#F5F4EA] flex items-center">
                      <div className="mr-2 cursor-move text-gray-400">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm">{category}</span>
                        <div className="text-xs text-gray-500">
                          {channels.filter((c) => c.category === category).length} channels
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="p-4 m-0">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold mb-4">Channel Permissions</h2>

              <div className="space-y-4">
                <div className="border border-[#D4D0C8] rounded-md overflow-hidden">
                  <div className="bg-[#ECE9D8] p-2 font-semibold text-sm">
                    <span>Default Permissions</span>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">View Channels</p>
                        <p className="text-xs text-gray-500">Allow members to view channels by default</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Send Messages</p>
                        <p className="text-xs text-gray-500">Allow members to send messages by default</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Attach Files</p>
                        <p className="text-xs text-gray-500">Allow members to attach files by default</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Connect to Voice</p>
                        <p className="text-xs text-gray-500">Allow members to connect to voice channels by default</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="border border-[#D4D0C8] rounded-md overflow-hidden">
                  <div className="bg-[#ECE9D8] p-2 font-semibold text-sm">
                    <span>Role-Specific Permissions</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-600 mb-2">Select a role to configure its channel permissions:</p>
                    <Select defaultValue="moderator">
                      <SelectTrigger className="bg-white border-[#D4D0C8]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Manage Channels</p>
                          <p className="text-xs text-gray-500">Create, edit, and delete channels</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Manage Messages</p>
                          <p className="text-xs text-gray-500">Delete and pin messages from others</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Mention Everyone</p>
                          <p className="text-xs text-gray-500">Allow mentioning all members</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Add Channel Dialog */}
      <Dialog open={showAddChannelDialog} onOpenChange={setShowAddChannelDialog}>
        <DialogContent className="bg-[#F5F4EA] border border-[#D4D0C8]">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>Add a new channel to your hub.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="channel-type">Channel Type</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={newChannelType === "text" ? "default" : "outline"}
                  className={newChannelType === "text" ? "bg-[#316AC5] hover:bg-[#2A5BD7]" : "border-[#D4D0C8]"}
                  onClick={() => setNewChannelType("text")}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Text Channel
                </Button>
                <Button
                  type="button"
                  variant={newChannelType === "voice" ? "default" : "outline"}
                  className={newChannelType === "voice" ? "bg-[#316AC5] hover:bg-[#2A5BD7]" : "border-[#D4D0C8]"}
                  onClick={() => setNewChannelType("voice")}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Voice Channel
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder={newChannelType === "text" ? "new-channel" : "Voice Channel"}
                className="bg-white border-[#D4D0C8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel-category">Category</Label>
              <Select value={newChannelCategory} onValueChange={setNewChannelCategory}>
                <SelectTrigger id="channel-category" className="bg-white border-[#D4D0C8]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="channel-private" checked={newChannelPrivate} onCheckedChange={setNewChannelPrivate} />
              <div>
                <Label htmlFor="channel-private" className="text-sm font-medium">
                  Private Channel
                </Label>
                <p className="text-xs text-gray-500">Only specific roles can access this channel</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddChannelDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChannel} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
        <DialogContent className="bg-[#F5F4EA] border border-[#D4D0C8]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new category to organize your channels.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New Category"
                className="bg-white border-[#D4D0C8]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Channel Dialog */}
      <Dialog open={showEditChannelDialog} onOpenChange={setShowEditChannelDialog}>
        <DialogContent className="bg-[#F5F4EA] border border-[#D4D0C8]">
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
            <DialogDescription>Modify channel settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-channel-type">Channel Type</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={newChannelType === "text" ? "default" : "outline"}
                  className={newChannelType === "text" ? "bg-[#316AC5] hover:bg-[#2A5BD7]" : "border-[#D4D0C8]"}
                  onClick={() => setNewChannelType("text")}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Text Channel
                </Button>
                <Button
                  type="button"
                  variant={newChannelType === "voice" ? "default" : "outline"}
                  className={newChannelType === "voice" ? "bg-[#316AC5] hover:bg-[#2A5BD7]" : "border-[#D4D0C8]"}
                  onClick={() => setNewChannelType("voice")}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Voice Channel
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-channel-name">Channel Name</Label>
              <Input
                id="edit-channel-name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="bg-white border-[#D4D0C8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-channel-category">Category</Label>
              <Select value={newChannelCategory} onValueChange={setNewChannelCategory}>
                <SelectTrigger id="edit-channel-category" className="bg-white border-[#D4D0C8]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="edit-channel-private" checked={newChannelPrivate} onCheckedChange={setNewChannelPrivate} />
              <div>
                <Label htmlFor="edit-channel-private" className="text-sm font-medium">
                  Private Channel
                </Label>
                <p className="text-xs text-gray-500">Only specific roles can access this channel</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditChannelDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditChannel} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
