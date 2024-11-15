import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  Tooltip,
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
  width: '100%',
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
}));

const CustomStyledSelect = (props: SelectProps) => {
  return (
    <StyledSelect
      {...props}
      MenuProps={{
        PaperProps: {
          style: {
            width: '258px',
          },
        },
      }}
    />
  );
};

const TermDisplay = styled('span')`
  color: ${({ theme }) => theme.palette.primary.main};
  font-weight: 600;
  position: relative;
  padding: 12px 12px 12px 13px;
  z-index: 1201;
  border: 1.2px solid ${({ theme }) => theme.palette.primary.main};
  border-radius: 10px;
  display: inline-block;
`;

export interface TermSelectProps {
  collapsed: boolean;
  handleExpand: () => void;
}

const TermSelect: React.FC<TermSelectProps> = ({ collapsed, handleExpand }) => {
  const { term, termName, setTermName, year, setTerm, setYear, setSelectedTimetable, displayTimetables, termsData } =
    useContext(AppContext);

  const { setSelectedCourses, setSelectedClasses, setCreatedEvents, setAssignedColors } = useContext(CourseContext);

  const theme = useTheme<ThemeType>();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);

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

  const handleMouseDown = (event: any) => {
    // prevents collapsing sidebar when selecting value
    event.stopPropagation();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <FormControl onMouseDown={handleMouseDown}>
      {collapsed ? (
        <>
          <Tooltip
            title={termName}
            placement="right"
            onClick={() => {
              handleExpand();
              handleOpen();
            }}
          >
            <TermDisplay>{term?.substring(0, 2)}</TermDisplay>
          </Tooltip>
        </>
      ) : (
        <>
          <StyledInputLabel id="select-term-label">Select term</StyledInputLabel>
          <CustomStyledSelect
            size="small"
            labelId="select-term-label"
            id="select-term"
            label="Select term"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={isMobile ? term : termName.concat(', ', term?.substring(2) as string)}
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
        </>
      )}
    </FormControl>
  );
};

export default TermSelect;
