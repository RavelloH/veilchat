import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatTime, formatShortDate, isToday } from '../lib/dateUtils';
import { translate } from '../lib/i18n';
import { decryptMessage } from '../lib/encryption';
import ContextMenu from './ContextMenu';

export default function ChatList({ 
  chats, 
  activeChat, 
  onChatSelect, 
  onNewChat, 
  currentUserId, 
  privateKey,
  locale,
  loading = false,
  onDeleteChat,
  onMuteChat,
  onViewProfile
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats || []);
  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 }, chatId: null });
  
  // 当聊天列表变化时重新过滤
  useEffect(() => {
    if (!chats) return;
    
    if (!searchTerm) {
      setFilteredChats(chats);
      return;
    }
    
    const filtered = chats.filter(chat => {
      // 查找聊天中的另一个用户（对于私聊）
      const otherUser = chat.users.find(u => u.user.id !== currentUserId)?.user;
      
      // 检索匹配条件
      const nameMatch = otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const usernameMatch = otherUser?.username?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return nameMatch || usernameMatch;
    });
    
    setFilteredChats(filtered);
  }, [chats, searchTerm, currentUserId]);
  
  // 处理右键菜单
  const handleContextMenu = (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      chatId
    });
  };
  
  // 获取右键菜单项
  const getContextMenuItems = (chatId) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return [];
    
    const otherUser = chat.users.find(u => u.user.id !== currentUserId)?.user;
    
    const items = [
      {
        label: translate('chat.viewProfile', locale) || '查看资料',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>,
        onClick: () => onViewProfile && onViewProfile(otherUser)
      },
      {
        label: translate('chat.mute', locale) || '静音通知',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>,
        onClick: () => onMuteChat && onMuteChat(chatId)
      },
      { divider: true },
      {
        label: translate('chat.deleteChat', locale) || '删除聊天',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>,
        onClick: () => onDeleteChat && onDeleteChat(chatId),
        danger: true
      }
    ];
    
    return items;
  };
  
  // 解密消息预览
  const getMessagePreview = (latestMessage) => {
    if (!latestMessage) return '';
    
    if (latestMessage.isDeleted) {
      return translate('chat.messageDeleted', locale) || '消息已删除';
    } 
    
    if (latestMessage.mediaUrl) {
      if (latestMessage.mediaType?.startsWith('image')) {
        return translate('chat.sentImage', locale) || '发送了一张图片';
      } else if (latestMessage.mediaType?.startsWith('audio')) {
        return translate('chat.sentAudio', locale) || '发送了一段语音';
      } else {
        return translate('chat.sentFile', locale) || '发送了一个文件';
      }
    }
    
    // 检查是发送方自己的消息还是需要解密的消息
    if (latestMessage.senderId === currentUserId || latestMessage.senderVisible) {
      // 发送方自己的消息，直接使用Base64解码
      try {
        const decoded = Buffer.from(latestMessage.content, 'base64').toString('utf8');
        return decoded.substring(0, 30) + (decoded.length > 30 ? '...' : '');
      } catch (error) {
        console.error('解码预览失败:', error);
        return translate('chat.messagePreviewFailed', locale) || '(消息预览不可用)';
      }
    } 
    // 需要解密的消息
    else if (latestMessage.encryptedKey && privateKey) {
      try {
        const decrypted = decryptMessage(
          latestMessage.content,
          latestMessage.encryptedKey,
          privateKey
        );
        
        return decrypted 
          ? decrypted.substring(0, 30) + (decrypted.length > 30 ? '...' : '')
          : translate('chat.encryptedMessage', locale) || '加密消息';
      } catch (error) {
        console.error('解密预览失败:', error);
        return translate('chat.encryptedMessage', locale) || '加密消息';
      }
    } else {
      // 尝试直接Base64解码
      try {
        const decoded = Buffer.from(latestMessage.content, 'base64').toString('utf8');
        return decoded.substring(0, 30) + (decoded.length > 30 ? '...' : '');
      } catch (error) {
        return translate('chat.encryptedMessage', locale) || '加密消息';
      }
    }
  };
  
  if (loading) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-secondary-900">
        <div className="p-3 border-b border-gray-200 dark:border-secondary-700">
          <div className="bg-gray-200 dark:bg-secondary-700 h-10 rounded-md animate-pulse"></div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b border-gray-200 dark:border-secondary-800">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-secondary-700 animate-pulse"></div>
              <div className="ml-3 flex-grow">
                <div className="h-4 bg-gray-200 dark:bg-secondary-700 rounded w-1/3 mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-secondary-700 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-secondary-900">
      <div className="p-3 border-b border-gray-200 dark:border-secondary-700">
        <div className="relative">
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={translate('chat.search', locale)}
            className="w-full py-2 pl-10 pr-4 rounded-md bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-gray-400 dark:placeholder-gray-500 dark:text-gray-200"
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto scrollbar-hide">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mb-3" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>{searchTerm ? translate('chat.noSearchResults', locale) || '没有找到匹配的聊天' : translate('chat.noChats', locale) || '没有聊天记录'}</p>
            <button 
              onClick={onNewChat}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {translate('chat.startChat', locale)}
            </button>
          </div>
        ) : (
          <>
            <div className="sticky top-0 bg-gray-50 dark:bg-secondary-900 p-3 border-b border-gray-200 dark:border-secondary-700 z-10">
              <div className="flex gap-2">
                <button 
                  onClick={onNewChat}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {translate('chat.newChat', locale)}
                </button>
                <button 
                  onClick={() => props.onCreateGroup ? props.onCreateGroup() : setShowNewGroupModal(true)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {translate('chat.createGroup', locale)}
                </button>
              </div>
            </div>
          
            {filteredChats.map(chat => {
              // 查找聊天中的另一个用户
              const otherUser = chat.users.find(u => u.user.id !== currentUserId)?.user;
              
              // 获取最新消息
              const latestMessage = chat.messages[0];
              
              // 获取解密后的消息预览
              const messagePreview = latestMessage ? getMessagePreview(latestMessage) : '';
              
              // 格式化最新消息时间
              const messageTime = latestMessage 
                ? isToday(new Date(latestMessage.createdAt)) 
                  ? formatTime(new Date(latestMessage.createdAt)) 
                  : formatShortDate(new Date(latestMessage.createdAt))
                : '';
              
              return (
                <div 
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  onContextMenu={(e) => handleContextMenu(e, chat.id)}
                  className={`flex items-center p-3 cursor-pointer border-b border-gray-200 dark:border-secondary-800 hover:bg-gray-100 dark:hover:bg-secondary-800 transition-all-300 hover-scale ${
                    activeChat?.id === chat.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                    {otherUser?.avatar ? (
                      <Image 
                        src={otherUser.avatar} 
                        alt={otherUser.name || otherUser.username}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                        {(otherUser?.name || otherUser?.username || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate text-gray-800 dark:text-gray-200">
                        {otherUser?.name || otherUser?.username || translate('chat.unknownUser', locale) || '未知用户'}
                      </h3>
                      {messageTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {messageTime}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {latestMessage?.senderId === currentUserId && <span className="mr-1">{translate('chat.you', locale) || '你'}:</span>}
                      {messagePreview || translate('chat.noMessages', locale) || '还没有消息'}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        items={getContextMenuItems(contextMenu.chatId)}
      />
    </div>
  );
}
