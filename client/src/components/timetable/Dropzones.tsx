import React, { JSX, useContext } from 'react';

import { useGetUserSettingsQuery } from '../../api/user/queries';
import { inventoryDropzoneOpacity } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { DropzoneGroupProps, DropzonesProps } from '../../interfaces/PropTypes';
import { areDuplicatePeriods } from '../../utils/areDuplicatePeriods';
import { getAllPeriods } from '../../utils/getAllPeriods';
import Dropzone from './Dropzone';

const DropzoneGroup: React.FC<DropzoneGroupProps> = ({ courseActivities, color, earliestStartTime }) => {
  const { hideFullClasses, hideExamClasses } = useGetUserSettingsQuery();

  // Show only open classes if setting is toggled on
  if (hideFullClasses) {
    Object.keys(courseActivities).forEach((activity) => {
      courseActivities[activity] = courseActivities[activity].filter((classData) => classData.status === 'Open');
    });
  }

  // Hide exam classes dropzones if isHideExamClasses setting is toggled on
  if (hideExamClasses && 'Exam' in courseActivities) delete courseActivities.Exam;

  // Filter out duplicate class periods
  Object.keys(courseActivities).forEach((activity) => {
    const allPeriods = getAllPeriods(courseActivities, activity);

    courseActivities[activity].forEach((classData) => {
      classData.periods = classData.periods.filter((period) => {
        const duplicates = allPeriods.filter((other) => areDuplicatePeriods(period, other));

        return duplicates[0] === period;
      });
    });
  });

  // Filter out classes with no periods
  Object.keys(courseActivities).forEach((activity) => {
    courseActivities[activity] = courseActivities[activity].filter((classData) => classData.periods.length !== 0);
  });

  // Filter out activities with no classes
  courseActivities = Object.fromEntries(
    Object.entries(courseActivities).filter(([_, classes]) => classes.length !== 0),
  );

  const dropzones = Object.values(courseActivities).flatMap((classDatas) =>
    classDatas.flatMap((classData) =>
      classData.periods.flatMap((period, i) => (
        <Dropzone
          key={`${classData.id}-${String(i)}`}
          classPeriod={period}
          x={period.time.day + 1}
          color={color}
          earliestStartTime={earliestStartTime}
        />
      )),
    ),
  );

  return <>{dropzones}</>;
};

const Dropzones: React.FC<DropzonesProps> = ({ courseActivities }) => {
  const { earliestStartTime, selectedCourses } = useContext(AppContext);
  const { isDarkMode } = useGetUserSettingsQuery();

  const dropzones: JSX.Element[] = [];
  for (const [courseId, course] of Object.entries(selectedCourses)) {
    dropzones.push(
      <DropzoneGroup
        key={courseId}
        courseActivities={courseActivities[courseId]}
        color={course.color}
        earliestStartTime={earliestStartTime}
      />,
    );
  }

  const inventoryColor = isDarkMode ? '255, 255, 255' : '0, 0, 0';

  // inventory
  dropzones.push(
    <Dropzone
      isInventory
      key="inventory"
      classPeriod={null} // inventory has no corresponding class period
      x={-2}
      color={`rgba(${inventoryColor}, ${String(inventoryDropzoneOpacity)})`}
      earliestStartTime={earliestStartTime}
    />,
  );
  return <>{dropzones}</>;
};

export default Dropzones;
