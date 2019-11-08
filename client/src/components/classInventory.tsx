import React from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import styled from 'styled-components'
import {Course} from '../App'

export interface classInventoryProps {
  course: Course | undefined;
}

const StyledClassInventory = styled.div`
  border: 1px solid black;
  width: 100%;
`

const ClassInventory: React.FC<classInventoryProps> = ({ course }) => {
    // course.classes.map(classTime => (
    //   <Cell
    //     key={`${course}${classTime}`}
    //     onDrop={() => handleDrop(classTime, course)}
    //     course={course}
    //     classTime={classTime}
    //   />
    // ))
  console.log(course)
  return (
    <DndProvider
      backend={HTML5Backend}
    >
      <StyledClassInventory>
        <h1>{!course ? 'object is null' : course.id}</h1>
      </StyledClassInventory>
    </DndProvider>
  )
}

export default ClassInventory
