import React, { useContext } from 'react';
import styled from 'styled-components';
import { Dialog, DialogTitle, Divider, IconButton, Switch, Tooltip, Typography } from '@mui/material';
import { Close, Settings as SettingsIcon } from '@mui/icons-material';

import { AppContext } from '../context/AppContext';

const StyledDialogTitle = styled(DialogTitle)`
  margin: 0;
  padding: 20px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  right: 10px;
  top: 10px;
`;

const SettingsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const SettingsItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1vh 20px;
`;

const SettingText = styled.div`
  padding: 1vh 0;
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
    isSortAlphabetic,
    setIsSortAlphabetic,
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
    { state: isSortAlphabetic, setter: setIsSortAlphabetic, desc: 'Sort results in ascending order' },
  ];

  const settings = settingsToggles.map((setting) => {
    return (
      <div key={setting.desc}>
        <Divider />
        <SettingsItem>
          <SettingText>{setting['desc']}</SettingText>
          <Switch
            value={setting['state']}
            checked={setting['state']}
            color="primary"
            onChange={() => {
              setting['setter'](!setting['state']);
            }}
          />
        </SettingsItem>
      </div>
    );
  });

  return (
    <div>
      <Tooltip title="Settings">
        <IconButton color="inherit" onClick={toggleIsOpen} size="large">
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
        <StyledDialogTitle>
          <Typography variant="h5">Settings</Typography>
          <CloseButton aria-label="close" onClick={toggleIsOpen}>
            <Close />
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
