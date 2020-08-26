import React, { FunctionComponent } from 'react';
import { CourseData } from '../../interfaces/CourseData';
import { Dropzone } from './Dropzone';

interface ClassDropzoneProps {
  course: CourseData
  color: string
}

const ClassDropzone: FunctionComponent<ClassDropzoneProps> = React.memo(({
  course,
  color,
}) => {
  const dropzones = Object.values(course.activities).map(
    (classDatas) => classDatas.map(
      (classData) => classData.periods.map(
        (period, i) => (
          <Dropzone
            key={`${classData.id}-${i}`}
            classPeriod={period}
            color={color}
          />
        ),
      ),
    ),
  );
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
