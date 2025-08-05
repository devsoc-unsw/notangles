import { LightMode as LightModeIcon, NightsStay as DarkModeIcon } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import { DarkModeButtonProps } from '../../interfaces/PropTypes';
import { useGetUserSettingsQuery } from '../../api/user/queries';
import { useSetUserSettings } from '../../api/user/mutations';

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
  const { useDarkMode } = useGetUserSettingsQuery();
  const updateUserSettings = useSetUserSettings();

  return (
    <>
      <Tooltip title={collapsed ? (useDarkMode ? 'Dark Mode' : 'Light Mode') : ''} placement="right">
        <ToggleDarkModeButton color="inherit" onClick={() => updateUserSettings({ useDarkMode: !useDarkMode })}>
          {useDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
          {!collapsed && (
            <IndividualComponentTypography>{useDarkMode ? 'Dark Mode' : 'Light Mode'}</IndividualComponentTypography>
          )}
        </ToggleDarkModeButton>
      </Tooltip>
    </>
  );
};

export default DarkModeButton;
