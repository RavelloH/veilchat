import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { translate } from '../lib/i18n';

export default function ContextMenu({ 
  items, 
  isOpen, 
  position, 
  onClose, 
  className = '' 
}) {
  const menuRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  
  // 等待客户端渲染完成
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // 菜单关闭处理
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('scroll', onClose);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', onClose);
    };
  }, [isOpen, onClose]);
  
  // 确保菜单在视窗内显示
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    
    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let { x, y } = position;
    
    // 检查是否超出右侧边界
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 5;
    }
    
    // 检查是否超出底部边界
    if (y + rect.height > viewportHeight) {
      y = viewportHeight - rect.height - 5;
    }
    
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }, [isOpen, position]);
  
  if (!mounted || !isOpen) return null;
  
  return createPortal(
    <div 
      ref={menuRef}
      className={`fixed z-50 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-lg shadow-lg overflow-hidden scale-in ${className}`}
      style={{ left: position.x, top: position.y }}
    >
      <ul className="py-1">
        {items.map((item, index) => (
          <li key={index}>
            {item.divider ? (
              <div className="h-px my-1 bg-gray-200 dark:bg-secondary-700"></div>
            ) : (
              <button
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-secondary-700 transition-colors ${
                  item.disabled 
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                    : item.danger 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.icon && (
                  <span className="mr-2">{item.icon}</span>
                )}
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
}
