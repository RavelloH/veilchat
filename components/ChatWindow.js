import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import ChatMessage from './ChatMessage';
import { translate } from '../lib/i18n';

export default function ChatWindow({
  chat,
  messages,
  onSendMessage,
  onDeleteMessage,
  onClearChat, // 新增清除聊天记录回调
  currentUser,
  privateKey,
  locale,
  loading = false,
  sending = false,
  error = ''
}) {
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  
  // 获取聊天对象名称
  const getChatName = () => {
    if (!chat) return '';
    
    if (chat.isGroup && chat.name) {
      return chat.name;
    }
    
    // 查找私聊中的另一个用户
    const otherUser = chat.users.find(u => u.user.id !== currentUser?.id)?.user;
    return otherUser?.name || otherUser?.username || translate('chat.unknownUser', locale);
  };
  
  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 在消息更新后滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 自动滚动到新消息
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]); // 当消息列表变化时滚动

  // 增加调试信息
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log('最后一条消息:', { 
        id: lastMessage.id,
        content: lastMessage.content?.substring(0, 30) + '...',
        isTemp: lastMessage.isTemp,
        senderId: lastMessage.senderId
      });
    }
  }, [messages]);

  // 设置回复消息
  useEffect(() => {
    if (replyingTo) {
      const message = messages.find(m => m.id === replyingTo);
      setReplyMessage(message);
      inputRef.current?.focus();
    } else {
      setReplyMessage(null);
    }
  }, [replyingTo, messages]);
  
  // 监听点击事件关闭菜单
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 发送消息处理
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage, replyingTo);
    setNewMessage('');
    setReplyingTo(null);
    setReplyMessage(null);
  };
  
  // 回复消息处理
  const handleReply = (message) => {
    setReplyingTo(message.id);
  };
  
  // 取消回复
  const cancelReply = () => {
    setReplyingTo(null);
    setReplyMessage(null);
  };
  
  if (loading && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-secondary-900">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-secondary-900">
      {/* 聊天标题栏 */}
      <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-secondary-800 border-b border-gray-200 dark:border-secondary-700">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
            {chat?.isGroup ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ) : (
              <div className="text-gray-600 dark:text-gray-300 font-medium">
                {getChatName().charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {getChatName()}
            </h2>
            {/* 可选：在线状态或成员数量等 */}
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-secondary-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          {menuOpen && (
            <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-md shadow-lg py-1">
              {chat?.isGroup && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                >
                  {translate('chat.addMembers', locale)}
                </button>
              )}
              {chat?.isGroup && (
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
                >
                  {translate('chat.leaveGroup', locale)}
                </button>
              )}
              <button
                onClick={() => {
                  onClearChat();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-secondary-700"
              >
                {translate('chat.clearHistory', locale) || '清除聊天记录'}
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-secondary-700"
              >
                {translate('chat.deleteChat', locale)}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 消息区域 */}
      <div className="flex-grow overflow-y-auto scrollbar-hide p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>{translate('chat.noMessages', locale)}</p>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUser?.id}
              privateKey={privateKey}
              onReply={handleReply}
              onDelete={onDeleteMessage}
              replyingTo={replyingTo}
              locale={locale}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 消息输入区域 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      
      {replyMessage && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-secondary-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="mr-1">{translate('chat.replyTo', locale)}:</span>
              <span className="font-medium text-primary-600 dark:text-primary-400">
                {replyMessage.senderId === currentUser?.id ? translate('chat.you', locale) : (replyMessage.sender?.name || replyMessage.sender?.username)}
              </span>
            </div>
            <button
              onClick={cancelReply}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-secondary-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {replyMessage.isDeleted 
              ? translate('chat.messageDeleted', locale) 
              : (replyMessage.content?.slice(0, 50) + (replyMessage.content?.length > 50 ? '...' : ''))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="px-4 py-3 bg-white dark:bg-secondary-800 border-t border-gray-200 dark:border-secondary-700">
        <div className="flex">
          <button
            type="button"
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <input
            type="text"
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={translate('chat.newMessage', locale)}
            className="flex-grow px-4 py-2 bg-gray-100 dark:bg-secondary-700 rounded-l-full focus:outline-none"
            disabled={sending}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-primary-600 text-white rounded-r-full px-4 py-2 font-medium hover:bg-primary-700 focus:outline-none disabled:opacity-70"
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
