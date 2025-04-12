import { useState } from 'react';
import { translate } from '../lib/i18n';
import UserSearch from './UserSearch';

export default function CreateGroupModal({ onClose, onCreateGroup, locale }) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [step, setStep] = useState(1); // 1: 选择用户, 2: 设置群组名称
  const [error, setError] = useState('');
  
  const handleAddUser = (user) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };
  
  const handleNext = () => {
    if (selectedUsers.length < 2) {
      setError(translate('chat.needMoreUsers', locale) || '群组至少需要2个用户');
      return;
    }
    setError('');
    setStep(2);
  };
  
  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setError(translate('chat.enterGroupName', locale) || '请输入群组名称');
      return;
    }
    
    onCreateGroup(groupName, selectedUsers.map(user => user.id));
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-secondary-800 w-full max-w-md rounded-xl shadow-xl overflow-hidden scale-in">
        <div className="p-4 border-b border-gray-200 dark:border-secondary-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {translate('chat.createGroup', locale)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="m-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {step === 1 ? (
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {translate('chat.addMembers', locale) || '添加成员'}
              </h3>
              <UserSearch onUserSelect={handleAddUser} locale={locale} />
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {translate('chat.selectedMembers', locale) || '已选择成员'} ({selectedUsers.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full"
                    >
                      <span className="mr-1">{user.name || user.username}</span>
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-primary-500 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={selectedUsers.length < 2}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {translate('chat.next', locale) || '下一步'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-4">
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {translate('chat.groupName', locale) || '群组名称'}
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={translate('chat.enterGroupName', locale) || '请输入群组名称'}
                className="w-full py-2 px-3 bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-200 dark:bg-secondary-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                {translate('chat.back', locale) || '返回'}
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                {translate('chat.create', locale) || '创建'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
