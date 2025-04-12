import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { translate } from '../lib/i18n';
import { decryptMessage } from '../lib/encryption';

export default function ChatList({ 
  chats, 
  activeChat, 
  onChatSelect, 
  onNewChat, 
  currentUserId, 
  privateKey,
  locale,
  loading = false
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats || []);
  
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
              <button 
                onClick={onNewChat}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {translate('chat.newChat', locale)}
              </button>
            </div>
          
            {filteredChats.map(chat => {
              // 查找聊天中的另一个用户
              const otherUser = chat.users.find(u => u.user.id !== currentUserId)?.user;
              
              // 获取最新消息
              const latestMessage = chat.messages[0];
              
              // 解密最新消息预览（如果有的话）
              let messagePreview = '';
              if (latestMessage) {
                if (latestMessage.isDeleted) {
                  messagePreview = translate('chat.messageDeleted', locale) || '消息已删除';
                } else if (latestMessage.mediaUrl) {
                  if (latestMessage.mediaType?.startsWith('image')) {
                    messagePreview = translate('chat.sentImage', locale) || '发送了一张图片';
                  } else if (latestMessage.mediaType?.startsWith('audio')) {
                    messagePreview = translate('chat.sentAudio', locale) || '发送了一段语音';
                  } else {
                    messagePreview = translate('chat.sentFile', locale) || '发送了一个文件';
                  }
                } else if (latestMessage.encryptedKey && privateKey) {
                  try {
                    const decrypted = decryptMessage(
                      latestMessage.content,
                      latestMessage.encryptedKey,
                      privateKey
                    );
                    messagePreview = decrypted?.substring(0, 30) + (decrypted?.length > 30 ? '...' : '') || '';
                  } catch {
                    messagePreview = translate('chat.encryptedMessage', locale) || '加密消息';
                  }
                } else {
                  messagePreview = latestMessage.content?.substring(0, 30) + (latestMessage.content?.length > 30 ? '...' : '') || '';
                }
              }
              
              // 格式化最新消息时间
              const messageTime = latestMessage 
                ? format(new Date(latestMessage.createdAt), new Date(latestMessage.createdAt).toDateString() === new Date().toDateString() ? 'HH:mm' : 'MM/dd') 
                : '';
              
              return (
                <div 
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`flex items-center p-3 cursor-pointer border-b border-gray-200 dark:border-secondary-800 hover:bg-gray-100 dark:hover:bg-secondary-800 transition ${
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
    </div>
  );
}
