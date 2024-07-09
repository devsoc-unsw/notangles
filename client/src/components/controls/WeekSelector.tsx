import React, { useContext } from 'react';
import { Button, IconButton } from '@mui/material';
import { CourseContext } from '../../context/CourseContext';
import { AppContext } from '../../context/AppContext';
import { ArrowBack, ChevronLeft, ChevronRight } from '@mui/icons-material';

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
      <IconButton onClick={handleBackClick}>
        <ChevronLeft />
      </IconButton>
      <Button variant="contained" color="primary" onClick={() => setCurrentDate(new Date())}>
        Today
      </Button>
      <IconButton onClick={handleForwardClick}>
        <ChevronRight />
      </IconButton>
    </div>
  );
};

export default WeekSelector;
