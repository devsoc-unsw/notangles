import { LightMode as LightModeIcon, NightsStay as DarkModeIcon } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useContext } from 'react';

import { useSetUserSettings } from '../../api/user/mutations';
import { useGetUserSettingsQuery } from '../../api/user/queries';
import { AppContext } from '../../context/AppContext';

const ToggleDarkModeButton = styled(IconButton)`
  display: flex;
  border-radius: 8px;
  gap: 16px;
  justify-content: flex-start;
  padding: 12px 12px 12px 12px;
`;

const IndividualComponentTypography = styled(Typography)`
  font-size: 16px;
`;

const DarkModeButton = () => {
  const { isDarkMode } = useGetUserSettingsQuery();
  const updateUserSettings = useSetUserSettings();
  const { sidebarCollapsed } = useContext(AppContext);

  return (
    <>
      <Tooltip title={sidebarCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : ''} placement="right">
        <ToggleDarkModeButton
          color="inherit"
          onClick={() => {
            updateUserSettings({ isDarkMode: !isDarkMode });
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          {!sidebarCollapsed && (
            <IndividualComponentTypography>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</IndividualComponentTypography>
          )}
        </ToggleDarkModeButton>
      </Tooltip>
    </>
  );
};

export default DarkModeButton;
