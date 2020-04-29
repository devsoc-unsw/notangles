import React from "react";
import styled from "styled-components"

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Link from '@material-ui/core/Link';


const StyledDialogTitle = styled(MuiDialogTitle)`
    margin: 0;
    padding:20px;
`
const CloseButton = styled(IconButton)`
    position: absolute;
    right: 20px;
    top: 10px;
    color: rgb(54,119,245);
`
const DialogContent = styled(MuiDialogContent)`
    padding:20px;
`

export function About() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button color="inherit" onClick={handleClickOpen}>
        About
      </Button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth
        maxWidth="sm"
      >

        <StyledDialogTitle disableTypography>
          <Typography variant="h6">Notangles: No more timetable Tangles 🧶</Typography>
          {handleClose ? (
            <CloseButton
              aria-label="close"
              onClick={handleClose}
            >
              <CloseIcon />
            </CloseButton>
          ) : null}
        </StyledDialogTitle>

        <DialogContent dividers>
          <Typography gutterBottom>
            Select courses from the dropdown and drag to see class options.
          </Typography>
          <Typography gutterBottom>
            Features:
            <ul>
            <li> Automatically generate optimal timetables </li>
            <li> Select dark mode 😎 & 12/24 hour time </li>
            </ul>
          </Typography>
          <Typography gutterBottom>
          Made by >_ CSESoc &nbsp; | &nbsp;
          <Link target="_blank" href="https://github.com/csesoc/notangles">
          GitHub
          </Link>
          </Typography>

        </DialogContent>
      </Dialog>
    </div>
  );
}
