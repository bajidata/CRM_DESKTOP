import React from 'react';
import type { User } from '../types';
import type { TabConfig } from '../types';

interface HeaderProps {
  user: User;
  tabNames: TabConfig;
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ user, tabNames, activeTab }) => {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-[#0c865e] uppercase">{tabNames[activeTab].label}</h1>
      <div className="flex items-center space-x-4">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
        )}
        <span className="font-medium text-white bg-[#0c865e] p-1 rounded-sm">
          {user.displayName ?? user.email}
        </span>
      </div>
    </header>
  );
};