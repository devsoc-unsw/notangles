import React, { useContext } from 'react';

import { UserContext } from '../../../context/UserContext';
import AddOrEditGroupDialog from './AddOrEditGroupDialog';
import FriendsDialog from './friends/FriendsDialog';
import GroupCircle from './GroupCircle';

const GroupsSidebar: React.FC = () => {
  const { user, groups, fetchUserInfo, selectedGroupIndex, setSelectedGroupIndex } = useContext(UserContext);

  const handleChangeSelectedGroup = (newIndex: number) => {
    setSelectedGroupIndex(newIndex);
  };

  return (
    <>
      <FriendsDialog user={user} fetchUserInfo={fetchUserInfo} />
      <AddOrEditGroupDialog user={user} onClose={fetchUserInfo} />
      {groups.map((group, i) => {
        return (
          <GroupCircle
            key={i}
            group={group}
            fetchUserInfo={fetchUserInfo}
            user={user}
            isSelected={i === selectedGroupIndex}
            onClick={() => handleChangeSelectedGroup(i)}
          />
        );
      })}
    </>
  );
};

export default GroupsSidebar;
