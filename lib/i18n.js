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
    
    // 错误和提示
    'error.general': '发生错误',
    'error.network': '网络错误',
    'error.unauthorized': '未授权',
    'error.invalidCredentials': '用户名或密码错误',
    'error.usernameTaken': '用户名已被使用',
    'error.emailTaken': '邮箱已被使用',
    'error.serverError': '服务器错误',
    'success.profileUpdated': '个人资料已更新',
    'success.settingsSaved': '设置已保存'
  },
  'en-US': {
    // General
    'app.name': 'VeilChat',
    'app.tagline': 'Secure, Private Modern Chat Application',
    
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
    
    // Errors and notifications
    'error.general': 'An error occurred',
    'error.network': 'Network error',
    'error.unauthorized': 'Unauthorized',
    'error.invalidCredentials': 'Invalid username or password',
    'error.usernameTaken': 'Username already taken',
    'error.emailTaken': 'Email already in use',
    'error.serverError': 'Server error',
    'success.profileUpdated': 'Profile updated',
    'success.settingsSaved': 'Settings saved'
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
