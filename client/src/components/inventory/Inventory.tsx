import React from 'react';
import styled from 'styled-components';
import { ClassData } from '../../interfaces/CourseData';

import InventoryRow from './InventoryRow'
import { CourseData } from '../../interfaces/CourseData'

interface InventoryProps {
  selectedCourses: CourseData[]
  selectedClassIds: string[]
  assignedColors: Record<string, string>
  removeCourse(courseCode: string): void
}

const StyledInventory = styled.div`
  display: flex;
  flex-direction: column;
/* 
  height: 20%; */

    border: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  margin: 30px 0px;
`

const Inventory: React.FC<InventoryProps> = ({ 
  selectedCourses,
  selectedClassIds,
  assignedColors,
  removeCourse
 }) => {
  return (
    <div>
      <h1>Select a course at the top</h1>
      <StyledInventory>
        {selectedCourses.length 
        ? selectedCourses.map(course => (
          <InventoryRow
            key={course.courseCode}
            course={course}
            color={assignedColors[course.courseCode]}
            removeCourse={removeCourse}
            selectedClassIds={selectedClassIds}
          />
        ))
        : 'aoneuth'
      }
      </StyledInventory>
    </div>
  )
}

export default Inventory;
