import { useState, useEffect, createContext } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import { getUserPreferredLocale } from '../lib/i18n';
import '../styles/globals.css';
import React from 'react';
import ThemeDetector from '../components/ThemeDetector';

// 加载字体
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// 创建语言上下文
export const LocaleContext = createContext({
  locale: 'zh-CN',
  setLocale: () => {},
});

// 创建主题上下文
export const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => {},
});

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [locale, setLocale] = useState('zh-CN');
  const [theme, setTheme] = useState('system');
  const [appHeight, setAppHeight] = useState('100%');
  
  // 初始化用户语言
  useEffect(() => {
    const userLocale = getUserPreferredLocale();
    setLocale(userLocale);
  }, []);

  // 初始化主题
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'system';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  // 应用主题
  const applyTheme = (newTheme) => {
    if (typeof window === 'undefined') return;
    
    if (newTheme === 'dark' || 
        (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // 处理移动设备高度问题
  useEffect(() => {
    const setDocHeight = () => {
      const doc = document.documentElement;
      setAppHeight(`${window.innerHeight}px`);
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    window.addEventListener('resize', setDocHeight);
    window.addEventListener('orientationchange', setDocHeight);
    setDocHeight();
    
    return () => {
      window.removeEventListener('resize', setDocHeight);
      window.removeEventListener('orientationchange', setDocHeight);
    };
  }, []);
  
  return (
    <SessionProvider session={session}>
      <ThemeContext.Provider value={{ theme, setTheme, applyTheme }}>
        <LocaleContext.Provider value={{ locale, setLocale }}>
          <main className={`${inter.variable} font-sans`} style={{ height: appHeight }}>
            {typeof window !== 'undefined' && <ThemeDetector />}
            <Component {...pageProps} />
          </main>
        </LocaleContext.Provider>
      </ThemeContext.Provider>
    </SessionProvider>
  );
}
