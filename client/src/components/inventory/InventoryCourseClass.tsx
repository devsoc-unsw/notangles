import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

interface StyledInventoryCourseClassProps {
  isDragging: boolean
  backgroundColor: string
}

const StyledInventoryCourseClass = styled.div<StyledInventoryCourseClassProps>`
  height: 50px;
  width: 100px;

  float: left;
  margin: 10px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: 0.7rem;

  color: white;
  background-color: ${props => props.backgroundColor};
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  cursor: move;
`

export interface InventoryCourseClassProps {
  courseCode: string
  activity: string
  color: string
}

const InventoryCourseClass: React.FC<InventoryCourseClassProps> = ({
  courseCode,
  activity,
  color,
}) => {
  const [{ isDragging }, drag] = useDrag({
    item: { type: `${courseCode}-${activity}` },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <StyledInventoryCourseClass
      ref={drag}
      isDragging={isDragging}
      backgroundColor={color}
    >
      {`${courseCode}`}
        <br/>
      {`${activity}`}
    </StyledInventoryCourseClass>
  )
}

export default InventoryCourseClass
