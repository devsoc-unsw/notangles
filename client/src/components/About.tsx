import React from 'react';
import styled from 'styled-components';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

const StyledDialogTitle = styled(MuiDialogTitle)`
  margin: 0;
  padding: 20px;
`;
const CloseButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;
const DialogContent = styled(MuiDialogContent)`
  padding: 20px;
`;

const FeatList = styled.ul`
    margin-top: 4px;
    margin-bottom: 6px;
`;

const About: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Button color="inherit" onClick={toggleIsOpen}>
        About
      </Button>
      <Dialog
        disableScrollLock
        onClose={toggleIsOpen}
        aria-labelledby="customized-dialog-title"
        open={isOpen}
        fullWidth
        maxWidth="sm"
      >

        <StyledDialogTitle disableTypography>
          <Typography variant="h5">
            Notangles: No more timetable Tangles
          </Typography>
          <CloseButton
            aria-label="close"
            onClick={toggleIsOpen}
          >
            <CloseIcon />
          </CloseButton>
        </StyledDialogTitle>

        <DialogContent dividers>
          <Typography gutterBottom variant="body2">
            Notangles is a tool helping UNSW students build the perfect timetable,
            with an intuitive drag and drop interface. We have many features on
            the way, including auto-timetabling, and syncing your timetable with friends.
          </Typography>
          <Typography gutterBottom variant="body2">
            Inspired by&nbsp;
            <Link href="https://crossangles.app/" target="_blank">
              Crossangles
            </Link>
            &nbsp;and&nbsp;
            <Link href="https://tdransfield.net/projects/bojangles/" target="_blank">
              Bojangles
            </Link>
            , it was created by&nbsp;
            <Link href="https://www.csesoc.unsw.edu.au/teams/software-projects/" target="_blank">
              CSESoc Projects
            </Link>
            &nbsp;- a place for student-led projects where you can learn
            something new and make some friends along the way.
            Notangles is free and open-source.
          </Typography>
          <Typography variant="h6">
            How it works
          </Typography>
          <Typography gutterBottom variant="body2">
            Use the course dropdown to search for and select your courses.
            Drag and drop classes to view timetabling options.
            <br />
            Notangles does not enroll in your classes. It’s a tool for
            planning your timetable, but you’ll still need to officially enroll on&nbsp;
            <Link href="https://my.unsw.edu.au/" target="_blank">
              myUNSW
            </Link>
            .
          </Typography>
          <Typography variant="h6">
            Features
          </Typography>
          <Typography gutterBottom variant="body2">
            <FeatList>
              <li> Drag-and-drop interface </li>
              <li> Move clutter to the class inventory </li>
              <li> Dark mode &#x1F60E; </li>
              <li> Select 12 or 24 hour time </li>
            </FeatList>
          </Typography>
          <Typography variant="h6">
            Future developments [
            <Link href="https://compclub.atlassian.net/wiki/x/JoBzM" target="_blank">
              Roadmap
            </Link>
            ]
          </Typography>
          <Typography gutterBottom variant="body2">
            <FeatList>
              <li> Auto-timetabling to suit your needs </li>
              <li> Optional login to sync your timetable across devices </li>
              <li> Social-timetabling to coordinate classes with friends </li>
              <li> A mobile app so you can plan on the go </li>
            </FeatList>
          </Typography>
          <br />
          <Typography gutterBottom variant="body2">
            <b> DISCLAIMER </b>
            &nbsp;While we try our best, Notangles is not an official UNSW site,
             and cannot guarantee data accuracy or reliability.
          </Typography>
          <Typography gutterBottom variant="body2">
            If you find an issue or have a suggestion, please contact us.
          </Typography>
        </DialogContent>

      </Dialog>
    </div>
  );
};

export default About;
