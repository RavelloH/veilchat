import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { chatId, messageId } = req.body;
    const userId = session.user.id;
    
    if (!chatId || !messageId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    // 查找用户是否是此聊天的成员
    const chatUser = await prisma.chatUser.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });
    
    if (!chatUser) {
      return res.status(403).json({ message: 'User is not a member of this chat' });
    }
    
    // 更新用户在聊天中最后读取的消息ID
    await prisma.chatUser.update({
      where: {
        id: chatUser.id,
      },
      data: {
        lastReadMessageId: messageId,
      },
    });
    
    // 创建或更新已读回执
    await prisma.readReceipt.upsert({
      where: {
        userId_messageId: {
          userId,
          messageId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        userId,
        messageId,
        chatId,
        readAt: new Date(),
      },
    });
    
    return res.status(200).json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
