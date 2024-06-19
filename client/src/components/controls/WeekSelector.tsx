import React, { useContext } from 'react';
import { Button } from '@mui/material';
import { CourseContext } from '../../context/CourseContext';
import { AppContext } from '../../context/AppContext';

const WeekSelector = () => {
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { currentDate, setCurrentDate } = useContext(AppContext);

  const handleBackClick = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleForwardClick = () => {
    console.log('created events', createdEvents);
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleBackClick}>
        Back
      </Button>
      <Button variant="contained" color="primary" onClick={handleForwardClick}>
        Forward
      </Button>
    </div>
  );
};

export default WeekSelector;
