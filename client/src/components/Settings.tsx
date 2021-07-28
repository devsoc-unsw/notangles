import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Switch from '@material-ui/core/Switch';



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


interface SettingsProps {
  setIsSquareEdges(mode: boolean): void,
  isSquareEdges: boolean,
}

// beware memo - if a component isn't re-rendering, it could be why
const Settings: FunctionComponent<SettingsProps> = React.memo(({
  isSquareEdges,
  setIsSquareEdges

}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Tooltip title="Settings">
        <IconButton color="inherit" onClick={toggleIsOpen}>
          <SettingsIcon />
        </IconButton>
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
          <Typography variant="h5">
            Settings
          </Typography>
          <CloseButton aria-label="close" onClick={toggleIsOpen}>
            <CloseIcon />
          </CloseButton>
        </StyledDialogTitle>

        <DialogContent dividers>
        <Switch
            value={isSquareEdges}
            checked={isSquareEdges}
            color="primary"
            onChange={()=> {
              setIsSquareEdges(!isSquareEdges);
              }}
      /> Toggle square edges on cards
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default Settings;
