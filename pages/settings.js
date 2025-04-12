import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { LocaleContext } from './_app';
import { translate, supportedLocales, saveUserLocale } from '../lib/i18n';
import Layout from '../components/Layout';
import React from 'react';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale, setLocale } = React.useContext(LocaleContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [autoDeleteDays, setAutoDeleteDays] = useState(0);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [superPrivacyGlobal, setSuperPrivacyGlobal] = useState(false);
  const [personalChatLink, setPersonalChatLink] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // 获取用户设置
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // 设置初始表单值
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      
      // 加载用户设置和资料
      fetchUserProfile();
      
      // 获取主题设置
      const savedTheme = localStorage.getItem('theme') || 'system';
      setSelectedTheme(savedTheme);
      
      // 获取语言设置
      setSelectedLocale(locale);
    }
  }, [status, router, session, locale]);
  
  // 获取用户个人资料和设置
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (response.ok) {
        setBio(data.user.bio || '');
        setTwoFactorEnabled(data.user.twoFactorEnabled || false);
        setSuperPrivacyGlobal(data.user.superPrivacyGlobal || false);
        setAutoDeleteDays(data.user.autoDeleteDays || 0);
        setPersonalChatLink(data.user.personalChatLink || '');
      }
    } catch (error) {
      console.error('获取个人资料失败:', error);
    }
  };
  
  // 更新个人资料
  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          bio,
          email: email || undefined
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: translate('success.profileUpdated', locale) });
      } else {
        setMessage({ type: 'error', text: data.error || translate('error.general', locale) });
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      setMessage({ type: 'error', text: translate('error.network', locale) });
    } finally {
      setLoading(false);
    }
  };
  
  // 更新安全设置
  const updateSecuritySettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/user/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          twoFactorEnabled,
          autoDeleteDays: autoDeleteDays > 0 ? autoDeleteDays : null
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: translate('success.settingsSaved', locale) });
      } else {
        setMessage({ type: 'error', text: data.error || translate('error.general', locale) });
      }
    } catch (error) {
      console.error('更新安全设置失败:', error);
      setMessage({ type: 'error', text: translate('error.network', locale) });
    } finally {
      setLoading(false);
    }
  };
  
  // 更新隐私设置
  const updatePrivacySettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          superPrivacyGlobal
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: translate('success.settingsSaved', locale) });
      } else {
        setMessage({ type: 'error', text: data.error || translate('error.general', locale) });
      }
    } catch (error) {
      console.error('更新隐私设置失败:', error);
      setMessage({ type: 'error', text: translate('error.network', locale) });
    } finally {
      setLoading(false);
    }
  };
  
  // 更新应用设置
  const updateAppSettings = () => {
    // 更新主题
    localStorage.setItem('theme', selectedTheme);
    document.documentElement.classList.toggle('dark', 
      selectedTheme === 'dark' || 
      (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
    
    // 更新语言
    if (selectedLocale !== locale) {
      setLocale(selectedLocale);
      saveUserLocale(selectedLocale);
    }
    
    setMessage({ type: 'success', text: translate('success.settingsSaved', locale) });
  };
  
  // 复制个人聊天链接
  const copyPersonalLink = () => {
    const linkUrl = `${window.location.origin}/chat/u/${personalChatLink}`;
    navigator.clipboard.writeText(linkUrl);
    setMessage({ type: 'success', text: translate('settings.linkCopied', locale) });
  };
  
  // 删除账户
  const deleteAccount = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/user', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // 删除成功，退出登录并跳转到首页
        router.push('/logout');
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || translate('error.general', locale) });
      }
    } catch (error) {
      console.error('删除账户失败:', error);
      setMessage({ type: 'error', text: translate('error.network', locale) });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {translate('settings.title', locale)}
        </h1>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* 侧边栏 */}
          <div className="md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'profile'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {translate('settings.profile', locale)}
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'security'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {translate('settings.security', locale)}
              </button>
              
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'privacy'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                {translate('settings.privacy', locale)}
              </button>
              
              <button
                onClick={() => setActiveTab('app')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'app'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {translate('settings.account', locale)}
              </button>
            </nav>
          </div>
          
          {/* 主要内容 */}
          <div className="flex-1 bg-white dark:bg-secondary-800 rounded-lg shadow overflow-hidden">
            {/* 个人资料 */}
            {activeTab === 'profile' && (
              <form onSubmit={updateProfile} className="p-6 space-y-6">
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  {translate('settings.profile', locale)}
                </h2>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('auth.username', locale)}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="username"
                      value={session?.user?.username || ''}
                      disabled
                      className="bg-gray-100 dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm py-2 px-3 block w-full text-gray-500 dark:text-gray-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('auth.enterName', locale)}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm py-2 px-3 block w-full focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('auth.email', locale)}
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm py-2 px-3 block w-full focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {translate('auth.emailOptional', locale) || '可选，用于找回密码'}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {translate('settings.bio', locale) || '个人简介'}
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm py-2 px-3 block w-full focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : translate('settings.saveChanges', locale)}
                  </button>
                </div>
              </form>
            )}
            
            {/* 安全设置 */}
            {activeTab === 'security' && (
              <form onSubmit={updateSecuritySettings} className="p-6 space-y-6">
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  {translate('settings.security', locale)}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {translate('auth.2fa', locale)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {translate('auth.setupTwoFactor', locale)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-secondary-700'
                      }`}
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                        twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translate('settings.autoDeleteAccount', locale)}
                    </h3>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        value={autoDeleteDays}
                        onChange={(e) => setAutoDeleteDays(parseInt(e.target.value) || 0)}
                        className="bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm py-2 px-3 w-24 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {translate('settings.autoDeleteDays', locale)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {translate('settings.autoDeleteInfo', locale) || '设置为0表示禁用自动删除'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : translate('settings.saveChanges', locale)}
                  </button>
                </div>
              </form>
            )}
            
            {/* 隐私设置 */}
            {activeTab === 'privacy' && (
              <form onSubmit={updatePrivacySettings} className="p-6 space-y-6">
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  {translate('settings.privacy', locale)}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {translate('chat.superPrivacy', locale)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {translate('settings.superPrivacyInfo', locale) || '启用后，仅保留最近的聊天记录，旧消息将被自动删除'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        superPrivacyGlobal ? 'bg-primary-600' : 'bg-gray-200 dark:bg-secondary-700'
                      }`}
                      onClick={() => setSuperPrivacyGlobal(!superPrivacyGlobal)}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                        superPrivacyGlobal ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translate('settings.chatLink', locale)}
                    </h3>
                    <div className="flex items-center">
                      <div className="flex-grow flex items-center border border-gray-300 dark:border-secondary-600 rounded-md bg-gray-50 dark:bg-secondary-700">
                        <span className="pl-3 text-gray-500 dark:text-gray-400">
                          {window?.location.origin}/chat/u/
                        </span>
                        <input
                          type="text"
                          value={personalChatLink}
                          readOnly
                          className="flex-grow py-2 px-1 bg-transparent border-0 focus:outline-none focus:ring-0"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={copyPersonalLink}
                        className="ml-2 p-2 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : translate('settings.saveChanges', locale)}
                  </button>
                </div>
              </form>
            )}
            
            {/* 应用设置 */}
            {activeTab === 'app' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
                  {translate('settings.account', locale)}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translate('settings.theme', locale)}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="theme-light"
                          name="theme"
                          type="radio"
                          checked={selectedTheme === 'light'}
                          onChange={() => setSelectedTheme('light')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="theme-light" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {translate('settings.lightMode', locale)}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="theme-dark"
                          name="theme"
                          type="radio"
                          checked={selectedTheme === 'dark'}
                          onChange={() => setSelectedTheme('dark')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="theme-dark" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {translate('settings.darkMode', locale)}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="theme-system"
                          name="theme"
                          type="radio"
                          checked={selectedTheme === 'system'}
                          onChange={() => setSelectedTheme('system')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="theme-system" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {translate('settings.systemTheme', locale)}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {translate('settings.language', locale)}
                    </h3>
                    <div className="space-y-2">
                      {supportedLocales.map((l) => (
                        <div key={l.code} className="flex items-center">
                          <input
                            id={`lang-${l.code}`}
                            name="language"
                            type="radio"
                            checked={selectedLocale === l.code}
                            onChange={() => setSelectedLocale(l.code)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <label htmlFor={`lang-${l.code}`} className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                            {l.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-secondary-700 pt-4">
                    <button
                      type="button"
                      onClick={updateAppSettings}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {translate('settings.saveChanges', locale)}
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-secondary-700 pt-6">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      {translate('settings.deleteAccount', locale)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {translate('settings.deleteWarning', locale)}
                    </p>
                    
                    {showConfirmDelete ? (
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4 font-medium">
                          {translate('settings.confirmDelete', locale) || '确认要删除您的账户吗？此操作无法撤销。'}
                        </p>
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={deleteAccount}
                            disabled={loading}
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70"
                          >
                            {loading ? (
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : translate('settings.confirmDeleteBtn', locale) || '确认删除'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowConfirmDelete(false)}
                            className="py-2 px-4 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            {translate('settings.cancel', locale) || '取消'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={deleteAccount}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {translate('settings.deleteAccount', locale)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
