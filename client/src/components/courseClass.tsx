import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

import { ItemTypes } from './constants'

interface StyledCourseClassProps {
  isDragging: boolean
}

const StyledCourseClass = styled.div`
  height: 100%;
  width: 100%;

  background-color: orange;
  opacity: ${(props: StyledCourseClassProps) => (props.isDragging ? 0.5 : 1)};
`

const CourseClass: React.FC = ({ children }) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.COURSECLASS },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  return (
    // TODO: Not sure why cursor='move' only works inline here vs defined in styled component
    <StyledCourseClass
      ref={drag}
      isDragging={isDragging}
      style={{ cursor: 'move' }}
    ></StyledCourseClass>
  )
}

export default CourseClass
