import React from 'react';
import { Box, Grid } from '@material-ui/core';
import styled from 'styled-components';

import Autotimetabler from './Autotimetabler';
import CourseSelect from './CourseSelect';
import History from './History';
import { ControlsProps } from '../interfaces/PropTypes';

const SelectWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  grid-column: 1 / -1;
  grid-row: 1;
  padding-top: 20px;
`;

const AutotimetablerWrapper = styled(Box)`
  flex: 1;
`;

const HistoryWrapper = styled(Box)`
  margin-top: 20px;
`;

const Controls: React.FC<ControlsProps> = ({ assignedColors, handleSelectCourse, handleRemoveCourse }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <SelectWrapper>
          <CourseSelect assignedColors={assignedColors} handleSelect={handleSelectCourse} handleRemove={handleRemoveCourse} />
        </SelectWrapper>
      </Grid>
      <Grid item container direction="row" alignItems="center" xs={12} md={6}>
        <AutotimetablerWrapper>
          <Autotimetabler />
        </AutotimetablerWrapper>
        <HistoryWrapper>
          <History />
        </HistoryWrapper>
      </Grid>
    </Grid>
  );
};

export default Controls;
