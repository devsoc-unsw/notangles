import React from 'react'
import styled from 'styled-components'
import { CourseData } from '../../interfaces/CourseData'
import { useDrop } from 'react-dnd'

// import { InventoryRow } from './Inventory'
// import CourseClass from '../timetable/CourseClass'
import InventoryCourseClass from './InventoryCourseClass'


export interface InventoryRowProps {
  course: CourseData
  color: string
  removeCourse(courseCode: string): void
  selectedClassIds: string[]
}

const StyledInventoryRow = styled.div`
  display: flex;
  padding: 5px;
  border: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
`

const RowCourseDescriptor = styled.div`
  width: 100px;
  /* margin-top: 20px; */
  padding: 10px;
  border-right: 3px solid;
  border-color: rgba(0, 0, 0, 0.2);
`

const RowItems = styled.div<{ canDrop: boolean }>`
`

const valuesOf = <T extends object>(obj: T): T[keyof T][] => Object.values(obj)

const InventoryRow: React.FC<InventoryRowProps> = ({
  course,
  removeCourse,
  selectedClassIds,
  color
}) => {

  const getInventoryCourseClasses = (): React.ReactNode[] => {

    // return course classes for activities which don't currently have a selected class
    const res = Object.entries(course.classes)
      .filter(([_, activityClasses]) =>
        !activityClasses.some(classData =>
          selectedClassIds.includes(classData.classId)))
      .map(([activity]) => (
        <InventoryCourseClass
          key={`${course.courseCode}-${activity}`}
          courseCode={course.courseCode}
          activity={activity}
          colour={color}
        />
      ))

    // const res: React.ReactNode[] = []
    // for (let activity in course.classes) {
    //   if (course.classes[activity].length !== 0) {
    //     let isSelected = false;
    //     for (let classData of course.classes[activity]) {
    //       if ((classData.classId in selectedClassIds)) {
    //         isSelected = true;
    //         break;
    //       }
    //     }
    //     if (!isSelected) {
    //       res.push(
    //         <InventoryCourseClass
    //           courseCode={course.courseCode}
    //           activity={activity}
    //           colour={color}
    //         />
    //       )
    //     }
    //   }
    // }

    return res
  }

  const getAllIds = (): string[] => {
    const res: string[] = []

    for (let activity in course.classes) {
      res.push(...course.classes[activity].map(classData => classData.classId))
    }

    return res
  }

  const [{ canDrop }, drop] = useDrop({
    accept: getAllIds(),
    drop: () => { },
    collect: monitor => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  })

  return (
    <StyledInventoryRow>
      <RowCourseDescriptor>
        <button onClick={() => {
          removeCourse(course.courseCode)
        }}>
          X
        </button>
        {`${course.courseCode}`}
      </RowCourseDescriptor>
      <RowItems
        ref={drop}
        canDrop={canDrop}
      >
        {getInventoryCourseClasses()}
      </RowItems>
    </StyledInventoryRow>
  )
}

export default InventoryRow;