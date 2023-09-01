import React from 'react';
import { Box, Grid } from '@mui/material';
import { styled } from '@mui/system';

import { ControlsProps } from '../../interfaces/PropTypes';
import Autotimetabler from './Autotimetabler';
import CourseSelect from './CourseSelect';
import CustomEvents from './CustomEvent';
import History from './History';

const SelectWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  grid-column: 1 / -1;
  grid-row: 1;
  padding-top: 20px;
  padding-left: 66px;
`;

const AutotimetablerWrapper = styled(Box)`
  flex: 1;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex: none;
  }
`;

const CustomEventsWrapper = styled(Box)`
  flex: 1;
`;

const HistoryWrapper = styled(Box)`
  margin-top: 20px;
  margin-left: 3px;
`;

const Controls: React.FC<ControlsProps> = ({ assignedColors, handleSelectClass, handleSelectCourse, handleRemoveCourse }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <SelectWrapper>
          <CourseSelect assignedColors={assignedColors} handleSelect={handleSelectCourse} handleRemove={handleRemoveCourse} />
        </SelectWrapper>
      </Grid>
      <Grid item container direction="row" alignItems="center" justifyContent="space-between" xs={12} md={6}>
        <CustomEventsWrapper>
          <CustomEvents />
        </CustomEventsWrapper>
        <AutotimetablerWrapper>
          <Autotimetabler handleSelectClass={handleSelectClass} />
        </AutotimetablerWrapper>
        <HistoryWrapper>
          <History />
        </HistoryWrapper>
      </Grid>
    </Grid>
  );
};

export default Controls;
