import { useState, useEffect } from 'react';
import { translate } from '../lib/i18n';
import Image from 'next/image';
import React from 'react';

export default function UserSearch({ onUserSelect, locale }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 搜索用户
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setUsers([]);
      return;
    }
    
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const searchUsers = async (term) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/search?term=${encodeURIComponent(term)}`);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.error || translate('error.general', locale));
      }
    } catch (error) {
      console.error('搜索用户错误:', error);
      setError(translate('error.network', locale));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={translate('chat.searchUsers', locale) || '搜索用户...'}
          className="w-full py-2 pl-10 pr-4 bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          autoFocus
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
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {users.length === 0 && searchTerm.length >= 2 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {translate('chat.noUsersFound', locale) || '未找到用户'}
              </div>
            ) : searchTerm.length < 2 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {translate('chat.typeToSearch', locale) || '输入至少2个字符开始搜索'}
              </div>
            ) : (
              <>
                {users.map(user => (
                  <div
                    key={user.id}
                    onClick={() => onUserSelect(user)}
                    className="flex items-center p-3 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors hover-scale"
                  >
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || user.username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                          {(user.name || user.username || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-grow">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">
                        {user.name || user.username}
                      </h3>
                      {user.name && user.username !== user.name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
