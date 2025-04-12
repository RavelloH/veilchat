import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { decryptMessage } from '../lib/encryption';
import { translate } from '../lib/i18n';

export default function ChatMessage({ 
  message, 
  isOwn, 
  privateKey,
  onReply, 
  onDelete, 
  replyingTo, 
  locale 
}) {
  const [decryptedContent, setDecryptedContent] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const menuRef = useRef(null);
  const messageRef = useRef(null);
  
  // 点击组件外部时关闭菜单
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 解密消息内容
  useEffect(() => {
    async function decrypt() {
      if (!message.content || message.isDeleted) {
        setIsDecrypting(false);
        return;
      }
      
      try {
        if (message.encryptedKey && privateKey) {
          const decrypted = decryptMessage(
            message.content,
            message.encryptedKey,
            privateKey
          );
          setDecryptedContent(decrypted || translate('error.decryptionFailed', locale) || '解密失败');
        } else {
          setDecryptedContent(message.content);
        }
      } catch (error) {
        console.error('解密失败:', error);
        setDecryptedContent(translate('error.decryptionFailed', locale) || '解密失败');
      } finally {
        setIsDecrypting(false);
      }
    }
    
    decrypt();
  }, [message, privateKey, locale]);
  
  // 当回复此消息时，滚动到此消息
  useEffect(() => {
    if (replyingTo && replyingTo === message.id && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 高亮动画
      messageRef.current.classList.add('bg-primary-100', 'dark:bg-primary-900/20');
      setTimeout(() => {
        messageRef.current?.classList.remove('bg-primary-100', 'dark:bg-primary-900/20');
      }, 2000);
    }
  }, [replyingTo, message.id]);
  
  if (message.isDeleted) {
    return (
      <div 
        ref={messageRef}
        className={`flex items-center justify-center py-2 px-4 my-1 text-gray-500 dark:text-gray-400 text-sm italic`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {translate('chat.messageDeleted', locale) || '消息已删除'}
      </div>
    );
  }
  
  // 格式化时间
  const formattedTime = format(new Date(message.createdAt), 'HH:mm');
  const formattedDate = format(new Date(message.createdAt), 'yyyy-MM-dd');
  
  // 检查消息是否包含图片或媒体
  const isMedia = message.mediaUrl && message.mediaType?.startsWith('image');
  const isFile = message.mediaUrl && !message.mediaType?.startsWith('image');
  const isAudio = message.mediaUrl && message.mediaType?.startsWith('audio');
  
  return (
    <div 
      ref={messageRef}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 relative transition-colors duration-500`}
    >
      {!isOwn && (
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 mr-2">
          {message.sender?.avatar ? (
            <Image 
              src={message.sender.avatar} 
              alt={message.sender.name || message.sender.username} 
              width={32} 
              height={32} 
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium">
              {(message.sender?.name || message.sender?.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* 被回复的消息 */}
        {message.deliveredFrom && (
          <div className={`${isOwn ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-100 dark:bg-secondary-700/50'} 
                          px-3 py-1.5 rounded-t-lg text-xs text-gray-600 dark:text-gray-300 mb-0.5 
                          ${isOwn ? 'rounded-bl-lg' : 'rounded-br-lg'} w-full`}>
            <div className="font-medium text-primary-600 dark:text-primary-400">
              {message.deliveredFrom.sender.name || message.deliveredFrom.sender.username}
            </div>
            <div className="truncate">
              {message.deliveredFrom.content.slice(0, 50)}
              {message.deliveredFrom.content.length > 50 && '...'}
            </div>
          </div>
        )}
        
        <div 
          className={`relative group message-bubble ${
            isOwn 
              ? 'bg-primary-600 text-white rounded-tl-lg rounded-br-lg rounded-bl-lg' 
              : 'bg-white dark:bg-secondary-700 text-gray-800 dark:text-gray-200 rounded-tr-lg rounded-br-lg rounded-bl-lg'
          } px-4 py-2 shadow-sm`}
        >
          {/* 消息内容 */}
          {isDecrypting ? (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse mr-1"></div>
              <div className="w-4 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse mr-1"></div>
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            </div>
          ) : (
            <>
              {/* 媒体内容 */}
              {isMedia && (
                <div className="mb-2 relative">
                  {!isImageLoaded && (
                    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <Image
                    src={message.mediaUrl}
                    alt="Media"
                    width={300}
                    height={200}
                    className={`rounded-lg max-h-60 object-contain ${isImageLoaded ? '' : 'hidden'}`}
                    onLoad={() => setIsImageLoaded(true)}
                  />
                </div>
              )}
              
              {/* 文件内容 */}
              {isFile && (
                <a 
                  href={message.mediaUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={`flex items-center p-2 mb-2 rounded-lg ${
                    isOwn ? 'bg-primary-700' : 'bg-gray-100 dark:bg-secondary-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate max-w-xs text-sm">
                    {message.mediaUrl.split('/').pop()}
                  </span>
                </a>
              )}
              
              {/* 音频内容 */}
              {isAudio && (
                <div className="mb-2">
                  <audio controls className="w-full">
                    <source src={message.mediaUrl} type={message.mediaType} />
                    {translate('chat.audioNotSupported', locale) || '您的浏览器不支持音频元素。'}
                  </audio>
                </div>
              )}
              
              {/* 文本内容 */}
              <p className="whitespace-pre-wrap break-words">{decryptedContent}</p>
              
              {/* 菜单按钮 */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-secondary-600 text-gray-500 dark:text-gray-300 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
              
              {/* 消息操作菜单 */}
              {isMenuOpen && (
                <div 
                  ref={menuRef}
                  className="absolute top-0 right-0 mt-6 w-36 bg-white dark:bg-secondary-700 rounded-lg shadow-lg z-10 py-1"
                >
                  <button
                    onClick={() => {
                      onReply(message);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-secondary-600"
                  >
                    {translate('chat.reply', locale)}
                  </button>
                  
                  {isOwn && (
                    <button
                      onClick={() => {
                        onDelete(message.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-secondary-600"
                    >
                      {translate('chat.delete', locale)}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* 时间戳 */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formattedTime} · {formattedDate}
          {message.autoDeleteAt && (
            <span className="ml-2 text-yellow-600 dark:text-yellow-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {translate('chat.autoDelete', locale)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
