import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'

interface StyledInventoryCourseClassProps {
  isDragging: boolean
  color: string
  backgroundColor: string
}

const StyledInventoryCourseClass = styled.div<StyledInventoryCourseClassProps>`
  height: 50px;
  width: 100px;

  float: left;
  margin: 10px;

  font-size: 0.7rem;
  
  color: ${props => props.color};
  background-color: ${props => props.backgroundColor};
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  cursor: move;
`

export interface InventoryCourseClassProps {
  courseCode: string
  activity: string
  colour: string
}

const InventoryCourseClass: React.FC<InventoryCourseClassProps> = ({
  courseCode,
  activity,
  colour,
}) => {
  const bgAndTextColorPairs: Record<string, string> = {
    violet: 'white',
    indigo: 'white',
    green: 'white',
    blue: 'white',
    yellow: 'black',
    orange: 'black',
    red: 'black',
  }

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
      backgroundColor={colour}
      color={bgAndTextColorPairs[colour]}
    >
      {`${courseCode} ${activity}`}
    </StyledInventoryCourseClass>
  )
}

export default InventoryCourseClass
