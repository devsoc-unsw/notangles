import styled from '@emotion/styled';
import { ConnectWithoutContact as FriendsActivityIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React, { useContext, useState } from 'react';

import { UserContext } from '../../context/UserContext';
import UserIcon from '../user/UserIcon';
import ActivityBar from './ActivityBar';
import { Group } from '../../interfaces/Group';

const Container = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  display: flex;
  gap: 24px;
  align-items: center;
  padding: 12px 66px;
  background: white;
  width: 90%;
  margin-left: 140px;
  border-bottom: 1px solid #e0e0e0;
`;

const FriendsActivityButtonContainer = styled('div')`
  position: fixed;
  top: 6px;
  right: 32px;
  z-index: 1000;
`;

const Members = styled('div')`
  display: flex;
  gap: 8px;
`;

const MemberText = styled('div')`
  display: flex;
  gap: 2px;
  flex-direction: column;
  align-items: start;
`;

const GroupName = styled('div')`
  font-size: 18px;
  font-weight: 600;
`;

const GroupDescription = styled('div')`
  font-size: 14px;
`;

const GroupInfoNavbar = () => {
  const { groups, selectedGroupIndex } = useContext(UserContext);

  const group = groups.length !== 0 ? groups[selectedGroupIndex] : undefined;

  const [showFriendsActivities, setShowFriendsActivities] = useState(false);

  return (
    <>
      <Container>
        {group ? (
          <>
            <MemberText>
              <GroupName>{group.name}</GroupName>
              <GroupDescription>{group.description}</GroupDescription>
            </MemberText>
            <Members>
              {[...group.groupAdmins, ...group.members].map((member, i) => (
                <UserIcon key={i} url={member.profileURL} tooltipTitle={`${member.firstname} ${member.lastname}`} />
              ))}
            </Members>
          </>
        ) : (
          <>
            <MemberText>
              <GroupName>You are currently not apart of any groups.</GroupName>
              <GroupDescription>To create a group, click '+' on the left, blue side bar.</GroupDescription>
            </MemberText>
          </>
        )}
        <FriendsActivityButtonContainer>
          <Tooltip title="Friend's Activity">
            <IconButton
              onClick={() => {
                setShowFriendsActivities(!showFriendsActivities);
              }}
              size="large"
            >
              <FriendsActivityIcon />
            </IconButton>
          </Tooltip>
        </FriendsActivityButtonContainer>
      </Container>
      {showFriendsActivities && <ActivityBar />}
    </>
  );
};

export default GroupInfoNavbar;
