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
import { UserPlus, Search, MoreHorizontal, Shield, Crown, Ban, UserMinus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HubMembersProps {
  hubId: string | null
}

interface Member {
  id: string
  name: string
  status: "online" | "away" | "busy" | "offline"
  role: "Owner" | "Admin" | "Moderator" | "Member" | "Guest"
  joinedDate: string
  avatar: string
}

export function HubMembers({ hubId }: HubMembersProps) {
  const [members, setMembers] = useState<Member[]>([
    {
      id: "user1",
      name: "Admin",
      status: "online",
      role: "Owner",
      joinedDate: "2023-01-15",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user2",
      name: "GamerGirl2000",
      status: "online",
      role: "Moderator",
      joinedDate: "2023-02-20",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user3",
      name: "TechWizard",
      status: "away",
      role: "Member",
      joinedDate: "2023-03-10",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user4",
      name: "CoolDude99",
      status: "online",
      role: "Member",
      joinedDate: "2023-04-05",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user5",
      name: "Jessica82",
      status: "offline",
      role: "Member",
      joinedDate: "2023-05-12",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user6",
      name: "ProGamer99",
      status: "busy",
      role: "Member",
      joinedDate: "2023-06-18",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ])

  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("Member")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "online" | "pending" | "banned">("all")

  const filteredMembers = members.filter((member) => {
    // Filter by search query
    if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Filter by tab
    if (activeTab === "online" && member.status === "offline") {
      return false
    }

    // For demo purposes, we don't have pending or banned members
    if (activeTab === "pending" || activeTab === "banned") {
      return false
    }

    return true
  })

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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return <Crown className="w-3.5 h-3.5 text-yellow-500" />
      case "Admin":
        return <Shield className="w-3.5 h-3.5 text-purple-500" />
      case "Moderator":
        return <Shield className="w-3.5 h-3.5 text-blue-500" />
      default:
        return null
    }
  }

  const handleInviteMember = () => {
    // In a real app, we would send an invitation
    setShowInviteDialog(false)
    setInviteEmail("")
    setInviteRole("Member")
  }

  const handleChangeMemberRole = (memberId: string, newRole: "Owner" | "Admin" | "Moderator" | "Member" | "Guest") => {
    setMembers(members.map((member) => (member.id === memberId ? { ...member, role: newRole } : member)))
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((member) => member.id !== memberId))
  }

  return (
    <div className="border border-[#D4D0C8] rounded-md overflow-hidden bg-white h-full">
      <Tabs defaultValue="all" className="h-full flex flex-col">
        <div className="bg-[#ECE9D8] border-b border-[#D4D0C8] p-2">
          <TabsList className="bg-[#ECE9D8] border border-[#D4D0C8]">
            <TabsTrigger
              value="all"
              className="text-xs data-[state=active]:bg-[#F5F4EA]"
              onClick={() => setActiveTab("all")}
            >
              All Members ({members.length})
            </TabsTrigger>
            <TabsTrigger
              value="online"
              className="text-xs data-[state=active]:bg-[#F5F4EA]"
              onClick={() => setActiveTab("online")}
            >
              Online ({members.filter((m) => m.status !== "offline").length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-xs data-[state=active]:bg-[#F5F4EA]"
              onClick={() => setActiveTab("pending")}
            >
              Pending (0)
            </TabsTrigger>
            <TabsTrigger
              value="banned"
              className="text-xs data-[state=active]:bg-[#F5F4EA]"
              onClick={() => setActiveTab("banned")}
            >
              Banned (0)
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 border-b border-[#D4D0C8] flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-white border-[#D4D0C8]"
            />
          </div>
          <Button onClick={() => setShowInviteDialog(true)} className="bg-[#316AC5] hover:bg-[#2A5BD7] ml-2">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite People
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="all" className="p-0 m-0">
            <div className="divide-y divide-[#F0F0F0]">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div key={member.id} className="p-3 hover:bg-[#F5F4EA] flex items-center">
                    <div className="relative mr-3">
                      <img
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}
                      ></span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">{member.name}</span>
                        {getRoleIcon(member.role) && (
                          <span className="ml-1" title={member.role}>
                            {getRoleIcon(member.role)}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <span>{member.role}</span>
                        <span className="mx-1">•</span>
                        <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-[#D4D0C8]">
                        <DropdownMenuItem className="cursor-pointer">Message</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">View Profile</DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleChangeMemberRole(member.id, "Moderator")}
                          disabled={member.role === "Owner" || member.role === "Moderator"}
                        >
                          <Shield className="w-4 h-4 mr-2 text-blue-500" />
                          Make Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleChangeMemberRole(member.id, "Member")}
                          disabled={member.role === "Owner" || member.role === "Member"}
                        >
                          Remove Moderator
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 cursor-pointer">
                          <Ban className="w-4 h-4 mr-2" />
                          Ban Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 cursor-pointer"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={member.role === "Owner"}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove from Hub
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {searchQuery ? (
                    <p>No members found matching "{searchQuery}"</p>
                  ) : activeTab === "pending" ? (
                    <p>No pending invitations</p>
                  ) : activeTab === "banned" ? (
                    <p>No banned members</p>
                  ) : (
                    <p>No members found</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="online" className="p-0 m-0">
            {/* This content is handled by the filtered members in the "all" tab */}
          </TabsContent>

          <TabsContent value="pending" className="p-0 m-0">
            <div className="p-8 text-center text-gray-500">
              <p>No pending invitations</p>
            </div>
          </TabsContent>

          <TabsContent value="banned" className="p-0 m-0">
            <div className="p-8 text-center text-gray-500">
              <p>No banned members</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-[#F5F4EA] border border-[#D4D0C8]">
          <DialogHeader>
            <DialogTitle>Invite People</DialogTitle>
            <DialogDescription>Invite new members to join your hub.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                Email or Username
              </label>
              <Input
                id="invite-email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email or username"
                className="bg-white border-[#D4D0C8]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="invite-role" className="text-sm font-medium">
                Role
              </label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role" className="bg-white border-[#D4D0C8]">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Moderator">Moderator</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember} className="bg-[#316AC5] hover:bg-[#2A5BD7]">
              <UserPlus className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
