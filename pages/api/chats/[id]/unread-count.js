import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const chatId = req.query.id;
    const userId = session.user.id;
    
    // 查找用户在此聊天中的记录
    const chatUser = await prisma.chatUser.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      include: {
        lastReadMessage: true,
      },
    });
    
    if (!chatUser) {
      return res.status(403).json({ message: 'User is not a member of this chat' });
    }
    
    // 获取用户最后读过的消息时间
    const lastReadTime = chatUser.lastReadMessage?.createdAt || chatUser.joinedAt;
    
    // 计算该时间后的未读消息数
    const unreadCount = await prisma.message.count({
      where: {
        chatId,
        createdAt: {
          gt: lastReadTime,
        },
        senderId: {
          not: userId, // 不计算自己发的消息
        },
        isDeleted: false,
      },
    });
    
    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
