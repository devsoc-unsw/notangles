import React from 'react'
import styled from 'styled-components'
import InventoryRow from './InventoryRow'
import { CourseData } from '../../interfaces/CourseData'

interface InventoryProps {
  selectedCourses: CourseData[]
  selectedClassIds: string[]
  assignedColors: Record<string, string>
  removeCourse(courseCode: string): void
  removeClass(activityId: string): void
}

const StyledInventory = styled.div`
  display: flex;
  flex-direction: column;

  border: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  margin: 30px 0px;
`

const Inventory: React.FC<InventoryProps> = ({
  selectedCourses,
  selectedClassIds,
  assignedColors,
  removeCourse,
  removeClass
}) => {
  return (
    <div>
      <StyledInventory>
        {selectedCourses.length
          ? selectedCourses.map(course => (
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
  )
}

export default Inventory
