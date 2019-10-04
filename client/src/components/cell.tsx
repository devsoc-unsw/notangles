import React from 'react'
import styled from 'styled-components'
import { useDrop } from 'react-dnd'

import { ItemTypes } from './constants'

const StyledCell = styled.div`
  border: 0.2px solid;
  border-color: rgba(0, 0, 0, 0.2);

  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Cell: React.FC = ({ children }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.COURSECLASS,
    // drop: () => ;
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  })
  return <StyledCell>{children}</StyledCell>
}

export default Cell
