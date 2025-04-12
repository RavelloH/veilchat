import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { name, memberIds } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }
  
  if (!memberIds || !Array.isArray(memberIds) || memberIds.length < 2) {
    return res.status(400).json({ error: 'At least 2 members are required' });
  }
  
  // 确保当前用户是成员之一
  const allMemberIds = [...new Set([userId, ...memberIds])];
  
  try {
    // 创建群聊
    const newGroup = await prisma.chat.create({
      data: {
        name,
        isGroup: true,
        users: {
          create: allMemberIds.map(memberId => ({
            userId: memberId,
            isAdmin: memberId === userId // 创建者为管理员
          }))
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
    
    return res.status(201).json({ chat: newGroup });
  } catch (error) {
    console.error('创建群聊错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
