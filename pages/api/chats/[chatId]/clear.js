import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/db';

export default async function handler(req, res) {
  // 使用getServerSession而不是getSession
  const session = await getServerSession(req, res, authOptions);
  
  // 确认用户已登录
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { chatId } = req.query;
  const userId = session.user.id;
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
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
    
    // 删除所有消息
    await prisma.message.deleteMany({
      where: { chatId }
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('清除聊天记录错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
