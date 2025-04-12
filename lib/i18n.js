// 支持的语言列表
export const supportedLocales = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en-US', name: 'English' }
];

// 默认语言
export const defaultLocale = 'zh-CN';

// 翻译文本
const translations = {
  'zh-CN': {
    // 通用
    'app.name': 'VeilChat',
    'app.tagline': '安全、私密的现代聊天应用',
    
    // 首页相关
    'home.description': '安全的端到端加密聊天应用，保护您的隐私，提供现代化的聊天体验。',
    'home.getStarted': '开始使用',
    'home.demoMessage1': '你好！欢迎使用VeilChat，这是一个注重隐私和安全的聊天工具。',
    'home.demoMessage2': '嗨！这个应用有端到端加密吗？',
    'home.demoMessage3': '当然！所有消息都使用RSA密钥加密，只有通信双方才能解密消息内容。',
    
    // 页脚
    'footer.privacy': '隐私政策',
    'footer.terms': '使用条款',
    'footer.contact': '联系我们',
    
    // 认证相关
    'auth.signIn': '登录',
    'auth.signUp': '注册',
    'auth.username': '用户名',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.email': '电子邮箱',
    'auth.forgotPassword': '忘记密码？',
    'auth.anonymous': '匿名聊天',
    'auth.useAnonymous': '使用临时匿名账户',
    'auth.enterName': '输入显示名称',
    'auth.continueAnonymously': '继续匿名使用',
    'auth.rememberMe': '记住我',
    'auth.logout': '退出登录',
    'auth.2fa': '两步验证',
    'auth.enter2faCode': '输入两步验证码',
    'auth.setupTwoFactor': '设置两步验证',
    'auth.scanQrCode': '使用身份验证器应用扫描二维码',
    'auth.passwordsDoNotMatch': '密码不匹配',
    'auth.signedInAs': '已登录为',
    'auth.anonymousAccount': '匿名账户',
    'auth.emailOptional': '可选，用于找回密码',
    'auth.orContinueWith': '或继续使用',
    
    // 聊天相关
    'chat.newMessage': '新消息',
    'chat.sendMessage': '发送消息',
    'chat.reply': '回复',
    'chat.delete': '删除',
    'chat.forward': '转发',
    'chat.search': '搜索',
    'chat.noMessages': '还没有消息',
    'chat.startChat': '开始聊天',
    'chat.newChat': '新建聊天',
    'chat.createGroup': '创建群组',
    'chat.addMembers': '添加成员',
    'chat.leaveGroup': '退出群组',
    'chat.deleteChat': '删除聊天',
    'chat.mediaUploading': '媒体上传中...',
    'chat.attachFile': '附加文件',
    'chat.takePicture': '拍照',
    'chat.recordAudio': '录制语音',
    'chat.autoDelete': '自动删除',
    'chat.autoDeleteAfter': '在以下时间后自动删除',
    'chat.superPrivacy': '超级隐私模式',
    'chat.messageSent': '消息已发送',
    'chat.messageFailed': '发送失败',
    'chat.messageDeleted': '消息已删除',
    'chat.you': '你',
    'chat.unknownUser': '未知用户',
    'chat.sentImage': '发送了一张图片',
    'chat.sentAudio': '发送了一段语音',
    'chat.sentFile': '发送了一个文件',
    'chat.encryptedMessage': '加密消息',
    'chat.audioNotSupported': '您的浏览器不支持音频元素。',
    'chat.typing': '正在输入...',
    'chat.online': '在线',
    'chat.offline': '离线',
    'chat.lastSeen': '最后在线',
    'chat.emptyChat': '选择一个聊天或开始新的对话',
    'chat.noSearchResults': '没有找到匹配的聊天',
    'chat.viewProfile': '查看资料',
    'chat.returnToChat': '返回聊天',
    'chat.enterUsername': '输入用户名开始聊天',
    'chat.confirmDelete': '确定要删除此消息吗？',
    'chat.replyTo': '回复',
    'chat.bio': '个人简介',
    'chat.clearHistory': '清除聊天记录',
    'chat.confirmClearHistory': '确定要清除此聊天的所有历史记录吗？此操作不可撤销。',
    'chat.groupName': '群组名称',
    'chat.enterGroupName': '输入群组名称',
    'chat.members': '成员',
    'chat.searchUsers': '搜索用户',
    'chat.userNotFound': '未找到用户',
    'error.emptyGroupName': '请输入群组名称',
    'error.noUsersSelected': '请选择至少一名群组成员',
    
    // 加载和状态
    'loading': '加载中...',
    'error.decryptionFailed': '解密失败',
    'error.emptyFields': '请填写所有字段',
    'error.fileTooBig': '文件太大',
    'error.invalidFileType': '不支持的文件类型',
    'error.connectionLost': '连接丢失',
    'error.pageNotFound': '页面未找到',
    'error.pageNotFoundDesc': '您正在查找的页面不存在或已被移除。',
    'error.goBack': '返回上一页',
    'home.returnToHome': '返回首页',
    
    // 时间
    'time.justNow': '刚刚',
    'time.minutesAgo': '{minutes}分钟前',
    'time.hoursAgo': '{hours}小时前',
    'time.yesterday': '昨天',
    
    // 设置相关
    'settings.title': '设置',
    'settings.profile': '个人资料',
    'settings.account': '账户设置',
    'settings.privacy': '隐私设置',
    'settings.security': '安全设置',
    'settings.notifications': '通知设置',
    'settings.language': '语言',
    'settings.theme': '主题',
    'settings.saveChanges': '保存更改',
    'settings.darkMode': '深色模式',
    'settings.lightMode': '浅色模式',
    'settings.systemTheme': '跟随系统',
    'settings.chatLink': '个人聊天链接',
    'settings.copyLink': '复制链接',
    'settings.linkCopied': '链接已复制',
    'settings.deleteAccount': '删除账户',
    'settings.deleteWarning': '删除账户后，所有数据将永久丢失',
    'settings.autoDeleteAccount': '账户自动删除',
    'settings.autoDeleteDays': '以下天数未登录后删除账户',
    'settings.bio': '个人简介',
    'settings.superPrivacyInfo': '启用后，仅保留最近的聊天记录，旧消息将被自动删除',
    'settings.autoDeleteInfo': '设置为0表示禁用自动删除',
    'settings.confirmDelete': '确认要删除您的账户吗？此操作无法撤销。',
    'settings.confirmDeleteBtn': '确认删除',
    'settings.cancel': '取消',
    
    // 错误和提示
    'error.general': '发生错误',
    'error.network': '网络错误',
    'error.unauthorized': '未授权',
    'error.invalidCredentials': '用户名或密码错误',
    'error.usernameTaken': '用户名已被使用',
    'error.emailTaken': '邮箱已被使用',
    'error.serverError': '服务器错误',
    'success.profileUpdated': '个人资料已更新',
    'success.settingsSaved': '设置已保存',
    
    // 新增和补充
    'chat.searchUsers': '搜索用户...',
    'chat.typeToSearch': '输入至少2个字符开始搜索',
    'chat.noUsersFound': '未找到用户',
    'chat.startChatWith': '与 {name} 开始聊天',
    'chat.createNewChat': '新建聊天',
    'error.searchFailed': '搜索失败'
  },
  'en-US': {
    // General
    'app.name': 'VeilChat',
    'app.tagline': 'Secure, Private Modern Chat Application',
    
    // Home page
    'home.description': 'Secure end-to-end encrypted chat application that protects your privacy with a modern chat experience.',
    'home.getStarted': 'Get Started',
    'home.demoMessage1': 'Hello! Welcome to VeilChat, a messaging tool focused on privacy and security.',
    'home.demoMessage2': 'Hi! Does this app have end-to-end encryption?',
    'home.demoMessage3': 'Absolutely! All messages are encrypted with RSA keys, and only the communicating parties can decrypt the content.',
    
    // Footer
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.contact': 'Contact Us',
    
    // Authentication
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.email': 'Email',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.anonymous': 'Anonymous Chat',
    'auth.useAnonymous': 'Use temporary anonymous account',
    'auth.enterName': 'Enter display name',
    'auth.continueAnonymously': 'Continue Anonymously',
    'auth.rememberMe': 'Remember Me',
    'auth.logout': 'Logout',
    'auth.2fa': 'Two-Factor Authentication',
    'auth.enter2faCode': 'Enter 2FA Code',
    'auth.setupTwoFactor': 'Setup Two-Factor Authentication',
    'auth.scanQrCode': 'Scan QR code with authenticator app',
    'auth.passwordsDoNotMatch': 'Passwords do not match',
    'auth.signedInAs': 'Signed in as',
    'auth.anonymousAccount': 'Anonymous Account',
    'auth.emailOptional': 'Optional, used for password recovery',
    'auth.orContinueWith': 'Or continue with',
    
    // Chat
    'chat.newMessage': 'New Message',
    'chat.sendMessage': 'Send Message',
    'chat.reply': 'Reply',
    'chat.delete': 'Delete',
    'chat.forward': 'Forward',
    'chat.search': 'Search',
    'chat.noMessages': 'No messages yet',
    'chat.startChat': 'Start a Chat',
    'chat.newChat': 'New Chat',
    'chat.createGroup': 'Create Group',
    'chat.addMembers': 'Add Members',
    'chat.leaveGroup': 'Leave Group',
    'chat.deleteChat': 'Delete Chat',
    'chat.mediaUploading': 'Uploading media...',
    'chat.attachFile': 'Attach File',
    'chat.takePicture': 'Take Picture',
    'chat.recordAudio': 'Record Audio',
    'chat.autoDelete': 'Auto Delete',
    'chat.autoDeleteAfter': 'Auto delete after',
    'chat.superPrivacy': 'Super Privacy Mode',
    'chat.messageSent': 'Message sent',
    'chat.messageFailed': 'Failed to send',
    'chat.messageDeleted': 'Message deleted',
    'chat.you': 'You',
    'chat.unknownUser': 'Unknown User',
    'chat.sentImage': 'Sent an image',
    'chat.sentAudio': 'Sent a voice message',
    'chat.sentFile': 'Sent a file',
    'chat.encryptedMessage': 'Encrypted message',
    'chat.audioNotSupported': 'Your browser does not support the audio element.',
    'chat.typing': 'typing...',
    'chat.online': 'Online',
    'chat.offline': 'Offline',
    'chat.lastSeen': 'Last seen',
    'chat.emptyChat': 'Select a chat or start a new conversation',
    'chat.noSearchResults': 'No matching chats found',
    'chat.viewProfile': 'View Profile',
    'chat.returnToChat': 'Return to Chat',
    'chat.enterUsername': 'Enter username to start a chat',
    'chat.confirmDelete': 'Are you sure you want to delete this message?',
    'chat.replyTo': 'Reply to',
    'chat.bio': 'Bio',
    'chat.clearHistory': 'Clear Chat History',
    'chat.confirmClearHistory': 'Are you sure you want to clear all chat history? This action cannot be undone.',
    'chat.groupName': 'Group Name',
    'chat.enterGroupName': 'Enter group name',
    'chat.members': 'Members',
    'chat.searchUsers': 'Search users',
    'chat.userNotFound': 'User not found',
    'error.emptyGroupName': 'Please enter a group name',
    'error.noUsersSelected': 'Please select at least one member',
    
    // Loading and status
    'loading': 'Loading...',
    'error.decryptionFailed': 'Decryption failed',
    'error.emptyFields': 'Please fill in all fields',
    'error.fileTooBig': 'File is too large',
    'error.invalidFileType': 'Unsupported file type',
    'error.connectionLost': 'Connection lost',
    'error.pageNotFound': 'Page Not Found',
    'error.pageNotFoundDesc': 'The page you are looking for does not exist or has been removed.',
    'error.goBack': 'Go Back',
    'home.returnToHome': 'Return to Home',
    
    // Time
    'time.justNow': 'Just now',
    'time.minutesAgo': '{minutes} minutes ago',
    'time.hoursAgo': '{hours} hours ago',
    'time.yesterday': 'Yesterday',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.account': 'Account',
    'settings.privacy': 'Privacy',
    'settings.security': 'Security',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.saveChanges': 'Save Changes',
    'settings.darkMode': 'Dark Mode',
    'settings.lightMode': 'Light Mode',
    'settings.systemTheme': 'System Theme',
    'settings.chatLink': 'Personal Chat Link',
    'settings.copyLink': 'Copy Link',
    'settings.linkCopied': 'Link copied',
    'settings.deleteAccount': 'Delete Account',
    'settings.deleteWarning': 'After deleting your account, all data will be permanently lost',
    'settings.autoDeleteAccount': 'Auto Delete Account',
    'settings.autoDeleteDays': 'Delete account after not logging in for',
    'settings.bio': 'Bio',
    'settings.superPrivacyInfo': 'When enabled, only recent chat history will be kept, older messages will be automatically deleted',
    'settings.autoDeleteInfo': 'Set to 0 to disable auto-delete',
    'settings.confirmDelete': 'Are you sure you want to delete your account? This action cannot be undone.',
    'settings.confirmDeleteBtn': 'Confirm Delete',
    'settings.cancel': 'Cancel',
    
    // Errors and notifications
    'error.general': 'An error occurred',
    'error.network': 'Network error',
    'error.unauthorized': 'Unauthorized',
    'error.invalidCredentials': 'Invalid username or password',
    'error.usernameTaken': 'Username already taken',
    'error.emailTaken': 'Email already in use',
    'error.serverError': 'Server error',
    'success.profileUpdated': 'Profile updated',
    'success.settingsSaved': 'Settings saved',
    
    // 新增和补充
    'chat.searchUsers': 'Search users...',
    'chat.typeToSearch': 'Type at least 2 characters to search',
    'chat.noUsersFound': 'No users found',
    'chat.startChatWith': 'Start chatting with {name}',
    'chat.createNewChat': 'Create new chat',
    'error.searchFailed': 'Search failed'
  }
};

// 获取翻译文本
export const translate = (key, locale = defaultLocale) => {
  const currentLocale = supportedLocales.find(l => l.code === locale) 
    ? locale 
    : defaultLocale;
    
  return translations[currentLocale][key] || key;
};

// 获取用户首选语言
export const getUserPreferredLocale = () => {
  // 检查客户端 localStorage
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('userLocale');
    if (savedLocale && supportedLocales.find(l => l.code === savedLocale)) {
      return savedLocale;
    }
    
    // 尝试匹配浏览器语言
    const browserLocale = navigator.language;
    const matchedLocale = supportedLocales.find(l => 
      browserLocale.startsWith(l.code.split('-')[0])
    );
    
    if (matchedLocale) {
      return matchedLocale.code;
    }
  }
  
  return defaultLocale;
};

// 保存用户语言偏好
export const saveUserLocale = (locale) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userLocale', locale);
  }
};
