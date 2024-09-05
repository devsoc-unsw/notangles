import React, { useContext } from 'react';
import AddOrEditGroupDialog from './AddOrEditGroupDialog';
import FriendsDialog from './friends/FriendsDialog';
import GroupCircle from './GroupCircle';
import { UserContext } from '../../../context/UserContext';

const GroupsSidebar: React.FC = () => {
  const { user, groups, fetchUserInfo } = useContext(UserContext);

  return (
    <>
      <FriendsDialog user={user} fetchUserInfo={fetchUserInfo} />
      <AddOrEditGroupDialog user={user} onClose={fetchUserInfo} />
      {groups.map((group, i) => {
        return <GroupCircle key={i} group={group} fetchUserInfo={fetchUserInfo} user={user} />;
      })}
    </>
  );
};

export default GroupsSidebar;
