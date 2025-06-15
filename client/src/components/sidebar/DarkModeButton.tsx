import { LightMode as LightModeIcon, NightsStay as DarkModeIcon } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext } from 'react';

import { AppContext } from '../../context/AppContext';
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
  const { isDarkMode, setIsDarkMode } = useContext(AppContext);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <Tooltip title={collapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : ''} placement="right">
        <ToggleDarkModeButton color="inherit" onClick={toggleDarkMode}>
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
