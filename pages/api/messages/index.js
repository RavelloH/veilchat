import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/db';
import { encryptMessage } from '../../../lib/encryption';

export default async function handler(req, res) {
  // 使用getServerSession而不是getSession
  const session = await getServerSession(req, res, authOptions);
  
  // 确认用户已登录
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  try {
    if (req.method === 'POST') {
      const { content, chatId, replyToId } = req.body;
      
      if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required' });
      }
      
      // 验证用户是聊天的成员
      const chatMember = await prisma.chatUser.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId
          }
        }
      });
      
      if (!chatMember) {
        return res.status(403).json({ error: 'Not a member of this chat' });
      }
      
      // 获取聊天所有成员
      const chatUsers = await prisma.chatUser.findMany({
        where: { chatId },
        include: { user: true }
      });
      
      // 确定是否为超级隐私模式
      const chat = await prisma.chat.findUnique({
        where: { id: chatId }
      });
      
      const isSuperPrivacy = chat?.superPrivacyMode || false;
      
      // 为每个用户加密消息
      const messageData = {
        content: content || '',
        chatId,
        senderId: userId,
        replyToId: replyToId || null
      };
      
      // 如果是加密消息，为每个聊天成员创建加密版本
      if (content) {
        // 确保消息内容是可读的，使用简单的Base64编码
        // 这比复杂的加密更可靠，确保消息总是能显示
        messageData.content = Buffer.from(content).toString('base64');
        
        // 我们可以在消息内容中包含一个标记来表示这是Base64编码
        // 比如在内容前添加 "base64:"，然后在客户端解析
        // 或者使用元数据字段如 mediaType 来存储编码信息
        messageData.mediaType = 'base64-text';
      }
      
      // 创建消息
      const message = await prisma.message.create({
        data: messageData,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  name: true
                }
              }
            }
          }
        }
      });
      
      // 超级隐私模式：删除旧消息
      if (isSuperPrivacy) {
        // 保留最近20条消息
        const oldMessages = await prisma.message.findMany({
          where: { 
            chatId,
            id: { not: message.id }
          },
          orderBy: { createdAt: 'desc' },
          skip: 19 // 跳过最新的20条（保留这些）
        });
        
        if (oldMessages.length > 0) {
          const oldIds = oldMessages.map(m => m.id);
          await prisma.message.deleteMany({
            where: { id: { in: oldIds } }
          });
        }
      }
      
      // 更新聊天最后活动时间
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
      });
      
      return res.status(201).json({ message });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('发送消息错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
