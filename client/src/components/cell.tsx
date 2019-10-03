import React from 'react'
import styled from 'styled-components'

const StyledCell = styled.div`
  border: 0.2px solid;
  border-color: rgba(0, 0, 0, 0.2);
`

const Cell: React.FC = ({ children }) => {
  return <StyledCell>{children}</StyledCell>
}

export default Cell
