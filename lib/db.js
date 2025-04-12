import { PrismaClient } from '@prisma/client';

// 避免在开发环境下创建多个Prisma实例
const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 自动清理过期资源的函数
export const cleanupExpiredResources = async () => {
  const now = new Date();
  
  try {
    // 删除过期的会话
    await prisma.session.deleteMany({
      where: { expiresAt: { lt: now } }
    });
    
    // 删除超过7天的媒体消息
    await prisma.message.updateMany({
      where: {
        mediaUrl: { not: null },
        createdAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      },
      data: {
        mediaUrl: null,
        mediaType: null,
        content: '此媒体文件已过期'
      }
    });
    
    // 删除设置了自动删除的消息
    await prisma.message.updateMany({
      where: {
        autoDeleteAt: { lt: now }
      },
      data: {
        isDeleted: true,
        content: ''
      }
    });
    
    // 处理自动删除账户
    const inactiveUsers = await prisma.user.findMany({
      where: {
        autoDeleteDays: { not: null },
        lastLoginAt: {
          lt: new Date(now.getTime() - 24 * 60 * 60 * 1000 * 30) // 30天不活跃
        }
      }
    });
    
    for (const user of inactiveUsers) {
      const lastLoginDays = Math.floor((now - user.lastLoginAt) / (24 * 60 * 60 * 1000));
      if (lastLoginDays >= user.autoDeleteDays) {
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    
    console.log('清理任务完成');
  } catch (error) {
    console.error('清理资源时出错:', error);
  }
};
