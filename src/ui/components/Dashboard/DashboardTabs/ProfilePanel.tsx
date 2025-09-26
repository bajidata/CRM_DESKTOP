import React from 'react';
import type { User } from '../../types';

interface ProfilePanelProps {
  user: User;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <h2 className="text-lg font-bold mb-4">Profile</h2>
      <p>
        <strong>UID:</strong> {user.uid}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>
    </div>
  );
};