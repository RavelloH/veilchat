# VeilChat - 安全、私密的现代聊天应用

VeilChat是一个开源的端到端加密聊天应用，注重用户隐私和安全性，同时提供现代化的用户体验。

## 核心特性

### 🔒 端到端加密
- 基于RSA公私钥机制的强大加密
- 只有通信双方持有解密密钥
- 即使数据库泄露，消息内容也无法被解密

### 🕶️ 隐私保护
- 超级隐私模式：仅保留最近聊天记录
- TOTP双重验证加强账户安全
- 服务器不记录任何用户信息，包括IP地址
- 消息自动销毁机制

### 👤 账户灵活性
- 支持注册永久账户
- 支持临时匿名账户
- 多设备同步支持

### 💬 现代化聊天功能
- 私聊和群组聊天
- 多媒体支持：图片、文件和语音消息
- 消息回复和搜索功能
- 自定义私聊链接

### 📱 现代化设计
- 响应式设计，完美支持移动设备
- PWA支持，实现桌面应用体验
- 暗色/亮色主题自动适配
- 多语言支持

## 技术栈

- **前端**：Next.js + Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：PostgreSQL/MySQL (通过Prisma ORM)
- **实时通信**：WebSocket (在不支持WebSocket的环境下自动切换至轮询)
- **加密**：RSA密钥加密系统

## 部署流程

1. **克隆仓库**：
   ```
   git clone https://github.com/RavelloH/veilchat.git
   cd veilchat
   ```

2. **安装依赖**：
   ```
   npm install
   ```

3. **配置环境变量**：
   创建`.env`文件并设置以下变量：
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/veilchat"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **初始化数据库**：
   ```
   npx prisma migrate dev --name init
   ```

5. **启动开发服务器**：
   ```
   npm run dev
   ```

6. **生产环境部署**：
   - 部署至Vercel：[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRavelloH%2Fveilchat)
   - 确保在Vercel项目设置中配置必要的环境变量

## 隐私声明

VeilChat设计理念是保护用户隐私和数据安全：
- 所有聊天内容通过端到端加密保护
- 服务器不存储任何用户身份信息
- 媒体文件在7天后自动从服务器删除
- 用户可以随时彻底删除自己的数据

## 贡献

欢迎提交问题和贡献代码，共同改进VeilChat！

## 许可证

[MIT License](LICENSE)
