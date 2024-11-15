import { styled } from '@mui/system';
import { useContext, useEffect } from 'react';

import { API_URL } from '../../api/config';
import { UserContext } from '../../context/UserContext';



const Container = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FriendContainer = styled('div')`
  display: flex;
  flex-direction: column;
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

/*
TODO: tldr just need to fix getCurrentActivity  and findCurrentActivity  to return a useful object like the below from the database timetable object
export type CurrentActivity = {
  friendName: string;
  activityTitle: string; // i.e. in a [activity] tutorial
  location: string; // so this will be `[course_code] at [room location]`
  time_slot: string; // i.e. 12:00 - 14:00
};
^ or if its a custom event then minor changes based on the event info
*/

//////////////////////////////////////////////////////  CHANEL'S BE STUFF //////////////////////////////////////////////////////
export interface Friend {
  name: string;
  userId: string;
  // show next event within the hour
  currentActivity: CurrentActivity | null;
}

export type FriendsList = Friend[];

export type CurrentActivity = {
  friendName: string;
  activityTitle: string; // i.e. in a [activity] tutorial
  location: string; // so this will be `[course_code] at [room location]`
  time_slot: string; // i.e. 12:00 - 14:00
};

const getCurrentActivity = async (userId: string): Promise<CurrentActivity | null> => {
  try {
    const res = await fetch(`${API_URL.server}/user/timetable/${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch timetable data');
    }

    const timetable = await res.json();
    // Currently we only consider the first timetable as the main
    return findCurrentActivity(timetable.data[0]);
  } catch (error) {
    console.error('Error fetching current activity:', error);
    return null;
  }
};

const findCurrentActivity = (timetable: any): CurrentActivity | null => {
  const now = new Date();
  const currentDay = now.toLocaleString('en-US', { weekday: 'long' }).slice(0, 3);
  const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);

  for (const clz of timetable.selectedClasses) {
    if (clz.times.day === currentDay && clz.times.time.start <= currentTime && clz.times.time.end >= currentTime) {
      return {
        friendName: timetable.friendName,
        activityTitle: `in a ${clz.activity} tutorial`,
        location: `${clz.courseCode} at ${clz.times.location}`,
        time_slot: `${clz.times.time.start} - ${clz.times.time.end}`,
      };
    }
  }

  return null;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const FriendsActivity = () => {
  const { user } = useContext(UserContext);

  useEffect(() => {
    // TODO: fix this integration here and store friend activity in state...
    const dosomething = async () => {
      for (const friend of user.friends) {
        console.log('friend', friend);
        const res = await getCurrentActivity(friend.userID);
        console.log('friend activity res', res);
      }
    };
    dosomething();
  }, []);

  return (
    <Container>
      <FriendContainer>
        <UserDetailsContainer>
          <UserProfile />
          <TextContainer>
            <UserNameText>Raiyan Ahmed</UserNameText>
            <UserActivity>Currently teaching</UserActivity>
          </TextContainer>
        </UserDetailsContainer>
        <ClassLocationContainer>
          <Location>COMP1531 at TablaK17G7</Location>
          <ClassTime>14:00 - 16:00</ClassTime>
        </ClassLocationContainer>
      </FriendContainer>
      <FriendContainer>
        <UserDetailsContainer>
          <UserProfile />
          <TextContainer>
            <UserNameText>Shaam Jevan</UserNameText>
            <UserActivity>Currently teaching</UserActivity>
          </TextContainer>
        </UserDetailsContainer>
        <ClassLocationContainer>
          <Location>COMP3121 at DA_BASEMENT</Location>
          <ClassTime>14:00 - 16:00</ClassTime>
        </ClassLocationContainer>
      </FriendContainer>
      <FriendContainer>
        <UserDetailsContainer>
          <UserProfile />
          <TextContainer>
            <UserNameText>Jeremy Le</UserNameText>
            <UserActivity>Chilln</UserActivity>
          </TextContainer>
        </UserDetailsContainer>
        <ClassLocationContainer>
          <Location>Ainsworth L3</Location>
        </ClassLocationContainer>
      </FriendContainer>
    </Container>
  );
};

export default FriendsActivity;
