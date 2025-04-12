import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { LocaleContext } from './_app';
import { translate } from '../lib/i18n';
import React from 'react';

export default function Anonymous() {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { locale } = React.useContext(LocaleContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!displayName) {
      setError(translate('error.emptyFields', locale));
      return;
    }
    
    setLoading(true);
    
    try {
      // 创建匿名用户
      const response = await fetch('/api/anonymous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: displayName
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || translate('error.general', locale));
      }
      
      // 使用创建的匿名用户凭据登录
      const result = await signIn('credentials', {
        username: data.user.username,
        password: data.tempPassword,
        redirect: false
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // 登录成功，跳转到聊天页面
      router.push('/chat');
    } catch (err) {
      console.error('匿名登录错误:', err);
      setError(err.message || translate('error.general', locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-secondary-800 p-8 rounded-xl shadow-md">
        <div>
          <h1 className="text-center text-3xl font-bold text-primary-600 dark:text-primary-300">
            {translate('app.name', locale)}
          </h1>
          <h2 className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-200">
            {translate('auth.anonymous', locale)}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {translate('auth.useAnonymous', locale)}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {translate('auth.enterName', locale)}
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : translate('auth.continueAnonymously', locale)}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-secondary-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-secondary-800 text-gray-500 dark:text-gray-400">
                {translate('auth.orContinueWith', locale) || '或继续使用'}
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/login" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600">
              {translate('auth.signIn', locale)}
            </Link>
            <Link href="/register" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600">
              {translate('auth.signUp', locale)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
