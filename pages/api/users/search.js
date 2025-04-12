import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/db';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { term } = req.query;
  
  if (!term || term.length < 2) {
    return res.status(400).json({ error: 'Search term too short' });
  }
  
  try {
    // 搜索用户名或昵称匹配的用户
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: term, mode: 'insensitive' } },
          { name: { contains: term, mode: 'insensitive' } }
        ],
        // 不包含当前用户
        id: { not: session.user.id }
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        bio: true
      },
      take: 10 // 限制结果数量
    });
    
    return res.status(200).json({ users });
  } catch (error) {
    console.error('搜索用户错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
