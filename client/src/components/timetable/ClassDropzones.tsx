import React, { FunctionComponent } from 'react';
import { withTheme } from 'styled-components';
import Dropzone from './Dropzone';
import { CourseData } from '../../interfaces/CourseData';
import { CourseData, ClassData } from '@notangles/common';
import { timeToPosition } from '../../utils/Drag';
import { inventoryDropzoneOpacity } from '../../constants/theme';

interface Theme {
  palette: {
    type: string
  }
}

interface ClassDropzoneProps {
  course: CourseData
  color: string
  theme: Theme
  earliestStartTime: number
}

const DropzoneGroup: FunctionComponent<ClassDropzoneProps> = React.memo(({
  course,
  color,
  theme,
  earliestStartTime
}) => {
  const dropzones = Object.values(course.activities).flatMap(
    (classDatas) => classDatas.flatMap(
      (classData) => classData.periods.flatMap(
        (period, i) => (
          <Dropzone
            key={`${classData.id}-${i}`}
            classPeriod={period}
            x={period.time.day + 1}
            y={timeToPosition(period.time.start)}
            color={color}
            earliestStartTime={earliestStartTime}
          />
        ),
      ),
    ),
  );

  const inventoryColor = theme?.palette?.type === 'dark' ? '255, 255, 255' : '0, 0, 0';

  // inventory
  dropzones.push(
    <Dropzone
      key="inventory"
      classPeriod={null} // inventory has no corresponding class period
      x={-2}
      y={2}
      yEnd={-1}
      color={`rgba(${inventoryColor}, ${inventoryDropzoneOpacity})`}
      isInventory
    />,
  );

  return <>{dropzones}</>;
}, (prev, next) => !(
  prev.theme !== next.theme
  || prev.color !== next.color
  || prev.course.code !== next.course.code
));

const ThemedDropzoneGroup = withTheme(DropzoneGroup);

interface ClassDropzonesProps {
  selectedCourses: CourseData[]
  assignedColors: Record<string, string>
  earliestStartTime: number
}

const ClassDropzones: FunctionComponent<ClassDropzonesProps> = React.memo(({
  selectedCourses,
  assignedColors,
  earliestStartTime,
}) => {
  const dropzones = selectedCourses.map((course) => (
    <ThemedDropzoneGroup
      key={course.code}
      course={course}
      color={assignedColors[course.code]}
      earliestStartTime={earliestStartTime}
    />
  ));
  return <>{dropzones}</>;
}, (prev, next) => !(
  prev.selectedCourses.length !== next.selectedCourses.length
  || prev.selectedCourses.some((course, i) => course.code !== next.selectedCourses[i].code)
  || JSON.stringify(prev.assignedColors) !== JSON.stringify(next.assignedColors)
));

export default ClassDropzones;
