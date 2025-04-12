import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatRelativeTime } from '../lib/dateUtils';
import { motion, AnimatePresence } from 'framer-motion'; // 添加动画库

export default function ChatItem({ 
  chat, 
  isActive, 
  onClick, 
  locale,
  unreadCount = 0 // 新增：未读消息数量参数
}) {
  const chatName = chat.name || 'Unknown';
  const lastMessageTime = chat.lastMessage ? formatRelativeTime(chat.lastMessage.createdAt, locale) : '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center p-3 ${
        isActive 
          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
      } transition-all duration-200 cursor-pointer`}
      onClick={onClick}
    >
      {/* 头像部分 */}
      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
        <Image 
          src={chat.avatar || '/default-avatar.png'} 
          alt="Avatar" 
          layout="fill" 
          objectFit="cover" 
        />
        
        {/* 添加在线状态指示器 */}
        {chat.isOnline && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"
          />
        )}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        {/* 聊天名称和最后消息时间 */}
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {chatName}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {lastMessageTime}
          </span>
        </div>
        
        {/* 最后一条消息预览和未读消息指示器 */}
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
            {chat.lastMessage?.content || ''}
          </p>
          
          {/* 未读消息指示器 */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}