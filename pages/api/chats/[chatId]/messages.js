import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/db';

export default async function handler(req, res) {
  // 使用getServerSession而不是getSession
  const session = await getServerSession(req, res, authOptions);
  
  // 检查认证
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { chatId } = req.query;
  const userId = session.user.id;
  
  try {
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
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (req.method === 'GET') {
      // 获取聊天的消息
      const messages = await prisma.message.findMany({
        where: {
          chatId
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          },
          deliveredFrom: {
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
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      return res.status(200).json({ messages });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
