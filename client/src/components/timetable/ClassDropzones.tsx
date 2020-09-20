import React, { FunctionComponent } from 'react';
import { CourseData } from '../../interfaces/CourseData';
import { Dropzone } from './Dropzone';
import { timeToPosition } from '../../utils/Drag';

interface ClassDropzoneProps {
  course: CourseData
  color: string
}

const ClassDropzone: FunctionComponent<ClassDropzoneProps> = React.memo(({
  course,
  color,
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

  // inventory
  dropzones.push(
    <Dropzone
      key="inventory"
      classPeriod={null} // inventory is signified by null
      x={-2}
      yStart={2}
      yEnd={-1}
      color="red"
    />
  )

  return <>{dropzones}</>;
}, (prev, next) => !(
  prev.course.code !== next.course.code || prev.color !== next.color
));

interface ClassDropzonesProps {
  selectedCourses: CourseData[]
  assignedColors: Record<string, string>
}

const ClassDropzones: FunctionComponent<ClassDropzonesProps> = React.memo(({
  selectedCourses,
  assignedColors,
}) => {
  const dropzones = selectedCourses.map((course) => (
    <ClassDropzone
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
