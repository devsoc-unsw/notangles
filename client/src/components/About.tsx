import React from "react";
import styled from "styled-components"
import { StylesProvider } from "@material-ui/styles"; // make styled components styling have priority

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";


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
function DialogTitle(props:any) {
  const { children, classes, onClose, ...other } = props;
  return (
      <StylesProvider injectFirst>

    <StyledDialogTitle disableTypography {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <CloseButton
          aria-label="close"
          onClick={onClose}
        >
          <CloseIcon />
        </CloseButton>
      ) : null}
    </StyledDialogTitle>
    </StylesProvider>

  );
}

const DialogContent = styled(MuiDialogContent)`
    padding:20px;
`

// const DialogActions = styled(MuiDialogContent)`
//     margin:0;
//     /*padding:25px;*/
// `


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
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Notangles: No more timetable Tangles 🧶
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            nice blurb!!
          </Typography>
          <Typography gutterBottom>
            How to use:
          </Typography>
          <Typography gutterBottom>
            credits: github linku
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}
