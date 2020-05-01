import React, { FunctionComponent } from 'react';
import { CourseData } from '../../interfaces/CourseData';
import { Dropzone } from './Dropzone';

interface ClassDropzoneProps {
  course: CourseData
  color: string
  onSelectClass(classId: string): void
}

const ClassDropzone: FunctionComponent<ClassDropzoneProps> = ({
  course,
  color,
  onSelectClass,
}) => {
  const dropzones = Object.values(course.classes).map(
    (classDatas) => classDatas.map(
      (classData) => classData.periods.map(
        (period, i) => (
          <Dropzone
            key={`${classData.classId}-${i}`}
            courseCode={course.courseCode}
            activity={classData.activity}
            classTime={period}
            color={color}
            onDrop={() => onSelectClass(classData.classId)}
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
  onSelectClass(classId: string): void
}

const ClassDropzones: FunctionComponent<ClassDropzonesProps> = ({
  selectedCourses,
  assignedColors,
  onSelectClass,
}) => {
  const dropzones = selectedCourses.map((course) => (
    <ClassDropzone
      key={course.courseCode}
      course={course}
      color={assignedColors[course.courseCode]}
      onSelectClass={onSelectClass}
    />
  ));
  return <>{dropzones}</>;
};

export default ClassDropzones;
