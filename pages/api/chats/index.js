import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  // 使用getServerSession而不是getSession
  const session = await getServerSession(req, res, authOptions);
  
  // 检查认证
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  try {
    if (req.method === 'GET') {
      // 获取用户的所有聊天
      const chats = await prisma.chat.findMany({
        where: {
          users: {
            some: {
              userId
            }
          }
        },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                }
              }
            }
          },
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            },
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
          updatedAt: 'desc'
        }
      });
      
      return res.status(200).json({ chats });
    } else if (req.method === 'POST') {
      // 创建新聊天
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      // 查找目标用户
      const targetUser = await prisma.user.findUnique({
        where: { username }
      });
      
      if (!targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (targetUser.id === userId) {
        return res.status(400).json({ error: 'Cannot chat with yourself' });
      }
      
      // 检查是否已存在私聊
      const existingChat = await prisma.chat.findFirst({
        where: {
          isGroup: false,
          AND: [
            {
              users: {
                some: {
                  userId
                }
              }
            },
            {
              users: {
                some: {
                  userId: targetUser.id
                }
              }
            }
          ]
        },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true
                }
              }
            }
          }
        }
      });
      
      if (existingChat) {
        return res.status(200).json({ chat: existingChat });
      }
      
      // 创建新的私聊
      const newChat = await prisma.chat.create({
        data: {
          isGroup: false,
          users: {
            create: [
              { userId },
              { userId: targetUser.id }
            ]
          }
        },
        include: {
          users: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true
                }
              }
            }
          },
          messages: true
        }
      });
      
      return res.status(201).json({ chat: newChat });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
