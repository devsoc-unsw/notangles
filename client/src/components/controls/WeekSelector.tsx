import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Button, FormControl, IconButton, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useContext } from 'react';

import { AppContext } from '../../context/AppContext';
import { ViewType } from '../../interfaces/Calendar';

const WeekSelector = () => {
  const fullWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const { currentDate, setCurrentDate, calendarView, setCalendarView, setDays } = useContext(AppContext);

  const modifyDate = (isIncrement: boolean) => {
    const step: number = calendarView === ViewType.WEEK ? 7 : 1;

    return () => {
      const newDate = new Date(currentDate);
      // For a month view, let's just set the date (for simplicity) and reset the date to 1
      if (calendarView === ViewType.MONTH) {
        newDate.setMonth(isIncrement ? newDate.getMonth() + step : newDate.getMonth() - step);
      } else {
        newDate.setDate(isIncrement ? newDate.getDate() + step : newDate.getDate() - step);
      }

      // Update days view if we are in days view
      if (calendarView === ViewType.DAY) {
        setDays([fullWeek[(newDate.getDay() + 6) % 7]]);
      }

      setCurrentDate(newDate);
    };
  };

  const modifyView = () => {
    return (event: SelectChangeEvent) => {
      const newView = event.target.value as ViewType;
      setCalendarView(newView);

      let newDays: string[];
      switch (newView) {
        case ViewType.DAY:
          newDays = [fullWeek[(currentDate.getDay() + 6) % 7]];
          break;
        case ViewType.WEEK:
        case ViewType.MONTH: // TODO MONTH, not sure implementation
        default:
          newDays = fullWeek.slice(0, 5);
      }

      setDays(newDays);
    };
  };

  return (
    <div>
      {currentDate.toLocaleString()}
      <div>
        <IconButton onClick={modifyDate(false)}>
          <ChevronLeft />
        </IconButton>
        <Button variant="contained" color="primary" onClick={() => setCurrentDate(new Date())}>
          Today
        </Button>
        <IconButton onClick={modifyDate(true)}>
          <ChevronRight />
        </IconButton>
      </div>
      <FormControl>
        <InputLabel>View</InputLabel>
        <Select value={calendarView} onChange={modifyView()}>
          <MenuItem value={ViewType.DAY}>Day</MenuItem>
          <MenuItem value={ViewType.WEEK}>Week</MenuItem>
          <MenuItem value={ViewType.MONTH}>Month</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default WeekSelector;
