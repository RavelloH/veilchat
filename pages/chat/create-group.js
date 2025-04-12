import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import { LocaleContext } from '../_app';
import { translate } from '../../lib/i18n';
import React from 'react';

export default function CreateGroup() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale } = React.useContext(LocaleContext);
  
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);
  
  // 搜索用户
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const delaySearch = setTimeout(() => {
      setLoading(true);
      
      fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
          setSearchResults(data.users || []);
        })
        .catch(error => {
          console.error('搜索用户失败:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);
  
  // 选择用户
  const handleSelectUser = (user) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
  };
  
  // 移除已选用户
  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };
  
  // 创建群聊
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      setError(translate('error.emptyGroupName', locale) || '请输入群组名称');
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError(translate('error.noUsersSelected', locale) || '请选择至少一名群组成员');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/chats/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: groupName,
          userIds: selectedUsers.map(user => user.id)
        })
      });
      
      if (!response.ok) {
        throw new Error(translate('error.network', locale));
      }
      
      const data = await response.json();
      router.push(`/chat?id=${data.chat.id}`);
    } catch (error) {
      console.error('创建群聊失败:', error);
      setError(error.message || translate('error.general', locale));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {translate('chat.createGroup', locale)}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleCreateGroup} className="space-y-6">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('chat.groupName', locale) || '群组名称'}
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder={translate('chat.enterGroupName', locale) || '输入群组名称'}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {translate('chat.members', locale) || '成员'}
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm bg-white dark:bg-secondary-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder={translate('chat.searchUsers', locale) || '搜索用户'}
              />
              
              {loading && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-secondary-800 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-secondary-700 cursor-pointer"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {user.name || user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full"
                  >
                    <span>{user.name || user.username}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(user.id)}
                      className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-secondary-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {translate('settings.cancel', locale) || '取消'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>{translate('loading', locale)}</span>
                </div>
              ) : (
                translate('chat.createGroup', locale)
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
