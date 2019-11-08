import React from 'react'
import ClassInventory from './classInventory'
import { Course } from '../App'

export interface courseInventoryProps {
  addedCourses: Course[];
}

const CourseInventory: React.FC<courseInventoryProps> = ({ addedCourses }) => {
  return (
    <div>
      {addedCourses.map(course => (
        <ClassInventory
          course={course}
          key={course.id}
        />
      ))}
    </div>
  )
}

export default CourseInventory
