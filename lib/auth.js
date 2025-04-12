import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { prisma } from './db';
import { generateKeyPair, encryptPrivateKey } from './encryption';

// 创建新用户
export const createUser = async (userData, password = null) => {
  // 生成RSA密钥对
  const { publicKey, privateKey } = await generateKeyPair();
  
  // 如果是注册用户，使用密码加密私钥
  // 如果是匿名用户，使用随机生成的密钥加密私钥
  const encryptionKey = password || crypto.randomBytes(32).toString('hex');
  const privateKeyEncrypted = encryptPrivateKey(privateKey, encryptionKey);
  
  const user = await prisma.user.create({
    data: {
      ...userData,
      password: password ? await bcrypt.hash(password, 10) : null,
      publicKey,
      privateKeyEncrypted,
      isAnonymous: !password,
      chatLink: `chat_${uuidv4().replace(/-/g, '')}`
    }
  });
  
  // 对于匿名用户，返回加密私钥的密钥
  return {
    user,
    tempKey: !password ? encryptionKey : undefined
  };
};

// 验证用户凭据
export const verifyCredentials = async (username, password) => {
  const user = await prisma.user.findUnique({
    where: { username }
  });
  
  if (!user || !user.password) return false;
  
  return bcrypt.compare(password, user.password);
};

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

export const verifyTOTP = (token, secret) => {
  // 此处实现TOTP验证逻辑
  // 实际应用中应使用专门的TOTP库
  // 简化示例
  const now = Math.floor(Date.now() / 30000);
  const window = 1; // 允许前后一个时间窗口内的代码
  
  for (let i = -window; i <= window; i++) {
    const time = now + i;
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex'))
      .update(Buffer.from(time.toString().padStart(16, '0'), 'hex'))
      .digest();
    
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = ((hmac[offset] & 0x7f) << 24 |
                  (hmac[offset + 1] & 0xff) << 16 |
                  (hmac[offset + 2] & 0xff) << 8 |
                  (hmac[offset + 3] & 0xff)) % 1000000;
    
    const strCode = code.toString().padStart(6, '0');
    
    if (strCode === token) {
      return true;
    }
  }
  
  return false;
};
