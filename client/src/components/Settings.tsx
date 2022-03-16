import React, { useContext } from 'react';

import { List, ListItem, ListItemText } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';
import Divider from '@material-ui/core/Divider';
import styled from 'styled-components';

import { AppContext } from '../context/AppContext';

const StyledDialogTitle = styled(MuiDialogTitle)`
  margin: 0;
  padding: 20px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const SettingsList = styled(List)`
  padding: 0 0 0 10px;
`;

const SettingText = styled(ListItemText)`
  padding: 5px 0 5px 0;
`;

const StyledSwitch = styled(Switch)`
  position: absolute;
  right: 10px;
`;

const Settings: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    isDarkMode,
    setIsDarkMode,
    isSquareEdges,
    setIsSquareEdges,
    is12HourMode,
    setIs12HourMode,
    isHideFullClasses,
    setIsHideFullClasses,
    isDefaultUnscheduled,
    setIsDefaultUnscheduled,
    isHideClassInfo,
    setIsHideClassInfo,
  } = useContext(AppContext);

  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  const settingsToggles: { state: boolean; setter: (mode: boolean) => void; desc: string }[] = [
    { state: isDarkMode, setter: setIsDarkMode, desc: 'Dark mode' },
    { state: isSquareEdges, setter: setIsSquareEdges, desc: 'Square corners on classes' },
    { state: is12HourMode, setter: setIs12HourMode, desc: '12-hour time' },
    { state: isHideFullClasses, setter: setIsHideFullClasses, desc: 'Hide full classes' },
    { state: isDefaultUnscheduled, setter: setIsDefaultUnscheduled, desc: 'Unschedule classes by default' },
    { state: isHideClassInfo, setter: setIsHideClassInfo, desc: 'Hide class details' },
  ];

  const settings = settingsToggles.map((setting) => {
    return (
      <div key={setting.desc}>
        <Divider />
        <ListItem>
          <SettingText primary={setting['desc']} />
          <StyledSwitch
            value={setting['state']}
            checked={setting['state']}
            color="primary"
            onChange={() => {
              setting['setter'](!setting['state']);
            }}
          />
        </ListItem>
      </div>
    );
  });

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
        <Typography variant="body1">
          <SettingsList>{settings}</SettingsList>
        </Typography>
      </Dialog>
    </div>
  );
};

export default Settings;
