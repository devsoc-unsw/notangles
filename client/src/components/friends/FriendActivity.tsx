import React from 'react';
import { styled } from '@mui/system';

const FriendsActivityTab = styled('div')`
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100px;
  border: 1px solid #d7d9dc;
  border-radius: 8px;
  background-color: #f2f3f5;
  padding: 16px;
  gap: 12px;
`;

const UserNameText = styled('p')`
  font-weight: 600;
  margin: 0;
`;

const UserNameActivity = styled('p')`
  margin: 0;
  color: #90949a;
  font-size: 0.9rem;
`;

const ClassLocationContainer = styled('div')`
  display: flex;
  flex-direction: row;
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  justify-content: space-between;
`;

const Location = styled('div')`
  font-size: 0.9rem;
`;

const ClassTime = styled('div')`
  font-size: 0.9rem;
`;

const TextContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserDetailsContainer = styled('div')`
  display: flex;
  flex-direction: row;
  gap: 16px;
`;

const UserProfile = styled('div')`
  width: 40px;
  height: 40px;
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
          <UserNameActivity>Currently teaching</UserNameActivity>
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
