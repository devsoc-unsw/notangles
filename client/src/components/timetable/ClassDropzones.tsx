import React, { FunctionComponent } from 'react';
import { CourseData } from '../../interfaces/CourseData';
import { Dropzone } from './Dropzone';
import { timeToPosition } from '../../utils/Drag';
import { withTheme } from 'styled-components';
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
}

const DropzoneGroup: FunctionComponent<ClassDropzoneProps> = React.memo(({
  course,
  color,
  theme,
}) => {
  const dropzones = Object.values(course.activities).flatMap(
    (classDatas) => classDatas.flatMap(
      (classData) => classData.periods.flatMap(
        (period, i) => (
          <Dropzone
            key={`${classData.id}-${i}`}
            classPeriod={period}
            x={period.time.day + 1}
            yStart={timeToPosition(period.time.start)}
            yEnd={timeToPosition(period.time.end)}
            color={color}
          />
        ),
      ),
    ),
  );

  const inventoryColor = theme?.palette?.type === "dark" ? "255, 255, 255" : "0, 0, 0";

  // inventory
  dropzones.push(
    <Dropzone
      key="inventory"
      classPeriod={null} // inventory has no corresponding class period
      x={-2}
      yStart={2}
      yEnd={-1}
      color={`rgba(${inventoryColor}, ${inventoryDropzoneOpacity})`}
      isInventory
    />
  )

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
}

const ClassDropzones: FunctionComponent<ClassDropzonesProps> = React.memo(({
  selectedCourses,
  assignedColors,
}) => {
  const dropzones = selectedCourses.map((course) => (
    <ThemedDropzoneGroup
      key={course.code}
      course={course}
      color={assignedColors[course.code]}
    />
  ));
  return <>{dropzones}</>;
}, (prev, next) => !(
  prev.selectedCourses.length !== next.selectedCourses.length
  || prev.selectedCourses.some((course, i) => course.code !== next.selectedCourses[i].code)
  || JSON.stringify(prev.assignedColors) !== JSON.stringify(next.assignedColors)
));

export default ClassDropzones;
