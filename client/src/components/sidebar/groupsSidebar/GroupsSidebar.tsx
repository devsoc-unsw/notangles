import React, { useEffect, useState } from 'react';

import { API_URL } from '../../../api/config';
import { Group } from '../../../interfaces/Group';
import NetworkError from '../../../interfaces/NetworkError';
import { User } from '../UserAccount';
import AddOrEditGroupDialog from './AddOrEditGroupDialog';
import FriendsDialog from './friends/FriendsDialog';
import GroupCircle from './GroupCircle';

const GroupsSidebar: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<User>();
  const [groups, setGroups] = useState<Group[]>([]);

  const getGroups = async () => {
    if (!userId) return <></>;
    try {
      const res = await fetch(`${API_URL.server}/user/group/${userId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (res.status !== 200) throw new NetworkError("Couldn't get response");
      const jsonData = await res.json();
      setGroups(jsonData.data.groups);
    } catch (error) {
      throw new NetworkError(`Couldn't get response cause encountered error: ${error}`);
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await fetch(`${API_URL.server}/user/profile/${userId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const userResponse = await response.text();
      if (userResponse !== '') setUser(JSON.parse(userResponse).data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getGroups();
  }, [userId]);

  useEffect(() => {
    const getZid = async () => {
      try {
        const response = await fetch(`${API_URL.server}/auth/user`, {
          credentials: 'include',
        });
        const userResponse = await response.text();
        if (userResponse !== '') setUserId(JSON.parse(userResponse));
      } catch (error) {
        console.log(error);
      }
    };
    getZid();
  }, []);

  useEffect(() => {
    if (userId) getUserInfo();
  }, [userId]);

  return (
    <>
      <FriendsDialog user={user} getUserInfo={getUserInfo} />
      <AddOrEditGroupDialog user={user} onClose={getGroups} />
      {groups.map((group, i) => {
        return <GroupCircle key={i} group={group} getGroups={getGroups} user={user} />;
      })}
    </>
  );
};

export default GroupsSidebar;
