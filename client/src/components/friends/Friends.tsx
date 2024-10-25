import styled from '@emotion/styled';
import React, { useContext } from 'react';

import { unknownErrorMessage } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { ClassData } from '../../interfaces/Periods';

const Container = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Friends = () => {
  const { assignedColors, setSelectedClasses } = useContext(CourseContext);
  const { setAlertMsg, setErrorVisibility } = useContext(AppContext);

  const handleSelectClass = (classData: ClassData) => {
    setSelectedClasses((prev) => {
      prev = { ...prev };

      try {
        prev[classData.courseCode][classData.activity] = classData;
      } catch (err) {
        setAlertMsg(unknownErrorMessage);
        setErrorVisibility(true);
      }

      return prev;
    });
  };

  return <Container></Container>;
};

export default Friends;
