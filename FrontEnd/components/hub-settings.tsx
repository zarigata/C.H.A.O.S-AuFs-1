"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, Trash2, Shield, AlertTriangle } from "lucide-react"

interface HubSettingsProps {
  hubId: string | null
}

export function HubSettings({ hubId }: HubSettingsProps) {
  const [hubName, setHubName] = useState(getHubName(hubId))
  const [hubDescription, setHubDescription] = useState("A place to discuss all things related to gaming!")
  const [hubIcon, setHubIcon] = useState("/placeholder.svg?height=128&width=128")
  const [hubBanner, setHubBanner] = useState("/placeholder.svg?height=200&width=600&text=Hub%20Banner")
  const [hubPrivacy, setHubPrivacy] = useState("public")
  const [verificationLevel, setVerificationLevel] = useState("low")
  const [notificationSettings, setNotificationSettings] = useState({
    allMessages: false,
    mentions: true,
    directMessages: true,
    announcements: true,
  })

  const handleSaveSettings = () => {
    // In a real app, we would save the settings to the server
    alert("Settings saved!")
  }

  return (
    <div className="border border-[#D4D0C8] rounded-md overflow-hidden bg-white h-full">
      <Tabs defaultValue="general" className="h-full flex flex-col">
        <div className="bg-[#ECE9D8] border-b border-[#D4D0C8] p-2">
          <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8]">
            <TabsTrigger value="general" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              Privacy & Safety
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="danger" className="text-xs data-[state=active]:bg-[#F5F4EA]">
              Danger Zone
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="general" className="p-4 m-0">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold mb-4">General Hub Settings</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hub-name" className="block text-sm font-medium mb-1">
                    Hub Name
                  </Label>
                  <Input
                    id="hub-name"
                    value={hubName}
                    onChange={(e) => setHubName(e.target.value)}
                    className="bg-white border-[#D4D0C8]"
                  />
                </div>

                <div>
                  <Label htmlFor="hub-description" className="block text-sm font-medium mb-1">
                    Hub Description
                  </Label>
                  <Textarea
                    id="hub-description"
                    value={hubDescription}
                    onChange={(e) => setHubDescription(e.target.value)}
                    className="bg-white border-[#D4D0C8]"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="hub-region" className="block text-sm font-medium mb-1">
                    Hub Region
                  </Label>
                  <Select defaultValue="automatic">
                    <SelectTrigger id="hub-region" className="bg-white border-[#D4D0C8]">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automatic</SelectItem>
                      <SelectItem value="us-west">US West</SelectItem>
                      <SelectItem value="us-east">US East</SelectItem>
                      <SelectItem value="europe">Europe</SelectItem>
                      <SelectItem value="asia">Asia</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="default-channel" className="block text-sm font-medium mb-1">
                    Default Channel
                  </Label>
                  <Select defaultValue="general">
                    <SelectTrigger id="default-channel" className="bg-white border-[#D4D0C8]">
                      <SelectValue placeholder="Select default channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">general</SelectItem>
                      <SelectItem value="announcements">announcements</SelectItem>
                      <SelectItem value="off-topic">off-topic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="p-4 m-0">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold mb-4">Hub Appearance</h2>

              <div className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium mb-2">Hub Icon</Label>
                  <div className="flex items-center space-x-4">
                    <img
                      src={hubIcon || "/placeholder.svg"}
                      alt="Hub Icon"
                      className="w-24 h-24 rounded-full border-2 border-[#316AC5]"
                    />
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        We recommend an image of at least 512x512 for the hub icon.
                      </p>
                      <Button className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Icon
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">Hub Banner</Label>
                  <div className="space-y-2">
                    <img
                      src={hubBanner || "/placeholder.svg"}
                      alt="Hub Banner"
                      className="w-full h-32 object-cover rounded-md border border-[#D4D0C8]"
                    />
                    <p className="text-sm text-gray-600">
                      We recommend an image of at least 960x540 for the hub banner.
                    </p>
                    <Button className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Banner
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">Hub Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Default", "Dark", "Light", "Retro", "Neon", "Pastel"].map((theme) => (
                      <div
                        key={theme}
                        className="border border-[#D4D0C8] rounded-md p-2 cursor-pointer hover:bg-[#EBE8D8] text-center"
                      >
                        <div className="h-12 bg-gray-200 rounded-md mb-2"></div>
                        <span className="text-sm">{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="p-4 m-0">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold mb-4">Privacy & Safety Settings</h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="hub-privacy" className="block text-sm font-medium mb-1">
                    Hub Privacy
                  </Label>
                  <Select value={hubPrivacy} onValueChange={setHubPrivacy}>
                    <SelectTrigger id="hub-privacy" className="bg-white border-[#D4D0C8]">
                      <SelectValue placeholder="Select privacy setting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can find and join</SelectItem>
                      <SelectItem value="private">Private - Invite only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="verification-level" className="block text-sm font-medium mb-1">
                    Verification Level
                  </Label>
                  <Select value={verificationLevel} onValueChange={setVerificationLevel}>
                    <SelectTrigger id="verification-level" className="bg-white border-[#D4D0C8]">
                      <SelectValue placeholder="Select verification level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - Unrestricted</SelectItem>
                      <SelectItem value="low">Low - Must have verified email</SelectItem>
                      <SelectItem value="medium">Medium - Must be registered for 5+ minutes</SelectItem>
                      <SelectItem value="high">High - Must be a member for 10+ minutes</SelectItem>
                      <SelectItem value="highest">Highest - Must have verified phone number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">Content Filter</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Scan media content</p>
                        <p className="text-xs text-gray-500">
                          Automatically scan images and videos for inappropriate content
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Filter explicit content</p>
                        <p className="text-xs text-gray-500">Hide messages that may contain explicit content</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">Privacy Controls</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Allow direct messages</p>
                        <p className="text-xs text-gray-500">Let members send direct messages to each other</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Allow member profiles</p>
                        <p className="text-xs text-gray-500">Let members view each other's profiles</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                    <Save className="w-4 h-4 mr-2" />
                    <Shield className="w-4 h-4 mr-2" />
                    Save Privacy Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="p-4 m-0">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold mb-4">Notification Settings</h2>

              <div className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium mb-2">Notification Preferences</Label>
                  <div className="space-y-3 border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">All Messages</p>
                        <p className="text-xs text-gray-500">Get notified for every message in all channels</p>
                      </div>
                      <Switch
                        checked={notificationSettings.allMessages}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, allMessages: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Mentions</p>
                        <p className="text-xs text-gray-500">Get notified when someone mentions you</p>
                      </div>
                      <Switch
                        checked={notificationSettings.mentions}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, mentions: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Direct Messages</p>
                        <p className="text-xs text-gray-500">Get notified for direct messages</p>
                      </div>
                      <Switch
                        checked={notificationSettings.directMessages}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, directMessages: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Announcements</p>
                        <p className="text-xs text-gray-500">Get notified for hub announcements</p>
                      </div>
                      <Switch
                        checked={notificationSettings.announcements}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, announcements: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-2">Notification Sounds</Label>
                  <div className="space-y-3 border border-[#D4D0C8] rounded-md p-3 bg-[#F5F4EA]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Message Sound</p>
                        <p className="text-xs text-gray-500">Play a sound when you receive a message</p>
                      </div>
                      <Select defaultValue="msn">
                        <SelectTrigger className="w-40 bg-white border-[#D4D0C8]">
                          <SelectValue placeholder="Select sound" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="msn">MSN Classic</SelectItem>
                          <SelectItem value="xp">Windows XP</SelectItem>
                          <SelectItem value="ping">Ping</SelectItem>
                          <SelectItem value="chime">Chime</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Mention Sound</p>
                        <p className="text-xs text-gray-500">Play a sound when you are mentioned</p>
                      </div>
                      <Select defaultValue="ping">
                        <SelectTrigger className="w-40 bg-white border-[#D4D0C8]">
                          <SelectValue placeholder="Select sound" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="msn">MSN Classic</SelectItem>
                          <SelectItem value="xp">Windows XP</SelectItem>
                          <SelectItem value="ping">Ping</SelectItem>
                          <SelectItem value="chime">Chime</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="danger" className="p-4 m-0">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-bold mb-4 flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Danger Zone
              </h2>

              <div className="space-y-6">
                <div className="border border-red-300 rounded-md p-4 bg-red-50">
                  <h3 className="text-md font-semibold text-red-600 mb-2">Leave Hub</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    You will lose access to all channels and messages in this hub.
                  </p>
                  <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                    Leave Hub
                  </Button>
                </div>

                <div className="border border-red-300 rounded-md p-4 bg-red-50">
                  <h3 className="text-md font-semibold text-red-600 mb-2">Transfer Ownership</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Transfer ownership of this hub to another member. This action cannot be undone.
                  </p>
                  <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                    Transfer Ownership
                  </Button>
                </div>

                <div className="border border-red-300 rounded-md p-4 bg-red-50">
                  <h3 className="text-md font-semibold text-red-600 mb-2">Delete Hub</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Permanently delete this hub and all its data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Hub
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function getHubName(hubId: string | null): string {
  if (!hubId) return "Unknown Hub"

  const hubs = {
    hub1: "Gaming Alliance",
    hub2: "Tech Enthusiasts",
    hub3: "Movie Buffs",
    hub4: "Music Lovers",
  }

  return hubs[hubId as keyof typeof hubs] || "Unknown Hub"
}
