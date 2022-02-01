import React from 'react';
import styled from 'styled-components';

import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';
import Divider from '@material-ui/core/Divider';

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
  setIsSquareEdges(mode: boolean): void;
  isSquareEdges: boolean;
}

// beware memo - if a component isn't re-rendering, it could be why
const Settings: React.FC<SettingsProps> = React.memo(({ isSquareEdges, setIsSquareEdges }) => {
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
          <Typography variant="h5">Settings</Typography>
          <CloseButton aria-label="close" onClick={toggleIsOpen}>
            <CloseIcon />
          </CloseButton>
        </StyledDialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body1">
            <Switch
              value={isSquareEdges}
              checked={isSquareEdges}
              color="primary"
              onChange={() => {
                setIsSquareEdges(!isSquareEdges);
              }}
            />
            Square corners on classes
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default Settings;
