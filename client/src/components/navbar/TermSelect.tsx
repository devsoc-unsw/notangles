import { FormControl, InputLabel, MenuItem, Select, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext } from 'react';

import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';

const StyledInputLabel = styled(InputLabel)(() => ({
  '&.Mui-focused': {
    color: '#3323e4',
  },
}));

const StyledSelect = styled(Select)(() => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#3323e4',
  },
  '.MuiSelect-selectMenu': {
    overflow: 'hidden',
  },
  '.MuiSelect-icon': {
    color: '#3323e4',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#3323e4',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#3323e4',
  },
}));

const Weak = styled('span')`
  font-weight: 300;
  opacity: 0.8;
  margin-left: 15px;
  font-size: 90%;
  vertical-align: middle;
  position: relative;
  bottom: 1px;
  z-index: 1201;
`;
export interface TermSelectProps {
  collapsed: boolean;
}

const TermSelect: React.FC<TermSelectProps> = ({ collapsed }) => {
  const { term, termName, setTermName, year, setTerm, setYear, setSelectedTimetable, displayTimetables, termsData } =
    useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents, setAssignedColors } = useContext(CourseContext);

  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  let prevTermName = `Term ${termsData.prevTerm.term[1]}`;
  if (prevTermName.includes('Summer')) {
    prevTermName = 'Summer Term';
  }

  let newTermName = `Term ${termsData.newTerm.term[1]}`;
  if (newTermName.includes('Summer')) {
    newTermName ='Summer Term';
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
    setAssignedColors(displayTimetables[termNum][defaultStartTimetable].assignedColors);
  };

  return (
    <FormControl sx={{ width: '100%' }}>
      {collapsed ? (
        <>
          <Weak>{term}</Weak>
        </>
      ) : (
        <>
          <StyledInputLabel
            id="select-term-label"
            sx={{ color: '#3323e4d' }}
          >
            Select term
          </StyledInputLabel>
          <StyledSelect
            size="small"
            labelId="select-term-label"
            id="select-term"
            sx={{ color: '#3323e4d' }}
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
        </>
      )}
    </FormControl>
  );
};

export default TermSelect;
