import { createUser } from '../../lib/auth';
import { prisma } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { username, password, email, name } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    // 如果提供了邮箱，检查是否已被使用
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    // 创建新用户
    const { user } = await createUser(
      {
        username,
        email,
        name: name || username
      },
      password
    );
    
    // 不返回敏感数据
    const safeUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      isAnonymous: user.isAnonymous,
      createdAt: user.createdAt
    };
    
    return res.status(201).json({ user: safeUser });
  } catch (error) {
    console.error('注册错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
