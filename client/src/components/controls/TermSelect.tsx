import { FormControl, InputLabel, MenuItem, Select, SelectProps, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext, useImperativeHandle, useState } from 'react';

import { ThemeType } from '../../constants/theme';
import { convertToTermName } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  color: '#ffffff',
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  color: '#ffffff',
  height: '55px',
  width: '100%',
  backgroundColor: theme.palette.primary.main,
  transition: 'background-color 0.1s ease-in',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
  '.MuiSelect-icon': {
    color: '#ffffff',
  },
  '&.Mui-focused .MuiSelect-icon': {
    color: '#ffffff',
  },
  '&:hover .MuiSelect-icon': {
    color: '#ffffff',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'transparent',
  },
  '&:hover': {
    backgroundColor: '#598dff',
  },
}));

const CustomStyledSelect = React.forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
  return (
    <StyledSelect
      {...props}
      ref={ref}
      MenuProps={{
        PaperProps: {
          style: {
            width: '200px',
          },
        },
      }}
    />
  );
});

export interface TermSelectProps {}

export interface TermSelectHandle {
  open: () => void;
}

const TermSelect = React.forwardRef<TermSelectHandle, TermSelectProps>((props, ref) => {
  const { term, termName, setTermName, year, setTerm, setYear, setSelectedTimetable, displayTimetables, termsData } =
    useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents, setAssignedColors } = useContext(CourseContext);

  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);

  const termDataStrList = termsData.map((val) => {
    return `${convertToTermName(val)}, ${val?.substring(2)}`;
  });

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  const selectTerm = (e: any) => {
    const defaultStartTimetable = 0;
    // Convert to Term data
    const termValue = e.target.value;
    const termInfo = termValue.split(', ');

    let termPrefix = '';
    if (termInfo[0].includes('Summer')) {
      termPrefix = 'U1';
    } else {
      termPrefix = 'T' + termInfo[0].split(' ')[1];
    }

    const newYear = termInfo[1];

    const termName = termPrefix + newYear; // To get a string like T12024
    setTerm(termName);
    setYear(newYear);
    setTermName(convertToTermName(termName));
    setSelectedTimetable(defaultStartTimetable);
    setSelectedClasses(displayTimetables[termName][defaultStartTimetable].selectedClasses);
    setCreatedEvents(displayTimetables[termName][defaultStartTimetable].createdEvents);
    setSelectedCourses(displayTimetables[termName][defaultStartTimetable].selectedCourses);
    setAssignedColors(displayTimetables[termName][defaultStartTimetable].assignedColors);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <FormControl>
      <CustomStyledSelect
        size="small"
        labelId="select-term-label"
        id="select-term"
        label="Select term"
        open={open}
        onClose={handleClose}
        onOpen={handleOpen}
        value={termName !== '' ? termName.concat(', ', term.substring(2)) : ''}
        onChange={selectTerm}
      >
        {Array.from(termDataStrList).map((term, index) => {
          return (
            <MenuItem key={index} value={term}>
              {term}
            </MenuItem>
          );
        })}
      </CustomStyledSelect>
    </FormControl>
  );
});

export default TermSelect;
