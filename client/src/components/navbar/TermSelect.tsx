import { useMediaQuery, useTheme, FormControl, MenuItem, Select, InputLabel } from '@mui/material';
import React, { useContext } from 'react';

import { ThemeType } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';


const TermSelect: React.FC = () => {

  const {
    term,
    termName,
    setTermName,
    year,
    setTerm,
    setYear,
    setSelectedTimetable,
    displayTimetables,
    termsData
  } = useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents } =
    useContext(CourseContext);

  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const termData = new Set([termsData.prevTerm.termName.concat(', ', termsData.prevTerm.year), termsData.newTerm.termName.concat(', ', termsData.newTerm.year)]);

  const selectTerm = (e: any) => {
    const defaultStartTimetable = 0;

    let newTermName = e.target.value.split(', ')[0];
    let termNum = 'T' + newTermName.split(' ')[1];
    let newYear = e.target.value.split(', ')[1];

    if (e.target.value.includes("Summer")) {
      // This is a summer term.
      termNum = "Summer";
    }

    setTerm(termNum);
    setYear(newYear);
    setTermName(newTermName);
    setSelectedTimetable(defaultStartTimetable);
    setSelectedClasses(displayTimetables[termNum][defaultStartTimetable].selectedClasses);
    setCreatedEvents(displayTimetables[termNum][defaultStartTimetable].createdEvents);
    setSelectedCourses(displayTimetables[termNum][defaultStartTimetable].selectedCourses);
  }

  return (
    <FormControl>
      <InputLabel sx={{ marginTop: 1, color: 'white' }}>Select your term</InputLabel>
      <Select
        label="Select your term"
        value={isMobile ? term : termName.concat(', ', year)}
        sx={{
          marginTop: 1,
          color: 'white',
          '.MuiSelect-icon': {
            color: 'white'
          },
        }}
        onChange={selectTerm}
      >
        {
          Array.from(termData).map((term, index) => {
            return <MenuItem key={index} value={term}>{term}</MenuItem>;
          })
        }
      </Select>
    </FormControl>
  );
};

export default TermSelect;
