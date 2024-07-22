import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Button, FormControl, IconButton, InputLabel, MenuItem, Select } from '@mui/material';
import { useContext } from 'react';

import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { ViewType } from '../../interfaces/Calendar';

const WeekSelector = () => {
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { currentDate, setCurrentDate, calendarView, setCalendarView } = useContext(AppContext);

  const handleBackClick = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleForwardClick = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  return (
    <div>
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
      <FormControl>
        <InputLabel>View</InputLabel>
        <Select value={calendarView} onChange={() => setCalendarView(calendarView)}>
          <MenuItem value={ViewType.DAY}>Day</MenuItem>
          <MenuItem value={ViewType.WEEK}>Week</MenuItem>
          <MenuItem value={ViewType.MONTH}>Month</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default WeekSelector;
