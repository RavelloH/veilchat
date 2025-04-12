import { useContext, useEffect } from 'react';
import { ThemeContext } from '../pages/_app';
import React from 'react';

export default function ThemeDetector() {
  const { theme, applyTheme } = useContext(ThemeContext);
  
  useEffect(() => {
    if (theme !== 'system') return;
    
    // 监听系统主题变化
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      applyTheme('system');
    };
    
    // 为了兼容性，检查addEventListener是否存在
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleChange);
      return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    } else {
      // 旧版浏览器支持
      darkModeMediaQuery.addListener(handleChange);
      return () => darkModeMediaQuery.removeListener(handleChange);
    }
  }, [theme, applyTheme]);
  
  return null; // 这是一个不渲染任何UI的组件
}
