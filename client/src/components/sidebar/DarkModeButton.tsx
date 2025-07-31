import { LightMode as LightModeIcon, NightsStay as DarkModeIcon } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

import { DarkModeButtonProps } from '../../interfaces/PropTypes';
import { useSetUserSettings } from '../../api/useUserSettings';
import { useSettings } from '../../context/QueryContext';

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
  const settings = useSettings();
  const { mutate } = useSetUserSettings();

  return (
    <>
      <Tooltip title={collapsed ? (settings.useDarkMode ? 'Dark Mode' : 'Light Mode') : ''} placement="right">
        <ToggleDarkModeButton color="inherit" onClick={() => mutate({ useDarkMode: !settings.useDarkMode })}>
          {settings.useDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
          {!collapsed && (
            <IndividualComponentTypography>
              {settings.useDarkMode ? 'Dark Mode' : 'Light Mode'}
            </IndividualComponentTypography>
          )}
        </ToggleDarkModeButton>
      </Tooltip>
    </>
  );
};

export default DarkModeButton;
