// =============================================
// ============== CODEX TYPES ================
// =============================================
// Type definitions for C.H.A.O.S.
// Core data structures used throughout the application

/**
 * User status options
 */
export type UserStatus = 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE';

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'theme-msn-classic';

/**
 * User interface
 */
export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  customStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Message interface
 */
export interface Message {
  id: string;
  content: string;
  encrypted: boolean;
  senderId: string;
  channelId?: string;
  directMessageId?: string;
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

/**
 * Hub (Server) interface
 */
export interface Hub {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role?: HubRole;
  memberCount?: number;
}

/**
 * Channel interface
 */
export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  hubId: string;
  createdAt: string;
  updatedAt: string;
  hub?: {
    id: string;
    name: string;
  };
}

/**
 * Direct message conversation interface
 */
export interface DirectMessageConversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
}

/**
 * Friend interface
 */
export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: UserStatus;
  customStatus?: string;
}

/**
 * Friend request interface
 */
export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt?: string;
  user: User;
}

/**
 * Hub member interface
 */
export interface HubMember {
  userId: string;
  hubId: string;
  role: HubRole;
  nickname?: string;
  joinedAt: string;
  user: User;
}

/**
 * Hub role type
 */
export type HubRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';

/**
 * Channel type
 */
export type ChannelType = 'TEXT' | 'VOICE';

/**
 * Friend request status
 */
export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';

/**
 * API error response
 */
export interface ApiError {
  error: string;
  details?: any;
}
