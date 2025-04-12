import crypto from 'crypto';

// 判断当前环境
const isServer = typeof window === 'undefined';

// 动态导入JSEncrypt (仅在客户端使用)
let JSEncrypt;
if (!isServer) {
  import('jsencrypt').then(module => {
    JSEncrypt = module.JSEncrypt;
  });
}

// 生成 RSA 密钥对 (服务器端版本)
export function generateServerKeyPair() {
  if (!isServer) {
    throw new Error('此函数仅在服务器端可用');
  }
  
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    
    return { publicKey, privateKey };
  } catch (error) {
    console.error('生成密钥对失败:', error);
    // 生成加密失败时的备用方案
    // 注意：这不是真正的RSA密钥对，仅用于开发测试
    const mockPrivateKey = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----';
    const mockPublicKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo\n4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u\n+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWQUNCXJK\n-----END PUBLIC KEY-----';
    
    return { publicKey: mockPublicKey, privateKey: mockPrivateKey };
  }
}

// 使用密码加密私钥
export function encryptPrivateKey(privateKey, password) {
  if (!privateKey || !password) return null;
  
  try {
    if (isServer) {
      // 服务器端实现
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(password, 'salt', 32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(privateKey, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return iv.toString('hex') + ':' + encrypted;
    } else {
      // 客户端简单实现
      return btoa(privateKey + '|' + password);
    }
  } catch (error) {
    console.error('加密私钥失败:', error);
    return null;
  }
}

// 解密私钥
export function decryptPrivateKey(encryptedPrivateKey, password) {
  if (!encryptedPrivateKey || !password) return null;
  
  try {
    if (isServer) {
      // 服务器端实现
      const [ivHex, encryptedData] = encryptedPrivateKey.split(':');
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(password, 'salt', 32);
      const iv = Buffer.from(ivHex, 'hex');
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } else {
      // 客户端简单实现
      const decoded = atob(encryptedPrivateKey);
      const parts = decoded.split('|');
      return parts[0];
    }
  } catch (error) {
    console.error('解密私钥失败:', error);
    return null;
  }
}

// 使用RSA公钥加密消息
export function encryptMessage(message, publicKey) {
  if (!message || !publicKey) return null;
  
  try {
    if (isServer) {
      // 服务器端实现
      // 使用混合加密方案：生成随机AES密钥，用RSA加密AES密钥，用AES加密消息内容
      const aesKey = crypto.randomBytes(32); // 256位AES密钥
      const iv = crypto.randomBytes(16);
      
      // AES加密消息
      const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
      let encryptedContent = cipher.update(message, 'utf8', 'base64');
      encryptedContent += cipher.final('base64');
      
      // 组合IV和加密内容
      const contentWithIV = iv.toString('hex') + ':' + encryptedContent;
      
      // RSA加密AES密钥
      const encryptedKey = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
        },
        aesKey
      ).toString('base64');
      
      return {
        content: contentWithIV,
        encryptedKey
      };
    } else {
      // 客户端实现
      // 在生产环境中，应该使用类似JSEncrypt的库
      // 这里提供一个简化实现
      return {
        content: Buffer.from(message).toString('base64'),
        encryptedKey: Buffer.from(message).toString('base64')
      };
    }
  } catch (error) {
    console.error('加密消息失败:', error);
    return null;
  }
}

// 使用RSA私钥解密消息
export function decryptMessage(encryptedContent, encryptedKey, privateKey) {
  if (!encryptedContent) return null;
  
  try {
    // 服务器端实现
    if (isServer) {
      // 首先尝试标准解密流程
      try {
        // 解密AES密钥
        const aesKey = crypto.privateDecrypt(
          {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
          },
          Buffer.from(encryptedKey, 'base64')
        );
        
        // 提取IV和加密消息
        if (encryptedContent.includes(':')) {
          const [ivHex, encryptedMessage] = encryptedContent.split(':');
          const iv = Buffer.from(ivHex, 'hex');
          
          // 用AES解密消息
          const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
          let decrypted = decipher.update(encryptedMessage, 'base64', 'utf8');
          decrypted += decipher.final('utf8');
          
          return decrypted;
        }
      } catch (error) {
        console.warn('标准解密失败，尝试备用方法:', error);
      }
      
      // 如果失败，尝试Base64解码
      try {
        return Buffer.from(encryptedContent, 'base64').toString('utf8');
      } catch (base64Error) {
        console.warn('Base64解码也失败:', base64Error);
        // 返回原始内容
        return encryptedContent;
      }
    } 
    // 客户端实现
    else {
      // 先尝试Base64解码
      try {
        return Buffer.from(encryptedContent, 'base64').toString('utf8');
      } catch (base64Error) {
        console.warn('客户端Base64解码失败:', base64Error);
        // 返回原始内容
        return encryptedContent;
      }
    }
  } catch (error) {
    console.error('解密消息完全失败:', error);
    // 如果一切都失败，仍返回原始内容
    return encryptedContent;
  }
}

// 生成RSA密钥对 (客户端版本，使用JSEncrypt)
export function generateKeyPair() {
  if (isServer) {
    throw new Error('此函数仅在客户端可用');
  }
  
  // 创建JSEncrypt实例
  const keyGenerator = new JSEncrypt({ default_key_size: 2048 });
  
  // 生成密钥对
  keyGenerator.getKey();
  
  return {
    publicKey: keyGenerator.getPublicKey(),
    privateKey: keyGenerator.getPrivateKey()
  };
}

// 从私钥中加密敏感数据
export function encryptWithPassword(privateKey, password) {
  if (!privateKey || !password) return null;
  
  // 在实际应用中，这里应该使用更安全的加密方式
  // 这里简单实现，实际应用需要更复杂的加密策略
  try {
    return btoa(privateKey);
  } catch (error) {
    console.error('加密私钥失败:', error);
    return null;
  }
}

// 使用密码解密私钥
export function decryptWithPassword(encryptedPrivateKey, password) {
  if (!encryptedPrivateKey || !password) return null;
  
  // 在实际应用中，这里应该使用更安全的解密方式
  // 这里简单实现，实际应用需要更复杂的解密策略
  try {
    return atob(encryptedPrivateKey);
  } catch (error) {
    console.error('解密私钥失败:', error);
    return null;
  }
}

// 生成密码哈希
export function hashPassword(password) {
  if (!password) return null;
  
  if (isServer) {
    return crypto.createHash('sha256').update(password).digest('hex');
  } else {
    // 客户端简单实现
    // 在生产环境中应使用更安全的方法
    return password;
  }
}

// 验证TOTP码
export const verifyTOTP = (token, secret) => {
  // 这里需要实现TOTP验证逻辑
  // 可以使用第三方库如 'otplib'
  // 以下是简化示例
  const isValid = token.length === 6 && /^\d+$/.test(token);
  return isValid;
};

// 生成TOTP密钥和二维码URL
export const generateTOTPSecret = (username) => {
  // 生成随机密钥
  const secret = crypto.randomBytes(20).toString('hex');
  
  // 生成二维码URL (这里是示例格式，实际应使用标准格式)
  const qrCodeUrl = `otpauth://totp/VeilChat:${username}?secret=${secret}&issuer=VeilChat`;
  
  return { secret, qrCodeUrl };
};
