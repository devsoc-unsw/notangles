import React from 'react';
import { styled } from '@mui/system';

const FriendsActivityTab = styled('div')`
  display: flex;
  flex-direction: column;
  max-width: 260px;
  min-height: 80px;
  border-radius: 8px;
  background-color: #f2f3f5;
  padding: 16px;
  gap: 12px;
`;

const UserNameText = styled('p')`
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
`;

const UserActivity = styled('p')`
  margin: 0;
  color: #90949a;
  font-size: 0.8rem;
`;

const ClassLocationContainer = styled('div')`
  display: flex;
  flex-direction: row;
  background-color: white;
  border-radius: 4px;
  padding: 10px;
  gap: 12px;
`;

const Location = styled('div')`
  font-size: 0.8rem;
`;

const ClassTime = styled('div')`
  font-size: 0.8rem;
`;

const TextContainer = styled('div')`
  display: flex;
  flex-direction: column;
`;

const UserDetailsContainer = styled('div')`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

const UserProfile = styled('div')`
  width: 35px;
  height: 35px;
  border-radius: 20px;
  background-color: white;
`;

const FriendsActivity: React.FC = ({}) => {
  return (
    <FriendsActivityTab>
      <UserDetailsContainer>
        <UserProfile />
        <TextContainer>
          <UserNameText>Rayian Ahmed</UserNameText>
          <UserActivity>Currently teaching</UserActivity>
        </TextContainer>
      </UserDetailsContainer>
      <ClassLocationContainer>
        <Location>COMP1531 at TablaK17G7</Location>
        <ClassTime>14:00 - 16:00</ClassTime>
      </ClassLocationContainer>
    </FriendsActivityTab>
  );
};

export default FriendsActivity;
