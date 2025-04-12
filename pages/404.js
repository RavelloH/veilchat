import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { LocaleContext } from './_app';
import { translate } from '../lib/i18n';
import React from 'react';

export default function NotFound() {
  const router = useRouter();
  const { data: session } = useSession();
  const { locale } = React.useContext(LocaleContext);
  
  return (
    <div className="min-h-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 className="mt-6 text-2xl font-medium text-gray-900 dark:text-gray-100">
          {translate('error.pageNotFound', locale) || '页面未找到'}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {translate('error.pageNotFoundDesc', locale) || '您正在查找的页面不存在或已被移除。'}
        </p>
        
        <div className="mt-8 space-y-3">
          <Link
            href={session ? '/chat' : '/'}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {session 
              ? translate('chat.returnToChat', locale) || '返回聊天' 
              : translate('home.returnToHome', locale) || '返回首页'}
          </Link>
          
          <button
            onClick={() => router.back()}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {translate('error.goBack', locale) || '返回上一页'}
          </button>
        </div>
      </div>
    </div>
  );
}
