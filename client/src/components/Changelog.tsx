import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Description from '@material-ui/icons/Description';
import styled from 'styled-components';

const changelog = [
  {
    date: '05/03/22',
    change: 'Added about us modal and settings modal',
  },
  {
    date: '08/03/22',
    change: 'Added icon to indicate when class is full, updated class colours',
  },
  {
    date: '10/03/22',
    change: 'Added ability to select between classes running at the same time',
  },
  {
    date: '15/03/22',
    change: 'Added ICS saving',
  },
  {
    date: '18/03/22',
    change:
      'Bumped term number, fixed bug when selecting a course whose classes have no periods e.g. exams, added icons to indicate course delivery mode',
  },
];

const StyledDialogTitle = styled(MuiDialogTitle)`
  margin: 0;
  padding: 20px;
`;

const StyledTypography = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const InfoButton = styled(IconButton)`
  margin-right: 5px;
`;

const DialogContent = styled(MuiDialogContent)`
  padding: 20px;
`;

const Changelog: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Tooltip title="Changelog">
        <InfoButton color="inherit" onClick={toggleIsOpen}>
          <Description />
        </InfoButton>
      </Tooltip>
      <Dialog
        disableScrollLock
        onClose={toggleIsOpen}
        aria-labelledby="customized-dialog-title"
        open={isOpen}
        fullWidth
        maxWidth="sm"
      >
        <StyledDialogTitle disableTypography>
          <StyledTypography variant="h5">Changelog</StyledTypography>
          <CloseButton aria-label="close" onClick={toggleIsOpen}>
            <CloseIcon />
          </CloseButton>
        </StyledDialogTitle>
        <DialogContent>
          <Typography gutterBottom variant="body2">
            Notangles is an app for UNSW students to build their perfect timetable, even before class registration opens. We have
            many features on the way, including auto-timetabling, and syncing your timetable with friends.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Changelog;
