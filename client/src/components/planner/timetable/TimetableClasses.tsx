import { styled } from '@mui/material/styles';

import type { TimetableClass } from '../../../api/times/times';
import type { TimetableCourse } from '../../../api/timetable/routes';
import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { decodeColor } from '../../../utils/colors';
import ClassCard from './ClassCard';
import { DAY_TO_INDEX, parseClassTimeRange } from './timetableTime';
import { useTimetableClasses } from './useTimetableClasses';

const UnscheduledColumn = styled('div')`
  display: contents;
`;

interface TimetableClassesProps {
  courses: TimetableCourse[];
  classes: TimetableClass[];
  dayCount: number;
  earliestStartHour: number;
}

const TimetableClasses = ({ courses, classes, dayCount, earliestStartHour }: TimetableClassesProps) => {
  const { preferredTheme, isSquareEdges, hideClassInfo } = useGetUserSettingsQuery();
  const { scheduledClasses, unscheduledActivities, unresolvedSelectedClassIds } = useTimetableClasses(courses, classes);

  const noTimeClasses = scheduledClasses.filter(({ classData }) => classData.times.length === 0);
  const unscheduledCards = [
    ...unscheduledActivities.map(({ course, activity, availableClasses }) => {
      const firstClass = availableClasses[0];
      return {
        key: `${course.courseId}-${activity}`,
        backgroundColour: decodeColor(course.colour, preferredTheme),
        title: `${firstClass.course.course_code} ${activity}`,
        details: hideClassInfo
          ? undefined
          : [availableClasses.length, `available class${availableClasses.length === 1 ? '' : 'es'}`].join(' '),
      };
    }),

    ...noTimeClasses.map(({ course, classData }) => ({
      key: `${classData.class_id}-no-time`,
      backgroundColour: decodeColor(course.colour, preferredTheme),
      title: `${classData.course.course_code} ${classData.activity}`,
      details: hideClassInfo ? undefined : `${classData.section} · No scheduled time`,
    })),

    ...unresolvedSelectedClassIds.map((classId) => ({
      key: classId,
      backgroundColour: '#777777',
      title: 'Selected class unavailable',
      details: hideClassInfo ? undefined : classId,
    })),
  ];

  return (
    <>
      {scheduledClasses.flatMap(({ course, classData }) =>
        classData.times.flatMap((classTime, index) => {
          const dayIndex = DAY_TO_INDEX[classTime.day];
          const timeRange = parseClassTimeRange(classTime.time);
          if (dayIndex === undefined || dayIndex >= dayCount || !timeRange) return [];

          return (
            <ClassCard
              key={[classData.class_id, classTime.day, classTime.time, index].join('-')}
              gridColumn={dayIndex + 2}
              offsetMinutes={timeRange.startMinutes - earliestStartHour * 60}
              durationMinutes={timeRange.endMinutes - timeRange.startMinutes}
              backgroundColour={decodeColor(course.colour, preferredTheme)}
              squareEdges={isSquareEdges}
              title={`${classData.course.course_code} ${classData.activity}`}
              details={hideClassInfo ? undefined : `${classData.section} · ${classTime.location}`}
            />
          );
        }),
      )}

      <UnscheduledColumn>
        {unscheduledCards.map(({ key, ...cardProps }, inventoryIndex) => (
          <ClassCard
            key={key}
            {...cardProps}
            gridColumn={dayCount + 3}
            inventoryIndex={inventoryIndex}
            squareEdges={isSquareEdges}
          />
        ))}
      </UnscheduledColumn>
    </>
  );
};

export default TimetableClasses;
