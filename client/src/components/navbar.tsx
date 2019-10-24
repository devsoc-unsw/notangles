import React from 'react'

import CSESocLogo from '../assets/logo.png'

import styled from 'styled-components'

const StyledNavbar = styled.div`
  height: 5vh;
  width: 100vw;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  color: white;
  background-color: #3a76f8;
`

const LogoImg = styled.img`
  max-width: 100%;
  max-height: 100%;
`

const AppName = styled.span`
  font-weight: bold;
  font-size: 1.5em;
`

const Navbar: React.FC = () => {
  return (
    <StyledNavbar>
      <LogoImg src={CSESocLogo} />
      <AppName>Notangles</AppName>
    </StyledNavbar>
  )
}
export default Navbar
