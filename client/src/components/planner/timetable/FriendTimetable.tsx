// TODO: Replace the mock classes/events with a real query once the backend can return a friend's timetable
// (every existing timetable route only returns the logged-in user's own data)
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useMemo } from 'react';
import { useParams } from 'react-router';

import { useFriendsQuery } from '../../../api/friendship/queries';
import { convertClassToLocalTimezone, Term, useCoursesClassTimesQuery } from '../../../api/times/times';
import { TimetableCourse, TimetableEvent } from '../../../api/timetable/routes';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import FriendGrid from './FriendGrid';
import mockFriendClasses from './mockFriendClasses.json';
import mockFriendEvents from './mockFriendEvents.json';

// Imports JSON objects as mockFriendEvents and mockFriendClasses
const mockEvents = mockFriendEvents as Record<string, TimetableEvent[]>;
const mockCourses = mockFriendClasses as Record<string, TimetableCourse[]>;
// Shared empty list so terms without mock courses don't create a new array every render
const noCourses: TimetableCourse[] = [];

// Message shown in place of the timetable
const StyledMessage = styled(Typography)`
  margin: 64px 0;
  text-align: center;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const FriendTimetable: React.FC<{ term: Term }> = ({ term }) => {
  // Id from the /friend/:friendId route
  const { friendId } = useParams();
  // undefined if the id isn't on the user's friends list
  const friend = useFriendsQuery().find((f) => f.id === friendId);

  // Array of events to put on calendar
  const events = term.term in mockEvents ? mockEvents[term.term] : [];
  // Courses the friend is taking, with the class ids they picked
  const courses = term.term in mockCourses ? mockCourses[term.term] : noCourses;

  // Class times come from the real scraped data, the same way as Timetable
  const rawClassTimes = useCoursesClassTimesQuery(
    courses.map((c) => c.courseId),
    term.year,
    term.term,
  );
  const { convertToLocalTimezone } = useGetUserSettingsQuery();

  // Only keep the friend's picked classes, so unpicked options don't stretch the grid or fill the side column
  const classTimes = useMemo(() => {
    const selectedClassIds = new Set(courses.flatMap((c) => c.selectedClasses));
    const pickedClasses = rawClassTimes.filter((cls) => selectedClassIds.has(cls.class_id));
    return convertToLocalTimezone ? pickedClasses.map(convertClassToLocalTimezone) : pickedClasses;
  }, [courses, rawClassTimes, convertToLocalTimezone]);

  // e.g. the friend was removed, or the URL was typed in by hand
  if (!friend) {
    return <StyledMessage>{"This person isn't on your friends list"}</StyledMessage>;
  }

  if (events.length === 0 && courses.length === 0) {
    return <StyledMessage>No timetable for this term yet</StyledMessage>;
  }

  return (
    <FriendGrid
      key={[term.year, term.term].join('-')}
      timetableId="mock-friend"
      courses={courses}
      classTimes={classTimes}
      events={events}
    />
  );
};

export default FriendTimetable;
