import forge from 'node-forge';
import CryptoJS from 'crypto-js';

// RSA密钥对生成
export const generateKeyPair = () => {
  return new Promise((resolve) => {
    const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    
    const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
    
    resolve({
      publicKey,
      privateKey
    });
  });
};

// 使用密码加密私钥
export const encryptPrivateKey = (privateKey, password) => {
  return CryptoJS.AES.encrypt(privateKey, password).toString();
};

// 使用密码解密私钥
export const decryptPrivateKey = (encryptedPrivateKey, password) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('私钥解密失败', error);
    return null;
  }
};

// 使用接收者的公钥加密消息
export const encryptMessage = (message, receiverPublicKey) => {
  // 生成随机AES密钥用于消息加密
  const aesKey = forge.random.getBytesSync(32);
  const iv = forge.random.getBytesSync(16);
  
  // 加密消息
  const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(message, 'utf8'));
  cipher.finish();
  const encryptedMessage = cipher.output.getBytes();
  
  // 使用接收者公钥加密AES密钥
  const publicKey = forge.pki.publicKeyFromPem(receiverPublicKey);
  const encryptedKey = publicKey.encrypt(aesKey + iv, 'RSA-OAEP');
  
  // 返回加密后的消息和加密的密钥
  return {
    content: forge.util.encode64(encryptedMessage),
    encryptedKey: forge.util.encode64(encryptedKey)
  };
};

// 使用自己的私钥解密消息
export const decryptMessage = (encryptedContent, encryptedKey, privateKeyPem) => {
  try {
    // 解析私钥
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    
    // 解密AES密钥
    const encryptedKeyBytes = forge.util.decode64(encryptedKey);
    const aesKeyWithIv = privateKey.decrypt(encryptedKeyBytes, 'RSA-OAEP');
    
    // 分离AES密钥和IV
    const aesKey = aesKeyWithIv.substring(0, 32);
    const iv = aesKeyWithIv.substring(32);
    
    // 解密消息
    const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(forge.util.decode64(encryptedContent)));
    decipher.finish();
    
    return decipher.output.toString();
  } catch (error) {
    console.error('消息解密失败', error);
    return null;
  }
};

// 群组消息加密（为每个成员加密会话密钥）
export const encryptGroupMessage = (message, membersPublicKeys) => {
  // 生成单一AES密钥加密消息内容
  const aesKey = forge.random.getBytesSync(32);
  const iv = forge.random.getBytesSync(16);
  
  // 使用AES密钥加密消息
  const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(message, 'utf8'));
  cipher.finish();
  const encryptedMessage = cipher.output.getBytes();
  
  // 为每个成员加密AES密钥
  const encryptedKeys = {};
  for (const [userId, publicKeyPem] of Object.entries(membersPublicKeys)) {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const encryptedKey = publicKey.encrypt(aesKey + iv, 'RSA-OAEP');
    encryptedKeys[userId] = forge.util.encode64(encryptedKey);
  }
  
  return {
    content: forge.util.encode64(encryptedMessage),
    encryptedKeys
  };
};

// 验证RSA密钥对
export const verifyKeyPair = (publicKey, privateKey) => {
  try {
    const message = 'test-verification-message';
    
    // 使用公钥加密
    const pubKey = forge.pki.publicKeyFromPem(publicKey);
    const encrypted = pubKey.encrypt(message, 'RSA-OAEP');
    
    // 使用私钥解密
    const privKey = forge.pki.privateKeyFromPem(privateKey);
    const decrypted = privKey.decrypt(encrypted, 'RSA-OAEP');
    
    return message === decrypted;
  } catch (error) {
    console.error('密钥对验证失败', error);
    return false;
  }
};
