// =============================================
// ============== CODEX SEED DB ===============
// =============================================
// ########## C.H.A.O.S TEST DATA #############
// ##### SECRET COMMUNICATION NETWORK #########
// #########################################
// Database seed script for C.H.A.O.S.
// Populates the database with sample data for testing

import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for C.H.A.O.S application...');
  
  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.channelMember.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.hubMember.deleteMany();
  await prisma.hub.deleteMany();
  await prisma.directMessage.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.friend.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🧹 Cleaned existing data');
  
  // Create test users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const testUsers = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@chaos.com',
      passwordHash,
      displayName: 'Admin User',
      status: 'ONLINE' as UserStatus,
      customStatus: 'Testing C.H.A.O.S',
      role: 'ADMIN',
      avatar: null,
    },
    {
      id: '2',
      username: 'alice',
      email: 'alice@chaos.com',
      passwordHash,
      displayName: 'Alice Smith',
      status: 'ONLINE' as UserStatus,
      customStatus: 'Exploring the system',
      role: 'USER',
      avatar: null,
    },
    {
      id: '3',
      username: 'bob',
      email: 'bob@chaos.com',
      passwordHash,
      displayName: 'Bob Johnson',
      status: 'AWAY' as UserStatus,
      customStatus: 'Working...',
      role: 'USER',
      avatar: null,
    },
    {
      id: '4',
      username: 'carol',
      email: 'carol@chaos.com',
      passwordHash,
      displayName: 'Carol Williams',
      status: 'BUSY' as UserStatus,
      customStatus: 'Do not disturb',
      role: 'USER',
      avatar: null,
    },
    {
      id: '5',
      username: 'dave',
      email: 'dave@chaos.com',
      passwordHash,
      displayName: 'Dave Brown',
      status: 'OFFLINE' as UserStatus,
      customStatus: null,
      role: 'USER',
      avatar: null,
    },
  ];
  
  const users = await Promise.all(
    testUsers.map(user => 
      prisma.user.create({
        data: user
      })
    )
  );
  
  console.log(`👤 Created ${users.length} test users`);
  
  // Create friend relationships
  await prisma.friend.createMany({
    data: [
      { userId: '1', friendId: '2' },
      { userId: '2', friendId: '1' },
      { userId: '1', friendId: '3' },
      { userId: '3', friendId: '1' },
      { userId: '1', friendId: '4' },
      { userId: '4', friendId: '1' },
      { userId: '2', friendId: '3' },
      { userId: '3', friendId: '2' },
    ],
  });
  
  console.log('👥 Created friend relationships');
  
  // Create a pending friend request
  await prisma.friendRequest.create({
    data: {
      senderId: '5',
      receiverId: '1',
      status: 'PENDING',
    },
  });
  
  console.log('📨 Created pending friend request');
  
  // Create a hub (server)
  const testHub = await prisma.hub.create({
    data: {
      name: 'C.H.A.O.S HQ',
      description: 'Official test hub for C.H.A.O.S application',
      ownerId: '1',
      icon: null,
      members: {
        create: [
          { userId: '1', role: 'OWNER' },
          { userId: '2', role: 'ADMIN' },
          { userId: '3', role: 'MODERATOR' },
          { userId: '4', role: 'MEMBER' },
        ],
      },
    },
  });
  
  console.log(`🏢 Created hub: ${testHub.name}`);
  
  // Create channels
  const channels = await Promise.all([
    prisma.channel.create({
      data: {
        name: 'general',
        description: 'General discussion',
        hubId: testHub.id,
        type: 'TEXT',
      },
    }),
    prisma.channel.create({
      data: {
        name: 'random',
        description: 'Random topics',
        hubId: testHub.id,
        type: 'TEXT',
      },
    }),
    prisma.channel.create({
      data: {
        name: 'voice-chat',
        description: 'Voice discussions',
        hubId: testHub.id,
        type: 'VOICE',
      },
    }),
  ]);
  
  console.log(`📢 Created ${channels.length} channels`);
  
  // Add members to channels
  await Promise.all(
    channels.map(channel =>
      prisma.channelMember.createMany({
        data: [
          { channelId: channel.id, userId: '1' },
          { channelId: channel.id, userId: '2' },
          { channelId: channel.id, userId: '3' },
          { channelId: channel.id, userId: '4' },
        ],
      })
    )
  );
  
  console.log('👥 Added members to channels');
  
  // Create channel messages
  await prisma.message.createMany({
    data: [
      {
        content: 'Welcome to C.H.A.O.S HQ!',
        senderId: '1',
        channelId: channels[0].id,
      },
      {
        content: 'Thanks for having me! Excited to try out this MSN-inspired platform.',
        senderId: '2',
        channelId: channels[0].id,
      },
      {
        content: 'The nostalgia is real! Reminds me of the good old days.',
        senderId: '3',
        channelId: channels[0].id,
      },
      {
        content: 'Hello everyone! This is a random message in the random channel.',
        senderId: '2',
        channelId: channels[1].id,
      },
    ],
  });
  
  console.log('💬 Created channel messages');
  
  // Create direct messages
  const directMessages = await Promise.all([
    // Conversation between Admin and Alice
    prisma.directMessage.create({
      data: {
        senderId: '1',
        receiverId: '2',
        content: 'Hey Alice, how are you liking C.H.A.O.S so far?',
      },
    }),
    prisma.directMessage.create({
      data: {
        senderId: '2',
        receiverId: '1',
        content: 'It\'s great! Love the MSN Messenger vibes.',
      },
    }),
    
    // Conversation between Admin and Bob
    prisma.directMessage.create({
      data: {
        senderId: '1',
        receiverId: '3',
        content: 'Bob, do you have a minute to test the voice channel?',
      },
    }),
    prisma.directMessage.create({
      data: {
        senderId: '3',
        receiverId: '1',
        content: 'Sure, I\'ll be available in about 10 minutes.',
      },
    }),
    
    // Conversation between Alice and Carol
    prisma.directMessage.create({
      data: {
        senderId: '2',
        receiverId: '4',
        content: 'Hey Carol, want to join our testing session?',
      },
    }),
    prisma.directMessage.create({
      data: {
        senderId: '4',
        receiverId: '2',
        content: 'Sorry, I\'m busy at the moment. Maybe later?',
      },
    }),
  ]);
  
  console.log(`📝 Created ${directMessages.length} direct messages`);
  
  console.log('✅ Seed completed successfully!');
  console.log('Test Accounts:');
  testUsers.forEach(user => {
    console.log(`- ${user.username} / password123 (${user.role})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
