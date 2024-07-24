import { CurrentActivity, Friend, FriendsList } from '../interfaces/Friends';
import NetworkError from '../interfaces/NetworkError';
import { CourseCode, CourseData, EventPeriod } from '../interfaces/Periods';
import timeoutPromise from '../utils/timeoutPromise';
import { API_URL } from './config';
import getCourseInfo from './getCourseInfo';

const getCurrentActivity = async (userId: string): Promise<CurrentActivity | null> => {
    // get the user's timetable data
    const baseURL = `${API_URL.server}/user/timetable/${userId}`;
    try {
        const data = await timeoutPromise(1000, fetch(baseURL));
        const json = await data.json();
        if (data.status === 400) {
            throw new NetworkError('Internal server error');
        }

        const selectedCourses = json.selectedCourses;

        // TODO: find helpers for these - for now hardcoded
        const year = '2024';
        const term = 'T2';
        const isConvertToLocalTimezone = true;

        const courseInfos = await Promise.all(
            selectedCourses.map((courseCode: string) =>
                getCourseInfo(year, term, courseCode as CourseCode, isConvertToLocalTimezone)
            )
        );

        const now = new Date();
        return findCurrentActivity(courseInfos, json.createdEvents, now);
    } catch (error) {
        throw new NetworkError('Could not connect to server');
    }
};


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
}


const getAllFriends = async (userId: string): Promise<FriendsList> => {
    const baseURL = `${API_URL.server}/friend/findAllFriends/${userId}`;
    try {
        const data = await timeoutPromise(1000, fetch(baseURL));
        const json = await data.json();
        if (data.status === 400) {
            throw new NetworkError('Internal server error');
        }

        const friends: FriendsList = await Promise.all(json.data.map(async (friend: any) => ({
            name: friend.name,
            userId: friend.userId,
            currentActivity: await getCurrentActivity(friend.userId)
        })));

       return friends;
    } catch (error) {
        throw new NetworkError('Could not connect to server');
    }
};

export default getCurrentActivity;