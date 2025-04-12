import { createAnonymousUser } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Display name is required' });
  }
  
  try {
    // 创建匿名用户
    const { user, tempPassword } = await createAnonymousUser(name);
    
    // 不返回敏感数据
    const safeUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      isAnonymous: user.isAnonymous,
      createdAt: user.createdAt,
      autoDeleteAt: user.autoDeleteAt
    };
    
    return res.status(201).json({ user: safeUser, tempPassword });
  } catch (error) {
    console.error('创建匿名用户错误:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
