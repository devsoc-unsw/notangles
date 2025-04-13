import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext, useState } from 'react';

import { ThemeType } from '../../constants/theme';
import { convertToTermName } from '../../constants/timetable';
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';
import { Term } from '../../interfaces/Periods';

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: '55px',
  width: '100%',
  transition: 'background-color 0.1s ease-in',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '.MuiSelect-icon': {
    color: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiSelect-icon': {
    color: theme.palette.primary.main,
  },
  '&:hover .MuiSelect-icon': {
    color: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: "rgba(157, 157, 157, 0.15)",
  },
}));

const CustomStyledSelect = (props: SelectProps) => {
  return (
    <StyledSelect
      {...props}
      MenuProps={{
        PaperProps: {
          style: {
            width: '200px',
          },
        },
      }}
    />
  );
};

export interface TermSelectProps {}

const TermSelect: React.FC<TermSelectProps> = () => {
  const { term, termName, setTermName, year, setTerm, setYear, setSelectedTimetable, displayTimetables, termsData } =
    useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents, setAssignedColors } = useContext(CourseContext);

  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [closed, setClosed] = useState(true);

  const termDataStrList = termsData.map((val) => {
    return `${convertToTermName(val!)}, ${val?.substring(2)}`;
  });

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

    const termName = (termPrefix + newYear) as Term; // To get a string like T12024
    setTerm(termName);
    setYear(newYear);
    setTermName(convertToTermName(termName!));
    setSelectedTimetable(defaultStartTimetable);
    setSelectedClasses(displayTimetables[termName!][defaultStartTimetable].selectedClasses);
    setCreatedEvents(displayTimetables[termName!][defaultStartTimetable].createdEvents);
    setSelectedCourses(displayTimetables[termName!][defaultStartTimetable].selectedCourses);
    setAssignedColors(displayTimetables[termName!][defaultStartTimetable].assignedColors);
  };

  
  const handleClose = () => {
    setClosed(true);
  };

  const handleOpen = () => {
    setClosed(false);
  };
  return (

    <FormControl >
        <StyledInputLabel id="select-term-label">Select term</StyledInputLabel>
        <CustomStyledSelect
            size="small"
            labelId="select-term-label"
            id="select-term"
            label="Select term"
            open={!closed}
            onClose={handleClose}
            onOpen={handleOpen}
            value={termName.concat(', ', term?.substring(2) as string)}
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
};

export default TermSelect;
