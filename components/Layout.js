import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { LocaleContext, ThemeContext } from '../pages/_app';
import { translate, supportedLocales, saveUserLocale } from '../lib/i18n';

export default function Layout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale } = React.useContext(LocaleContext);
  const { theme, setTheme, applyTheme } = React.useContext(ThemeContext);
  
  // 切换主题
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    setMenuOpen(false);
  };
  
  // 切换语言
  const changeLanguage = (newLocale) => {
    setLocale(newLocale);
    saveUserLocale(newLocale);
    setMenuOpen(false);
  };
  
  // 处理登出
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };
  
  // 计算活动页面
  const isActive = (path) => router.pathname === path;
  
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-secondary-900">
      <Head>
        <title>{translate('app.name', locale)}</title>
        <meta name="description" content={translate('app.tagline', locale)} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#5d7396" />
        
        {/* PWA 支持 */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </Head>
      
      {status === 'authenticated' ? (
        <>
          {/* 顶部导航栏 */}
          <header className="bg-white dark:bg-secondary-800 border-b border-gray-200 dark:border-secondary-700">
            <div className="flex justify-between items-center px-4 py-2">
              <div className="flex items-center">
                <Link href="/" className="font-bold text-primary-600 dark:text-primary-400 text-lg">
                  {translate('app.name', locale)}
                </Link>
              </div>
              
              <div className="flex items-center">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-secondary-700"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
                    {session.user.name?.charAt(0) || session.user.username?.charAt(0) || '?'}
                  </div>
                  <span className="hidden md:inline text-gray-700 dark:text-gray-300">
                    {session.user.name || session.user.username}
                  </span>
                </button>
                
                {menuOpen && (
                  <div className="absolute top-14 right-4 z-10 w-56 rounded-md shadow-lg bg-white dark:bg-secondary-800 ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-secondary-700">
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {translate('auth.signedInAs', locale) || '已登录为'}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {session.user.name || session.user.username}
                      </p>
                      {session.user.isAnonymous && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                          {translate('auth.anonymousAccount', locale) || '匿名账户'}
                        </p>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link
                        href="/settings"
                        className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {translate('settings.title', locale)}
                      </Link>
                    </div>
                    
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {translate('settings.theme', locale)}
                      </div>
                      <button
                        onClick={() => toggleTheme('light')}
                        className={`group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary-700 ${theme === 'light' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {translate('settings.lightMode', locale)}
                      </button>
                      <button
                        onClick={() => toggleTheme('dark')}
                        className={`group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary-700 ${theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        {translate('settings.darkMode', locale)}
                      </button>
                      <button
                        onClick={() => toggleTheme('system')}
                        className={`group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary-700 ${theme === 'system' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {translate('settings.systemTheme', locale)}
                      </button>
                    </div>
                    
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {translate('settings.language', locale)}
                      </div>
                      {supportedLocales.map((supportedLocale) => (
                        <button
                          key={supportedLocale.code}
                          onClick={() => changeLanguage(supportedLocale.code)}
                          className={`group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-secondary-700 ${locale === supportedLocale.code ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          {supportedLocale.name}
                        </button>
                      ))}
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {translate('auth.logout', locale)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
          
          {/* 主内容区域 */}
          <main className="flex-grow overflow-hidden">{children}</main>
        </>
      ) : status === 'loading' ? (
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        // 未登录时直接显示内容
        <main className="flex-grow">{children}</main>
      )}
    </div>
  );
}