import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';
import AddOrEditGroupDialog, { Group } from './AddOrEditGroupDialog';
import GroupCircle from './GroupCircle';

const StyledContainer = styled('div')`
  height: 100vh;
  width: 50px;
  background: ${({ theme }) => theme.palette.primary.main};
  display: flex;
  align-items: center;
  padding: 12px 0px;
  flex-direction: column;
  gap: 4px;
`;

const GroupsSidebar: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);

  const getGroups = async () => {
    if (!userId) return;
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
    console.log('groups', groups)
  }, [groups]);

  return (
    <StyledContainer>
      <AddOrEditGroupDialog userId={userId} onClose={getGroups} />
      {groups.map((group, i) => {
        return <GroupCircle key={i} group={group} getGroups={getGroups} userId={userId} />;
      })}
    </StyledContainer>
  );
};

export default GroupsSidebar;
