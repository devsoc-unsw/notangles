import React from "react";

import styled from "styled-components"
import { StylesProvider } from "@material-ui/styles"; // make styled components styling have priority

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import ToggleButton from "@material-ui/lab/ToggleButton";
import Brightness2Icon from "@material-ui/icons/Brightness2";
import Tooltip from '@material-ui/core/Tooltip';

import CSESocLogo from "../assets/logo.png"

const LogoImg = styled.img`
  width: 40px;
  height:40px;
  margin-right: 20px;
`
const NavbarBox = styled.div`
  flex-grow: 1;
`
const StyledNavBar = styled(AppBar)`
  background: rgb(54,119,245);
  margin-bottom:30px;
  position: static;
`
const NavbarTitle = styled(Typography)`
  flex-grow: 1;
`
const DarkModeButton = styled(ToggleButton)`
  border: none;
  border-radius:40px;
  margin-right: 20px;
  width:40px;
  height: 40px;
`
const DarkModeIcon = styled(Brightness2Icon)`
  transform: rotate(180deg);
  color: #bde0ff;
`
const NavButton = styled(Button)`
  margin-right: 20px;
`

export default function Navbar() {

  // for dark mode toggle
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <StylesProvider injectFirst>
    <NavbarBox>
      <StyledNavBar>
        <Toolbar>

          <LogoImg src={CSESocLogo}/>
          <NavbarTitle variant="h6">
            Notangles
          </NavbarTitle>

          <DarkModeButton
            value={isDarkMode}
            selected={isDarkMode}
            onChange={() => {
              setIsDarkMode(!isDarkMode);
            }}
          >
            <DarkModeIcon fontSize="small"/>
          </DarkModeButton>

          <Tooltip title="Coming Soon" placement="bottom">
            <div>
                <NavButton color="inherit" disabled >Login</NavButton>
                <NavButton color="inherit"  disabled>Sign Up</NavButton>
            </div>
          </Tooltip>

          <NavButton color="inherit" >About</NavButton>

          </Toolbar>
        </StyledNavBar>
      </NavbarBox>
      </StylesProvider>
  );
}
