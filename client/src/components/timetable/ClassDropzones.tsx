import React, { FunctionComponent } from 'react';
import { withTheme } from 'styled-components';
import {
  CourseData, ClassPeriod, Activity, ClassData,
} from '../../interfaces/Course';
import Dropzone from './Dropzone';
import { timeToPosition } from '../../utils/Drag';
import { inventoryDropzoneOpacity } from '../../constants/theme';

interface ClassDropzoneProps {
  course: CourseData
  color: string
  earliestStartTime: number
}

// beware memo - if a component isn't re-rendering, it could be why
const DropzoneGroup: FunctionComponent<ClassDropzoneProps> = React.memo(({
  course,
  color,
  earliestStartTime,
}) => {
  // Deep-ish copy of activities (so we can combine duplicates without affecting original)

  let newActivities: Record<Activity, ClassData[]> = {};

  Object.keys(course.activities).forEach((activity) => {
    newActivities[activity] = [];

    course.activities[activity].forEach((classData) => {
      const newClassData = { ...classData };
      newClassData.periods = [...classData.periods];
      newActivities[activity].push(newClassData);
    });
  });

  const isDuplicate = (a: ClassPeriod, b: ClassPeriod) => (
    a.time.day === b.time.day
    && a.time.start === b.time.start
    && a.time.end === b.time.end
  );

  Object.keys(newActivities).forEach((activity) => {
    let allPeriods: ClassPeriod[] = [];

    newActivities[activity].forEach((classData) => {
      allPeriods = [...allPeriods, ...classData.periods];
    });

    newActivities[activity].forEach((classData) => {
      classData.periods = classData.periods.filter((period) => { // TODO
        const duplicates = allPeriods.filter((other) => isDuplicate(period, other));

        return duplicates[0] === period;
      });
    });
  });

  Object.keys(newActivities).forEach((activity) => {
    newActivities[activity] = newActivities[activity].filter( // TODO
      (classData) => (classData.periods.length !== 0),
    );
  });

  newActivities = Object.fromEntries(
    Object.entries(newActivities).filter(([_, classes]) => (classes.length !== 0)),
  );

  const dropzones = Object.values(newActivities).flatMap(
    (classDatas) => classDatas.flatMap(
      (classData) => classData.periods.flatMap(
        (period, i) => (
          <Dropzone
            key={`${classData.id}-${i}`}
            classPeriod={period}
            x={period.time.day + 1}
            y={timeToPosition(period.time.start, earliestStartTime)}
            color={color}
            earliestStartTime={earliestStartTime}
          />
        ),
      ),
    ),
  );

  return <>{dropzones}</>;
}, (prev, next) => !(
  prev.color !== next.color
  || prev.earliestStartTime !== next.earliestStartTime
  || prev.course.code !== next.course.code
));

interface Theme {
  palette: {
    type: string
  }
}

interface ClassDropzonesProps {
  selectedCourses: CourseData[]
  assignedColors: Record<string, string>
  earliestStartTime: number
  theme: Theme
}

// beware memo - if a component isn't re-rendering, it could be why
const ClassDropzones: FunctionComponent<ClassDropzonesProps> = React.memo(({
  selectedCourses,
  assignedColors,
  earliestStartTime,
  theme,
}) => {
  const dropzones = selectedCourses.map((course) => (
    <DropzoneGroup
      key={course.code}
      course={course}
      color={assignedColors[course.code]}
      earliestStartTime={earliestStartTime}
    />
  ));

  const inventoryColor = theme.palette.type === 'dark' ? '255, 255, 255' : '0, 0, 0';

  // inventory
  dropzones.push(
    <Dropzone
      isInventory
      key="inventory"
      classPeriod={null} // inventory has no corresponding class period
      x={-2}
      y={2}
      yEnd={-1}
      color={`rgba(${inventoryColor}, ${inventoryDropzoneOpacity})`}
      earliestStartTime={earliestStartTime}
    />,
  );

  return <>{dropzones}</>;
}, (prev, next) => !(
  prev.theme !== next.theme
  || prev.selectedCourses.length !== next.selectedCourses.length
  || prev.earliestStartTime !== next.earliestStartTime
  || prev.selectedCourses.some((course, i) => course.code !== next.selectedCourses[i].code)
  || JSON.stringify(prev.assignedColors) !== JSON.stringify(next.assignedColors)
));

export default withTheme(ClassDropzones);
