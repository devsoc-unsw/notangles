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
import { AppContext } from '../../context/AppContext';
import { CourseContext } from '../../context/CourseContext';

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
    setAssignedColors(displayTimetables[termNum][defaultStartTimetable].assignedColors);
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
            <TermDisplay>{term}</TermDisplay>
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
          </CustomStyledSelect>
        </>
      )}
    </FormControl>
  );
};

export default TermSelect;
