import React from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import InventoryRow from './InventoryRow';
import { CourseData } from '../../interfaces/CourseData';

interface InventoryProps {
  selectedCourses: CourseData[]
  selectedClassIds: string[]
  assignedColors: Record<string, string>
  removeCourse(courseCode: string): void
  removeClass(activityId: string): void
}

const StyledInventory = styled(Box)`
  display: none;
  flex-direction: column;

  border: 1px solid;
  box-sizing: border-box;
  margin-top: 60px;
  margin-bottom: 30px;
  border-color: ${(props) => props.theme.palette.secondary.main};
`;

const Inventory: React.FC<InventoryProps> = ({
  selectedCourses,
  selectedClassIds,
  assignedColors,
  removeCourse,
  removeClass,
}) => (
  <div>
    <StyledInventory>
      {selectedCourses.length
        ? selectedCourses.map((course) => (
          <InventoryRow
            key={course.courseCode}
            course={course}
            color={assignedColors[course.courseCode]}
            removeCourse={removeCourse}
            selectedClassIds={selectedClassIds}
            removeClass={removeClass}
          />
        ))
        : 'No courses have been selected'}
    </StyledInventory>
  </div>
);

export default Inventory;
