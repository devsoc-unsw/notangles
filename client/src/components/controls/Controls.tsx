import { Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

import { ControlsProps } from '../../interfaces/PropTypes';
import Autotimetabler from './Autotimetabler';
import CourseSelect from './CourseSelect';
import CustomEvents from './CustomEvent';
import History from './History';
import TermSelect from './TermSelect';

const TermSelectWrapper = styled(Box)`
  flex: 0 0 auto;
  margin-top: 20px;
  margin-right: 10px;
  min-width: 140px;
  display: flex;
  align-items: flex-start;
`;

const SelectWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  grid-column: 1 / -1;
  grid-row: 1;
  padding-top: 20px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
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

const Controls: React.FC<ControlsProps> = ({
  assignedColors,
  handleSelectClass,
  handleSelectCourse,
  handleRemoveCourse,
}) => {
  return (
    <Grid container sx={{ paddingLeft: '66px' }} spacing={2}>
      <Grid
        container
        direction="row"
        size={{
          xs: 12,
          md: 6.5,
        }}
      >
        <TermSelectWrapper>
          <TermSelect />
        </TermSelectWrapper>

        <SelectWrapper minWidth={'296px'}>
          <CourseSelect
            assignedColors={assignedColors}
            handleSelect={handleSelectCourse}
            handleRemove={handleRemoveCourse}
          />
        </SelectWrapper>
      </Grid>
      <Grid
        container
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        size={{
          xs: 12,
          md: 5.5,
        }}
      >
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
