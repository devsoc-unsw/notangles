import React, { FunctionComponent } from 'react';
import { CourseData, ClassData } from '@notangles/common';
import { Dropzone } from './Dropzone';

interface ClassDropzoneProps {
  course: CourseData
  color: string
  onSelectClass(classData: ClassData): void
  earliestStartTime: number
}

const ClassDropzone: FunctionComponent<ClassDropzoneProps> = ({
  course,
  color,
  onSelectClass,
  earliestStartTime,
}) => {
  const dropzones = Object.values(course.activities).map(
    (classDatas) => classDatas.map(
      (classData) => classData.periods.map(
        (period, i) => (
          <Dropzone
            key={`${classData.id}-${i}`}
            courseCode={course.code}
            activity={classData.activity}
            classTime={period}
            color={color}
            earliestStartTime={earliestStartTime}
            onDrop={() => onSelectClass(classData)}
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
  onSelectClass(classData: ClassData): void
  earliestStartTime: number
}

const ClassDropzones: FunctionComponent<ClassDropzonesProps> = ({
  selectedCourses,
  assignedColors,
  onSelectClass,
  earliestStartTime,
}) => {
  const dropzones = selectedCourses.map((course) => (
    <ClassDropzone
      earliestStartTime={earliestStartTime}
      key={course.code}
      course={course}
      color={assignedColors[course.code]}
      onSelectClass={onSelectClass}
    />
  ));
  return <>{dropzones}</>;
};

export default ClassDropzones;
