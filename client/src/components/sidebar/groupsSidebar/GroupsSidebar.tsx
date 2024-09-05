import React, { useContext, useEffect, useState } from 'react';

import { API_URL } from '../../../api/config';
import { Group } from '../../../interfaces/Group';
import NetworkError from '../../../interfaces/NetworkError';
import { User } from '../UserAccount';
import AddOrEditGroupDialog from './AddOrEditGroupDialog';
import FriendsDialog from './friends/FriendsDialog';
import GroupCircle from './GroupCircle';
import { UserContext } from '../../../context/UserContext';

const GroupsSidebar: React.FC = () => {
  const { user, setUser, groups, setGroups } = useContext(UserContext);

  return (
    <>
      {/* <FriendsDialog user={user} getUserInfo={getUserInfo} />
      <AddOrEditGroupDialog user={user} onClose={getGroups} />
      {groups.map((group, i) => {
        return <GroupCircle key={i} group={group} getGroups={getGroups} user={user} />;
      })} */}
    </>
  );
};

export default GroupsSidebar;
