import { useState } from 'react';
import { translate } from '../lib/i18n';
import UserSearch from './UserSearch';
import React from 'react';

export default function NewChatModal({ onClose, onUserSelect, locale }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-white dark:bg-secondary-800 w-full max-w-md rounded-xl shadow-xl overflow-hidden scale-in">
        <div className="p-4 border-b border-gray-200 dark:border-secondary-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {translate('chat.newChat', locale) || '新建聊天'}
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
        
        <div className="p-4">
          <UserSearch 
            onUserSelect={(user) => {
              onUserSelect(user);
              onClose();
            }} 
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
