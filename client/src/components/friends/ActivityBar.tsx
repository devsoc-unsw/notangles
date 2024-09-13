import React from 'react';
import { styled } from '@mui/system';
import FriendsActivity from './FriendActivity';
import { getAllFriends } from '../../api/getFriends';
import { API_URL } from '../../api/config';

const ActivityBarContainer = styled('div')`
  display: flex;
  flex-direction: column;
  width: 340px;
  height: 100vh;
  border-left: 1px solid gray;
  background-color: white;
  padding: 30px;
  gap: 20px;
`;

const StyledTitle = styled('p')`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
`;

const ActivityBar: React.FC = ({}) => {
  const [friends, setFriends] = React.useState<any[]>([]);
  const [userId, setUserId] = React.useState<string>('');

  
  // taken from UserAccount.tsx
  React.useEffect(() => {
    async function runAsync() {
      try {
        const response = await fetch(`${API_URL.server}/auth/user`, {
          credentials: 'include',
        });
        const userResponse = await response.text();
        if (userResponse !== '') {
          setUserId(JSON.parse(userResponse));
        } else {
          setUserId('');
        }
      } catch (error) {
        console.log(error);
      }
    }
    runAsync();
  }, []);


  React.useEffect(() => {
    const fetchFriends = async () => {
      try {
        // TODO determine where userId is? (cookies / other api ?)
        const friendsData = await getAllFriends(userId);
        setFriends(friendsData);
      } catch (error) {
        console.error('Failed to fetch friends data:', error);
      }
    };

    fetchFriends();
  }, []);

  return (
    <ActivityBarContainer>
      <StyledTitle>Your Friends</StyledTitle>
      {friends.map((friend) => (
        <FriendsActivity key={friend.userId} friend={friend} />
      ))}
    </ActivityBarContainer>
  );
};

export default ActivityBar;
