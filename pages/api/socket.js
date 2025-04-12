import { Server } from 'socket.io';
import { verifySession } from '../../lib/auth';
import { prisma } from '../../lib/db';

export default async function handler(req, res) {
  // 检查WebSocket服务器是否已经初始化
  if (res.socket.server.io) {
    console.log('Socket已连接');
    res.end();
    return;
  }

  // 设置CORS
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  // 保存WebSocket服务器实例
  res.socket.server.io = io;

  // 用户-Socket映射
  const userSockets = new Map();

  io.on('connection', async (socket) => {
    console.log('新客户端连接:', socket.id);

    // 身份验证
    socket.on('authenticate', async (token) => {
      try {
        const user = await verifySession(token);
        if (!user) {
          socket.emit('auth_error', '验证失败');
          return;
        }

        console.log(`用户 ${user.username} (${user.id}) 已验证身份`);
        socket.userId = user.id;
        socket.username = user.username;

        // 添加到用户-Socket映射
        if (!userSockets.has(user.id)) {
          userSockets.set(user.id, new Set());
        }
        userSockets.get(user.id).add(socket.id);

        // 将用户加入到所有相关聊天的房间
        const userChats = await prisma.chatUser.findMany({
          where: { userId: user.id },
          select: { chatId: true }
        });

        userChats.forEach(chat => {
          socket.join(`chat:${chat.chatId}`);
        });

        // 告知用户身份验证成功
        socket.emit('authenticated');
        
        // 发送在线状态给好友
        // 实际中应实现一个获取用户好友/联系人的函数
        const contacts = await getContacts(user.id);
        contacts.forEach(contactId => {
          if (userSockets.has(contactId)) {
            io.to(Array.from(userSockets.get(contactId))).emit('user_online', user.id);
          }
        });
      } catch (error) {
        console.error('身份验证错误:', error);
        socket.emit('auth_error', '服务器错误');
      }
    });

    // 处理新消息
    socket.on('send_message', async (data) => {
      try {
        if (!socket.userId) {
          socket.emit('error', '未验证身份');
          return;
        }

        const { chatId, content, encryptedKey, replyToId, mediaUrl, mediaType, autoDeleteMinutes } = data;
        
        // 检查用户是否在这个聊天中
        const userInChat = await prisma.chatUser.findUnique({
          where: {
            chatId_userId: {
              chatId,
              userId: socket.userId
            }
          }
        });

        if (!userInChat) {
          socket.emit('error', '无权发送消息到此聊天');
          return;
        }

        // 计算自动删除时间
        let autoDeleteAt = null;
        if (autoDeleteMinutes) {
          autoDeleteAt = new Date();
          autoDeleteAt.setMinutes(autoDeleteAt.getMinutes() + autoDeleteMinutes);
        }

        // 创建消息
        const message = await prisma.message.create({
          data: {
            chatId,
            senderId: socket.userId,
            content,
            encryptedKey,
            replyToId,
            mediaUrl,
            mediaType,
            autoDeleteAt
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
              select: {
                id: true,
                content: true,
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

        // 向聊天室广播消息
        io.to(`chat:${chatId}`).emit('new_message', message);

        // 处理超级隐私模式
        if (userInChat.superPrivacyEnabled) {
          // 获取此聊天中的最近消息
          const recentMessages = await prisma.message.findMany({
            where: {
              chatId,
              senderId: socket.userId,
              createdAt: { lt: message.createdAt }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          });

          // 删除超过保留限制的消息
          if (recentMessages.length > 5) {
            const messagesToDelete = recentMessages.slice(5);
            for (const msg of messagesToDelete) {
              await prisma.message.update({
                where: { id: msg.id },
                data: { isDeleted: true, content: '' }
              });
            }
            
            // 通知删除消息
            io.to(`chat:${chatId}`).emit('messages_deleted', messagesToDelete.map(m => m.id));
          }
        }
      } catch (error) {
        console.error('处理消息错误:', error);
        socket.emit('error', '发送消息失败');
      }
    });

    // 处理消息删除
    socket.on('delete_message', async (messageId) => {
      try {
        if (!socket.userId) {
          socket.emit('error', '未验证身份');
          return;
        }

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { id: true, chatId: true, senderId: true }
        });

        if (!message) {
          socket.emit('error', '消息不存在');
          return;
        }

        if (message.senderId !== socket.userId) {
          socket.emit('error', '无权删除此消息');
          return;
        }

        await prisma.message.update({
          where: { id: messageId },
          data: { isDeleted: true, content: '' }
        });

        io.to(`chat:${message.chatId}`).emit('message_deleted', messageId);
      } catch (error) {
        console.error('删除消息错误:', error);
        socket.emit('error', '删除消息失败');
      }
    });

    // 处理断连
    socket.on('disconnect', () => {
      console.log('客户端断开连接:', socket.id);
      if (socket.userId && userSockets.has(socket.userId)) {
        userSockets.get(socket.userId).delete(socket.id);
        if (userSockets.get(socket.userId).size === 0) {
          userSockets.delete(socket.userId);
          // 通知联系人用户离线
          notifyOffline(socket.userId);
        }
      }
    });
  });

  // 通知联系人用户下线
  async function notifyOffline(userId) {
    try {
      const contacts = await getContacts(userId);
      contacts.forEach(contactId => {
        if (userSockets.has(contactId)) {
          io.to(Array.from(userSockets.get(contactId))).emit('user_offline', userId);
        }
      });
    } catch (error) {
      console.error('通知下线状态错误:', error);
    }
  }

  // 获取用户联系人列表
  async function getContacts(userId) {
    const chats = await prisma.chatUser.findMany({
      where: { userId },
      select: { chatId: true }
    });

    const chatIds = chats.map(chat => chat.chatId);

    const contacts = await prisma.chatUser.findMany({
      where: {
        chatId: { in: chatIds },
        userId: { not: userId }
      },
      select: { userId: true }
    });

    return [...new Set(contacts.map(c => c.userId))];
  }

  console.log('WebSocket服务器启动');
  res.end();
}
