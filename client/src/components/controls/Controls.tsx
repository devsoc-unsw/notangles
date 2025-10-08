import { Box } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import { ControlsProps } from '../../interfaces/PropTypes';
import Autotimetabler from './Autotimetabler';
import CourseSelect from './CourseSelect';
import CustomEvents from './CustomEvent';
import TermSelect from './TermSelect';
const ControlsBar = styled(Box)`
  display: flex;
  align-items: flex-end; // Align all controls to the bottom
  padding-left: 66px;
  gap: 12px;
`;

const TermSelectWrapper = styled(Box)`
  min-width: 140px;
  margin-bottom: 0; // Remove any margin that could misalign
`;

const SelectWrapper = styled(Box)`
  flex-grow: 2;
  min-width: 600px; // Wider search bar
  margin-bottom: 0;
`;

const ButtonRow = styled(Box)`
  display: flex;
  gap: 8px; // Reduced gap between buttons
  margin-bottom: 0;
`;

const Controls: React.FC<ControlsProps> = ({
  assignedColors,
  handleSelectClass,
  handleSelectCourse,
  handleRemoveCourse,
}) => {
  return (
    <ControlsBar>
      <TermSelectWrapper>
        <TermSelect />
      </TermSelectWrapper>
      <SelectWrapper>
        <CourseSelect
          assignedColors={assignedColors}
          handleSelect={handleSelectCourse}
          handleRemove={handleRemoveCourse}
        />
      </SelectWrapper>
      <ButtonRow>
        <CustomEvents />
        <Autotimetabler handleSelectClass={handleSelectClass} />
      </ButtonRow>
    </ControlsBar>
  );
};

export default Controls;
