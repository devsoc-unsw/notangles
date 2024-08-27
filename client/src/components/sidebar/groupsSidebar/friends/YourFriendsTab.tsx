import React from 'react';
import { User } from '../AddOrEditGroupDialog';

const YourFriendsTab: React.FC<{ user: User | undefined }> = ({ user }) => {
  console.log('user', user);
  return <div>Your Friends</div>;
};

export default YourFriendsTab;
