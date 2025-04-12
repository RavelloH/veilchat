import '../styles/globals.css';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { getUserPreferredLocale } from '../lib/i18n';

// 主题上下文
export const ThemeContext = React.createContext({
  theme: 'system',
  setTheme: () => {}
});

// 语言上下文
export const LocaleContext = React.createContext({
  locale: 'zh-CN',
  setLocale: () => {}
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [theme, setTheme] = useState('system');
  const [locale, setLocale] = useState('zh-CN');
  
  // 初始化主题和语言设置
  useEffect(() => {
    // 获取保存的主题
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    
    // 应用主题
    if (savedTheme === 'dark' || 
        (savedTheme === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (savedTheme === 'system') {
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // 获取用户语言偏好
    setLocale(getUserPreferredLocale());
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // 监听主题变化
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);
  
  return (
    <SessionProvider session={session}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <LocaleContext.Provider value={{ locale, setLocale }}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            <meta name="description" content="VeilChat - 安全、私密的现代聊天应用" />
            <meta name="theme-color" content="#172b56" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />
            <title>VeilChat</title>
          </Head>
          <Component {...pageProps} />
        </LocaleContext.Provider>
      </ThemeContext.Provider>
    </SessionProvider>
  );
}

export default MyApp;
