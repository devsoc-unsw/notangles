import React from 'react'
import styled from 'styled-components'

const StyledCell = styled.div`
  border: 1px solid gray;
`

const Cell: React.FC = ({ children }) => {
  return <StyledCell>{children}</StyledCell>
}

export default Cell
