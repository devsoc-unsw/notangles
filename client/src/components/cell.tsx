import React from 'react'
import styled from 'styled-components'

const StyledCell = styled.div`
  border: 0.2px solid;
  border-color: rgba(0, 0, 0, 0.2);

  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Cell: React.FC = ({ children }) => {
  return <StyledCell>{children}</StyledCell>
}

export default Cell
