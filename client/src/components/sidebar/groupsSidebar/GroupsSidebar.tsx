import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import AddOrEditGroupDialog, { Group } from './AddOrEditGroupDialog';
import { API_URL } from '../../../api/config';
import NetworkError from '../../../interfaces/NetworkError';

const StyledContainer = styled('div')`
  height: 100vh;
  width: 50px;
  background: ${({ theme }) => theme.palette.primary.main};
  display: flex; 
  justify-content: center;
  padding: 12px 0px;
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

  return (
    <StyledContainer>
      <AddOrEditGroupDialog getGroups={getGroups} userId={userId} />
    </StyledContainer>
  );
};

export default GroupsSidebar;
