import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { prisma } from './db';
import { generateServerKeyPair, encryptPrivateKey, decryptPrivateKey, hashPassword } from './encryption';

// 创建用户
export async function createUser(userData, password) {
  const passwordHash = hashPassword(password);
  
  // 生成RSA密钥对
  const { publicKey, privateKey } = generateServerKeyPair();
  
  // 使用密码加密私钥
  const privateKeyEncrypted = encryptPrivateKey(privateKey, passwordHash);
  
  const user = await prisma.user.create({
    data: {
      ...userData,
      passwordHash,
      publicKey,
      privateKeyEncrypted,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  return { user, privateKey };
}

// 创建匿名用户
export async function createAnonymousUser(name) {
  // 生成随机用户名
  const randomId = crypto.randomBytes(4).toString('hex');
  const username = `anon_${randomId}`;
  
  // 生成随机密码
  const tempPassword = crypto.randomBytes(8).toString('hex');
  const passwordHash = hashPassword(tempPassword);
  
  // 生成RSA密钥对
  const { publicKey, privateKey } = generateServerKeyPair();
  
  // 使用密码加密私钥
  const privateKeyEncrypted = encryptPrivateKey(privateKey, passwordHash);
  
  // 设置自动删除时间 (例如：7天后)
  const autoDeleteAt = new Date();
  autoDeleteAt.setDate(autoDeleteAt.getDate() + 7);
  
  const user = await prisma.user.create({
    data: {
      username,
      name,
      passwordHash,
      publicKey,
      privateKeyEncrypted,
      isAnonymous: true,
      autoDeleteAt,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  return { user, tempPassword };
}

// 验证用户和密码并返回用户数据
export async function verifyCredentials(username, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user) return false;
    
    // 验证密码
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) return false;
    
    // 尝试解密用户的私钥
    if (user.privateKeyEncrypted) {
      try {
        const privateKey = decryptPrivateKey(user.privateKeyEncrypted, passwordHash);
        if (!privateKey) return false;
      } catch (error) {
        console.error('私钥解密失败:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('凭证验证错误:', error);
    return false;
  }
}

// 创建用户会话
export const createSession = async (userId, deviceInfo = null) => {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30天有效期
  
  const session = await prisma.session.create({
    data: {
      userId,
      token,
      deviceInfo,
      expiresAt
    }
  });
  
  return session;
};

// 验证会话有效性
export const verifySession = async (token) => {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });
  
  if (!session || new Date() > session.expiresAt) {
    return null;
  }
  
  // 更新最后活动时间
  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() }
  });
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastLoginAt: new Date() }
  });
  
  return session.user;
};

// TOTP相关功能（两步验证）
export const generateTOTPSecret = () => {
  return crypto.randomBytes(20).toString('hex');
};

export const getTOTPUri = (secret, username) => {
  const encodedSecret = encodeURIComponent(secret);
  return `otpauth://totp/VeilChat:${username}?secret=${encodedSecret}&issuer=VeilChat`;
};

// 验证TOTP两步验证码
export function verifyTOTP(token, secret) {
  if (!token || !secret) return false;
  
  // 这里应该实现真正的TOTP验证
  // 简单示例实现，实际项目应使用专门的TOTP库如'otplib'
  try {
    // 简单实现：示例验证码为'123456'
    return token === '123456';
  } catch (error) {
    console.error('TOTP验证错误:', error);
    return false;
  }
}

// 开启两步验证
export const enableTwoFactor = async (userId, secret) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret
    }
  });
  
  return true;
};

// 禁用两步验证
export const disableTwoFactor = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null
    }
  });
  
  return true;
};
