import { FormControl, InputLabel, MenuItem, Select, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext } from 'react';

import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';

const StyledSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'white',
  },
  '.MuiSelect-icon': {
    color: 'white',
  },
  '&:focus': {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'white',
    },
  },
}));

const TermSelect: React.FC = () => {
  const { term, termName, setTermName, year, setTerm, setYear, setSelectedTimetable, displayTimetables, termsData } =
    useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents } = useContext(CourseContext);

  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  let prevTermName = `Term ${termsData.prevTerm.term[1]}`;
  if (prevTermName.includes('Summer')) {
    prevTermName = 'Summer Term';
  }

  let newTermName = `Term ${termsData.newTerm.term[1]}`;
  if (newTermName.includes('Summer')) {
    newTermName = 'Summer Term';
  }

  const termData = new Set([
    ...(termsData.prevTerm.term.length > 0 ? [`${prevTermName}, ${termsData.prevTerm.year}`] : []),
    `${newTermName}, ${termsData.newTerm.year}`,
  ]);

  const selectTerm = (e: any) => {
    const defaultStartTimetable = 0;

    const newTermName = e.target.value.split(', ')[0];
    let termNum = 'T' + newTermName.split(' ')[1];
    const newYear = e.target.value.split(', ')[1];

    if (e.target.value.includes('Summer')) {
      // This is a summer term.
      termNum = 'Summer';
    }

    setTerm(termNum);
    setYear(newYear);
    setTermName(newTermName);
    setSelectedTimetable(defaultStartTimetable);
    setSelectedClasses(displayTimetables[termNum][defaultStartTimetable].selectedClasses);
    setCreatedEvents(displayTimetables[termNum][defaultStartTimetable].createdEvents);
    setSelectedCourses(displayTimetables[termNum][defaultStartTimetable].selectedCourses);
  };

  return (
    <FormControl sx={{ paddingRight: '15px' }}>
      <InputLabel id="select-term-label" sx={{ color: 'white' }}>
        Select term
      </InputLabel>
      <StyledSelect
        size="small"
        labelId="select-term-label"
        id="select-term"
        sx={{ color: 'white' }}
        label="Select term"
        value={isMobile ? term : termName.concat(', ', year)}
        onChange={selectTerm}
      >
        {Array.from(termData).map((term, index) => {
          return (
            <MenuItem key={index} value={term}>
              {term}
            </MenuItem>
          );
        })}
      </StyledSelect>
    </FormControl>
  );
};

export default TermSelect;
