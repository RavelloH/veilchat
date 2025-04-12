import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { messageId } = req.query;
  const userId = session.user.id;
  
  try {
    // 获取消息
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true }
    });
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // 检查是否是消息发送者
    if (message.senderId !== userId) {
      // 检查是否是聊天成员
      const chatMember = await prisma.chatUser.findUnique({
        where: {
          chatId_userId: {
            chatId: message.chatId,
            userId
          }
        }
      });
      
      if (!chatMember) {
        return res.status(403).json({ error: 'Not authorized to modify this message' });
      }
    }
    
    if (req.method === 'DELETE') {
      // 将消息标记为已删除，而不是真正删除
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          content: '',
          encryptedKey: null,
          mediaUrl: null
        }
      });
      
      return res.status(200).json({ message: updatedMessage });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('消息操作错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
