import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { LocaleContext } from '../_app';
import { translate } from '../../lib/i18n';
import ChatList from '../../components/ChatList';
import ChatMessage from '../../components/ChatMessage';
import { decryptPrivateKey } from '../../lib/encryption';
import useWebSocket from '../../hooks/useWebSocket';
import Layout from '../../components/Layout';
import React from 'react';
import NewChatModal from '../../components/NewChatModal';

export default function Chat() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = React.useContext(LocaleContext);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [privateKey, setPrivateKey] = useState(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  // WebSocket 连接
  const { connected, sendMessage: sendSocketMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'wss://api.veilchat.com/ws',
    session?.user?.id
  );

  // 认证状态检查
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // 解密私钥
      const decryptedKey = decryptPrivateKey(session.user.privateKeyEncrypted, localStorage.getItem('pwdHash'));
      setPrivateKey(decryptedKey);
      
      // 加载聊天列表
      fetchChats();
    }
  }, [status, router, session]);

  // 获取聊天列表
  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      
      if (response.ok) {
        setChats(data.chats);
      } else {
        console.error('获取聊天列表失败:', data.error);
      }
    } catch (error) {
      console.error('获取聊天列表错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取聊天消息
  const fetchMessages = async (chatId) => {
    try {
      setMessages([]);
      
      const response = await fetch(`/api/chats/${chatId}/messages`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages);
        scrollToBottom();
      } else {
        console.error('获取消息失败:', data.error);
      }
    } catch (error) {
      console.error('获取消息错误:', error);
    }
  };

  // 选择聊天
  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
  };

  // 创建新聊天
  const handleNewChat = () => {
    setShowNewChatModal(true);
  };
  
  // 处理用户选择
  const handleUserSelect = async (user) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: user.username
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 添加新聊天到列表
        setChats(prevChats => [data.chat, ...prevChats.filter(c => c.id !== data.chat.id)]);
        // 选择新聊天
        setActiveChat(data.chat);
      } else {
        console.error('创建聊天失败:', data.error);
      }
    } catch (error) {
      console.error('创建聊天错误:', error);
    }
  };

  // 发送消息
  const sendMessage = async (content, replyToId = null) => {
    if (!content || !activeChat) return;

    // 乐观更新UI：先添加一个临时消息
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content: content,
      senderId: session.user.id,
      createdAt: new Date().toISOString(),
      sender: {
        id: session.user.id,
        username: session.user.username,
        name: session.user.name,
        avatar: session.user.avatar
      },
      replyToId,
      // 标记为临时消息
      isTemp: true
    };
    
    // 更新消息列表状态
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          chatId: activeChat.id,
          replyToId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 用实际消息替换临时消息
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? data.message : msg
        ));
        
        // 更新聊天列表，将当前聊天放在最前面并更新最新消息
        setChats(prev => {
          const updatedChats = prev.map(chat => {
            if (chat.id === activeChat.id) {
              return {
                ...chat,
                messages: [data.message, ...chat.messages.slice(0, chat.messages.length > 0 ? chat.messages.length - 1 : 0)]
              };
            }
            return chat;
          });
          
          // 将当前聊天移到顶部
          const activeIndex = updatedChats.findIndex(c => c.id === activeChat.id);
          if (activeIndex > 0) {
            const activeChat = updatedChats[activeIndex];
            updatedChats.splice(activeIndex, 1);
            updatedChats.unshift(activeChat);
          }
          
          return updatedChats;
        });
        
        // 清空输入框
        setNewMessage('');
        setReplyingTo(null);
      } else {
        // 显示错误，标记临时消息为发送失败
        console.error('发送消息失败:', data.error);
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? { ...msg, sendFailed: true } : msg
        ));
      }
    } catch (error) {
      console.error('发送消息错误:', error);
      // 标记临时消息为发送失败
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, sendFailed: true } : msg
      ));
    }
  };

  // 处理文件上传
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
      alert(translate('error.fileTooBig', locale));
      return;
    }
    
    setAttachmentLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', activeChat.id);
      
      if (replyTo) {
        formData.append('replyToId', replyTo.id);
      }
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || translate('error.general', locale));
      }
      
      // 重置回复状态
      setReplyTo(null);
      
      // 刷新消息
      fetchMessages(activeChat.id);
    } catch (error) {
      console.error('上传文件错误:', error);
      alert(translate('error.general', locale));
    } finally {
      setAttachmentLoading(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除消息
  const handleDeleteMessage = async (messageId) => {
    if (!confirm(translate('chat.confirmDelete', locale) || '确定要删除此消息吗？')) {
      return;
    }
    
    try {
      await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      });
      
      // 更新本地消息列表
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isDeleted: true, content: '' } 
            : msg
        )
      );
    } catch (error) {
      console.error('删除消息错误:', error);
      alert(translate('error.general', locale));
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理按键事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(newMessage, replyTo?.id);
    }
  };

  return (
    <Layout>
      <div className="flex h-full">
        {/* 聊天列表 */}
        <div className="w-full md:w-80 lg:w-96 h-full border-r border-gray-200 dark:border-secondary-800 hidden md:block">
          <ChatList
            chats={chats}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            currentUserId={session?.user?.id}
            privateKey={privateKey}
            locale={locale}
            loading={loading}
          />
        </div>
        
        {/* 聊天区域 */}
        <div className="flex-grow h-full flex flex-col">
          {activeChat ? (
            <>
              {/* 聊天标题 */}
              <div className="p-3 border-b border-gray-200 dark:border-secondary-800 flex items-center">
                <button className="md:hidden mr-2 text-gray-500 dark:text-gray-400" onClick={() => setActiveChat(null)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                  {activeChat.users.find(u => u.user.id !== session?.user?.id)?.user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                
                <div className="ml-3">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {activeChat.users.find(u => u.user.id !== session?.user?.id)?.user.name || translate('chat.unknownUser', locale)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeChat.superPrivacyMode ? (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                        {translate('chat.superPrivacy', locale)}
                      </span>
                    ) : translate('chat.online', locale)}
                  </p>
                </div>
              </div>
              
              {/* 消息列表 */}
              <div className="flex-grow overflow-y-auto p-4 bg-white dark:bg-secondary-800">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {translate('chat.noMessages', locale)}
                  </div>
                ) : (
                  messages.map(message => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === session?.user?.id}
                      privateKey={privateKey}
                      onReply={setReplyTo}
                      onDelete={handleDeleteMessage}
                      replyingTo={replyTo?.id}
                      locale={locale}
                    />
                  ))
                )}
                <div ref={messageEndRef} />
              </div>
              
              {/* 回复信息 */}
              {replyTo && (
                <div className="px-4 py-2 bg-gray-100 dark:bg-secondary-700 border-t border-gray-200 dark:border-secondary-600 flex items-center">
                  <div className="flex-grow">
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {translate('chat.replyTo', locale) || '回复'}:{' '}
                      <span className="font-medium">
                        {replyTo.sender.name || replyTo.sender.username}
                      </span>
                    </p>
                    <p className="text-sm truncate text-gray-700 dark:text-gray-300">
                      {replyTo.content.substring(0, 50)}
                      {replyTo.content.length > 50 ? '...' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* 输入区域 */}
              <div className="p-3 border-t border-gray-200 dark:border-secondary-800">
                <div className="flex items-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-700"
                    disabled={attachmentLoading}
                  >
                    {attachmentLoading ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <div className="ml-2 flex-grow">
                    <textarea
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={translate('chat.sendMessage', locale)}
                      className="w-full py-2 px-3 bg-gray-100 dark:bg-secondary-700 border-0 rounded-lg focus:ring-1 focus:ring-primary-500 resize-none"
                      rows="1"
                    />
                  </div>
                  
                  <button
                    onClick={() => sendMessage(newMessage, replyTo?.id)}
                    disabled={(!newMessage.trim() && !attachmentLoading) || !activeChat}
                    className="ml-2 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            // 移动端聊天列表
            <div className="h-full md:hidden">
              <ChatList
                chats={chats}
                activeChat={activeChat}
                onChatSelect={handleChatSelect}
                onNewChat={handleNewChat}
                currentUserId={session?.user?.id}
                privateKey={privateKey}
                locale={locale}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* 新建聊天模态框 */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onUserSelect={handleUserSelect}
          locale={locale}
        />
      )}
    </Layout>
  );
}

// 确保必须登录才能访问此页面
export async function getServerSideProps(context) {
  return {
    props: {}
  };
}
