import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { LocaleContext } from './_app';
import { translate } from '../lib/i18n';
import React from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = React.useContext(LocaleContext);
  const [loading, setLoading] = useState(true);

  // 如果用户已登录，直接跳转到聊天页面
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat');
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 mx-auto mb-4 rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-300">{translate('loading', locale)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-secondary-950">
      <header className="p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
            {translate('app.name', locale)}
          </h1>
          <div className="space-x-2">
            <Link href="/login" className="px-4 py-2 rounded-lg bg-white text-primary-600 shadow-sm hover:shadow-md transition dark:bg-secondary-800 dark:text-primary-300">
              {translate('auth.signIn', locale)}
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-lg bg-primary-600 text-white shadow-sm hover:shadow-md transition dark:bg-primary-700">
              {translate('auth.signUp', locale)}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-10 md:mb-0 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-800 dark:text-primary-200 mb-6">
            {translate('app.tagline', locale)}
          </h2>
          <p className="text-lg md:text-xl text-secondary-700 dark:text-secondary-300 mb-8 max-w-lg">
            {translate('home.description', locale) || '安全的端到端加密聊天应用，保护您的隐私，提供现代化的聊天体验。'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="px-8 py-3 rounded-xl bg-primary-600 text-white font-medium shadow-md hover:bg-primary-700 transition">
              {translate('home.getStarted', locale) || '开始使用'}
            </Link>
            <Link href="/anonymous" className="px-8 py-3 rounded-xl bg-white text-primary-600 font-medium shadow-md hover:bg-gray-50 transition dark:bg-secondary-800 dark:text-primary-300 dark:hover:bg-secondary-700">
              {translate('auth.anonymous', locale)}
            </Link>
          </div>
        </div>
        
        <div className="md:w-1/2 slide-up">
          <div className="relative h-[500px] w-full max-w-md mx-auto">
            <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl transform -rotate-6 z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-primary-100 dark:bg-secondary-900 rounded-3xl shadow-2xl transform rotate-3 z-10"></div>
            <div className="relative z-20 bg-white dark:bg-secondary-800 rounded-3xl shadow-xl overflow-hidden h-full">
              <div className="h-14 bg-primary-600 dark:bg-primary-700 flex items-center px-4">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="mx-auto text-white font-medium">VeilChat</div>
              </div>
              <div className="p-4 h-[calc(100%-3.5rem)] flex flex-col">
                <div className="flex-grow overflow-y-auto scrollbar-hide space-y-4 p-2">
                  <div className="message-bubble bg-gray-100 dark:bg-secondary-700 p-3 rounded-lg rounded-tl-none">
                    {translate('home.demoMessage1', locale) || '你好！欢迎使用VeilChat，这是一个注重隐私和安全的聊天工具。'}
                  </div>
                  <div className="message-bubble bg-primary-100 dark:bg-primary-800 p-3 rounded-lg rounded-tr-none ml-auto">
                    {translate('home.demoMessage2', locale) || '嗨！这个应用有端到端加密吗？'}
                  </div>
                  <div className="message-bubble bg-gray-100 dark:bg-secondary-700 p-3 rounded-lg rounded-tl-none">
                    {translate('home.demoMessage3', locale) || '当然！所有消息都使用RSA密钥加密，只有通信双方才能解密消息内容。'}
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <input
                    type="text"
                    placeholder={translate('chat.newMessage', locale)}
                    className="flex-grow py-2 px-4 bg-gray-100 dark:bg-secondary-700 rounded-full focus:outline-none"
                    readOnly
                  />
                  <button className="ml-2 w-10 h-10 rounded-full bg-primary-500 dark:bg-primary-600 text-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 bg-white dark:bg-secondary-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-secondary-600 dark:text-secondary-400">
                &copy; {new Date().getFullYear()} VeilChat | <a href="https://github.com/RavelloH/veilchat" className="text-primary-600 dark:text-primary-400 hover:underline">GitHub</a>
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400">
                {translate('footer.privacy', locale) || '隐私政策'}
              </a>
              <a href="#" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400">
                {translate('footer.terms', locale) || '使用条款'}
              </a>
              <a href="#" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400">
                {translate('footer.contact', locale) || '联系我们'}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
