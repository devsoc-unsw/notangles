import React, { FunctionComponent } from 'react';
import { CourseData } from '../../interfaces/CourseData';
import { Dropzone } from './Dropzone';

interface ClassDropzoneProps {
  course: CourseData
  color: string
}

const ClassDropzone: FunctionComponent<ClassDropzoneProps> = ({
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
};

interface ClassDropzonesProps {
  selectedCourses: CourseData[]
  assignedColors: Record<string, string>
}

const ClassDropzones: FunctionComponent<ClassDropzonesProps> = ({
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
};

export default ClassDropzones;
