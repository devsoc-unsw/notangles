import styled from '@emotion/styled';
import React, { useContext } from 'react';

import { unknownErrorMessage } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { ClassData } from '../../interfaces/Periods';
import Timetable from '../timetable/Timetable';
import ActivityBar from './ActivityBar';
import GroupInfoNavbar from './GroupInfoNavbar';

const Container = styled('div')`
  margin-top: 80px;
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
  return (
    <Container>
      <GroupInfoNavbar />
      <Timetable assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
    </Container>
  );
};

export default Friends;
