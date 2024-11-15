import { styled } from '@mui/system';
import React, { useContext, useEffect } from 'react';

import { API_URL } from '../../api/config';
import getCourseInfo from '../../api/getCourseInfo';
import { getAvailableTermDetails } from '../../constants/timetable';
import { UserContext } from '../../context/UserContext';
import NetworkError from '../../interfaces/NetworkError';
import {
  ClassPeriod,
  CourseCode,
  CourseData,
  EventPeriod,
  ScrapedClassDTO,
  SelectedClasses,
} from '../../interfaces/Periods';
import timeoutPromise from '../../utils/timeoutPromise';

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

//////////////////////////////////////////////////////  CHANEL'S BE STUFF //////////////////////////////////////////////////////
export interface Friend {
  name: string;
  userId: string;
  // show next event within the hour
  currentActivity: CurrentActivity | null;
}

export type FriendsList = Friend[];

export type CurrentActivity = {
  type: 'class' | 'event';
  start: Date;
  end: Date;
};

const getCurrentActivity = async (userId: string): Promise<CurrentActivity | null> => {
  // get the user's timetable data
  try {
    const res = await fetch(`${API_URL.server}/user/timetable/${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (res.status !== 200) throw new NetworkError("Couldn't get response");

    const friendTimetablesStatus = await res.json();
    const friendTimetables = friendTimetablesStatus.data;

    if (friendTimetables.length === 0) {
      return null;
    }

    const mainTimetable = friendTimetables[0];
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

    // const classesList: ClassPeriod[] = mainTimetable.selectedClasses.map((classDTO: any) => {
    //   return {
    //     type: 'class',
    //     classId: classDTO.classID,
    //     courseCode: classDTO.courseCode,
    //     activity: classDTO.activity,
    //     subActivity: classDTO.subActivity,
    //     time: classDTO.time,
    //     locations: classDTO.locations,
    //   };
    // });

    // console.log('classeslIST', classesList);

    // const eventsList: EventPeriod[] = mainTimetable.createdEvents.map((eventDTO: any) => {
    //   return {
    //     type: 'event',
    //     subtype: eventDTO.subtype,
    //     time: {
    //       day: eventDTO.day,
    //       start: eventDTO.start,
    //       end: eventDTO.end,
    //     },
    //     event: {
    //       id: eventDTO.id,
    //       name: eventDTO.name,
    //       location: eventDTO.location,
    //       description: eventDTO.description || '',
    //       color: eventDTO.colour,
    //     },
    //   };
    // });
    // console.log('eventsList', eventsList);

    return findCurrentActivity(mainTimetable.selectedClasses, mainTimetable.createdEvents, new Date());
  } catch (error) {
    console.log('error', error);
    throw new NetworkError('Could not connect to server');
  }
};

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

const findCurrentActivity = (courseInfos: CourseData[], events: EventPeriod[], now: Date): CurrentActivity | null => {
  for (const courseInfo of courseInfos) {
    for (const courseClass of Object.values(courseInfo.activities)) {
      for (const classData of courseClass) {
        for (const period of classData.periods) {
          const classStart = new Date(period.time.start);
          const classEnd = new Date(period.time.end);

          if (classStart <= now && now <= classEnd) {
            return { ...courseClass, type: 'class', start: classStart, end: classEnd } as CurrentActivity;
          }
        }
      }
    }
  }

  for (const event of events) {
    const eventStart = new Date(event.time.start);
    const eventEnd = new Date(event.time.end);

    if (eventStart <= now && now <= eventEnd) {
      return { ...event, type: 'event', start: eventStart, end: eventEnd } as CurrentActivity;
    }
  }

  return null;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const FriendsActivity = () => {
  const { user } = useContext(UserContext);

  useEffect(() => {
    // TODO: fix this integration here
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
            <UserNameText>Rayian Ahmed</UserNameText>
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
            <UserNameText>Rayian Ahmed</UserNameText>
            <UserActivity>Currently teaching</UserActivity>
          </TextContainer>
        </UserDetailsContainer>
        <ClassLocationContainer>
          <Location>COMP1531 at TablaK17G7</Location>
          <ClassTime>14:00 - 16:00</ClassTime>
        </ClassLocationContainer>
      </FriendContainer>
    </Container>
  );
};

export default FriendsActivity;
