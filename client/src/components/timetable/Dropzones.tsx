import React, { useContext } from 'react';
import { inventoryDropzoneOpacity } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Activity, ClassData } from '../../interfaces/Periods';
import { DropzoneGroupProps, DropzonesProps } from '../../interfaces/PropTypes';
import { areDuplicatePeriods } from '../../utils/areDuplicatePeriods';
import { getAllPeriods } from '../../utils/getAllPeriods';
import Dropzone from './Dropzone';

const DropzoneGroup: React.FC<DropzoneGroupProps> = ({ course, color, earliestStartTime }) => {
  const { isShowOnlyOpenClasses, isHideExamClasses } = useContext(AppContext);

  // Deep-ish copy of activities (so we can combine duplicates without affecting original)
  let newActivities: Record<Activity, ClassData[]> = {};

  // Copy over course activities
  Object.keys(course.activities).forEach((activity) => {
    newActivities[activity] = [];

    course.activities[activity].forEach((classData) => {
      const newClassData = { ...classData };
      newClassData.periods = [...classData.periods];
      newActivities[activity].push(newClassData);
    });
  });

  // Show only open classes if setting is toggled on
  if (isShowOnlyOpenClasses) {
    Object.keys(newActivities).forEach((activity) => {
      newActivities[activity] = newActivities[activity].filter((classData) => classData.status === 'Open');
    });
  }

  // Hide exam classes dropzones if isHideExamClasses setting is toggled on
  if (isHideExamClasses && 'Exam' in newActivities) delete newActivities['Exam'];

  // Filter out duplicate class periods
  Object.keys(newActivities).forEach((activity) => {
    const allPeriods = getAllPeriods(newActivities, activity);

    newActivities[activity].forEach((classData) => {
      classData.periods = classData.periods.filter((period) => {
        const duplicates = allPeriods.filter((other) => areDuplicatePeriods(period, other));

        return duplicates[0] === period;
      });
    });
  });

  // Filter out classes with no periods
  Object.keys(newActivities).forEach((activity) => {
    newActivities[activity] = newActivities[activity].filter((classData) => classData.periods.length !== 0);
  });

  // Filter out activities with no classes
  newActivities = Object.fromEntries(Object.entries(newActivities).filter(([_, classes]) => classes.length !== 0));

  const dropzones = Object.values(newActivities).flatMap((classDatas) =>
    classDatas.flatMap((classData) =>
      classData.periods.flatMap((period, i) => (
        <Dropzone
          key={`${classData.id}-${i}`}
          classPeriod={period}
          x={period.time.day + 1}
          color={color}
          earliestStartTime={earliestStartTime}
        />
      ))
    )
  );

  return <>{dropzones}</>;
};

const Dropzones: React.FC<DropzonesProps> = ({ assignedColors }) => {
  const { isDarkMode, earliestStartTime } = useContext(AppContext);
  const { selectedCourses } = useContext(CourseContext);

  const dropzones = selectedCourses.map((course) => (
    <DropzoneGroup key={course.code} course={course} color={assignedColors[course.code]} earliestStartTime={earliestStartTime} />
  ));

  const inventoryColor = isDarkMode ? '255, 255, 255' : '0, 0, 0';

  // inventory
  dropzones.push(
    <Dropzone
      isInventory
      key="inventory"
      classPeriod={null} // inventory has no corresponding class period
      x={-2}
      color={`rgba(${inventoryColor}, ${inventoryDropzoneOpacity})`}
      earliestStartTime={earliestStartTime}
    />
  );
  return <>{dropzones}</>;
};

export default Dropzones;
