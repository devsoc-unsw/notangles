import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

import CSESocLogo from '../assets/logo.png'
import styled from 'styled-components'
const LogoImg = styled.img`
  width: 40px;
  height:40px;
  margin-right: 20px;
`
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    marginBottom: 30

  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1
  }
}));

export default function Navbar() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar style={{ background: 'rgb(54,119,245)' }} position="static">
        <Toolbar>
          <LogoImg src={CSESocLogo} />
          <Typography variant="h6" className={classes.title}>
            CSESoc Notangles
          </Typography>
          <Button color="inherit">Login</Button>
          <Button color="inherit">Sign Up</Button>
          <Button color="inherit">About</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
