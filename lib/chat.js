import { prisma } from './db';
import { encryptMessage, encryptGroupMessage } from './encryption';

// 创建或获取私聊
export const getOrCreateDirectChat = async (userId1, userId2) => {
  // 查找两个用户之间现有的聊天
  const existingChat = await prisma.$transaction(async (tx) => {
    // 找到两个用户共同参与的所有聊天
    const user1Chats = await tx.chatUser.findMany({
      where: { userId: userId1 },
      select: { chatId: true }
    });
    
    const user2Chats = await tx.chatUser.findMany({
      where: { userId: userId2 },
      select: { chatId: true }
    });
    
    const user1ChatIds = user1Chats.map(c => c.chatId);
    const user2ChatIds = user2Chats.map(c => c.chatId);
    
    // 查找两个用户都参与的聊天
    const commonChatIds = user1ChatIds.filter(id => user2ChatIds.includes(id));
    
    if (commonChatIds.length === 0) return null;
    
    // 检查是否为私聊
    const directChats = await tx.chat.findMany({
      where: {
        id: { in: commonChatIds },
        type: 'DIRECT'
      },
      include: {
        users: true
      }
    });
    
    // 找到只有这两个用户的聊天
    return directChats.find(chat => chat.users.length === 2);
  });
  
  if (existingChat) return existingChat;
  
  // 如果不存在，创建新的私聊
  return await prisma.chat.create({
    data: {
      type: 'DIRECT',
      users: {
        create: [
          { userId: userId1 },
          { userId: userId2 }
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
              avatar: true,
              publicKey: true
            }
          }
        }
      }
    }
  });
};

// 创建群组聊天
export const createGroupChat = async (creatorId, name, memberIds) => {
  // 确保创建者在成员列表中
  if (!memberIds.includes(creatorId)) {
    memberIds.push(creatorId);
  }
  
  // 创建群聊
  return await prisma.chat.create({
    data: {
      type: 'GROUP',
      users: {
        create: memberIds.map(userId => ({
          userId
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
              avatar: true,
              publicKey: true
            }
          }
        }
      }
    }
  });
};

// 发送消息
export const sendMessage = async (chatId, senderId, content, replyToId = null, mediaUrl = null, mediaType = null, autoDeleteMinutes = null) => {
  // 验证用户是否在聊天中
  const userInChat = await prisma.chatUser.findUnique({
    where: {
      chatId_userId: {
        chatId,
        userId: senderId
      }
    }
  });
  
  if (!userInChat) {
    throw new Error('用户不在聊天中');
  }
  
  // 计算自动删除时间
  let autoDeleteAt = null;
  if (autoDeleteMinutes) {
    autoDeleteAt = new Date();
    autoDeleteAt.setMinutes(autoDeleteAt.getMinutes() + parseInt(autoDeleteMinutes));
  }
  
  // 创建消息
  const message = await prisma.message.create({
    data: {
      chatId,
      senderId,
      content,
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
  
  return message;
};

// 获取聊天消息
export const getChatMessages = async (chatId, userId, limit = 50, before = null) => {
  // 验证用户是否在聊天中
  const userInChat = await prisma.chatUser.findUnique({
    where: {
      chatId_userId: {
        chatId,
        userId
      }
    }
  });
  
  if (!userInChat) {
    throw new Error('用户不在聊天中');
  }
  
  // 构建查询条件
  const whereCondition = {
    chatId,
    ...(before ? { createdAt: { lt: new Date(before) } } : {})
  };
  
  // 获取消息
  const messages = await prisma.message.findMany({
    where: whereCondition,
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
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
  
  return messages.reverse();
};

// 获取用户的所有聊天
export const getUserChats = async (userId) => {
  return await prisma.chat.findMany({
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
              publicKey: true
            }
          }
        }
      },
      messages: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1,
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
};

// 搜索消息
export const searchMessages = async (userId, searchTerm) => {
  // 获取用户所在的聊天
  const userChats = await prisma.chatUser.findMany({
    where: { userId },
    select: { chatId: true }
  });
  
  const chatIds = userChats.map(chat => chat.chatId);
  
  // 搜索消息
  const messages = await prisma.message.findMany({
    where: {
      chatId: { in: chatIds },
      content: { contains: searchTerm }
    },
    include: {
      chat: true,
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  });
  
  return messages;
};

// 启用超级隐私模式
export const toggleSuperPrivacyMode = async (chatId, userId, enabled) => {
  return await prisma.chatUser.update({
    where: {
      chatId_userId: {
        chatId,
        userId
      }
    },
    data: {
      superPrivacyEnabled: enabled
    }
  });
};
