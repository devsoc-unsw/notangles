import { LightMode as LightModeIcon, NightsStay as DarkModeIcon } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import { useSetUserSettings } from '../../api/user/mutations';
import { useGetUserSettingsQuery } from '../../api/user/queries';
import { DarkModeButtonProps } from '../../interfaces/PropTypes';

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

const DarkModeButton: React.FC<DarkModeButtonProps> = ({ collapsed }) => {
  const { isDarkMode } = useGetUserSettingsQuery();
  const updateUserSettings = useSetUserSettings();

  return (
    <>
      <Tooltip title={collapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : ''} placement="right">
        <ToggleDarkModeButton
          color="inherit"
          onClick={() => {
            updateUserSettings({ isDarkMode: !isDarkMode });
          }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          {!collapsed && (
            <IndividualComponentTypography>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</IndividualComponentTypography>
          )}
        </ToggleDarkModeButton>
      </Tooltip>
    </>
  );
};

export default DarkModeButton;
