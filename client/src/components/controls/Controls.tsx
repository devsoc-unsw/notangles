import { Box, Grid } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import { ControlsProps } from '../../interfaces/PropTypes';
import Autotimetabler from './Autotimetabler';
import CourseSelect from './CourseSelect';
import CustomEvents from './CustomEvent';
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
  min-width: 420px; // Wider search bar
`;

const ButtonRow = styled(Box)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  gap: 16px;
`;

const AutotimetablerWrapper = styled(Box)`
  flex: none;
`;

const CustomEventsWrapper = styled(Box)`
  flex: none;
`;

const Controls: React.FC<ControlsProps> = ({
  assignedColors,
  handleSelectClass,
  handleSelectCourse,
  handleRemoveCourse,
}) => {
  return (
    <Grid container sx={{ paddingLeft: '66px' }} spacing={2} alignItems="center">
      {/* Term select and search bar */}
      <Grid item container xs={12} md={8} direction="row" alignItems="center" spacing={2}>
        <Grid item>
          <TermSelectWrapper>
            <TermSelect />
          </TermSelectWrapper>
        </Grid>
        <Grid item sx={{ flexGrow: 1 }}>
          <SelectWrapper sx={{ minWidth: 500 }}>
            <CourseSelect
              assignedColors={assignedColors}
              handleSelect={handleSelectCourse}
              handleRemove={handleRemoveCourse}
            />
          </SelectWrapper>
        </Grid>
      </Grid>
      {/* Create Event and Auto-Timetable buttons */}
      <Grid item xs={12} md={4}>
        <ButtonRow>
          <CustomEventsWrapper>
            <CustomEvents />
          </CustomEventsWrapper>
          <AutotimetablerWrapper>
            <Autotimetabler handleSelectClass={handleSelectClass} />
          </AutotimetablerWrapper>
        </ButtonRow>
      </Grid>
    </Grid>
  );
};

export default Controls;