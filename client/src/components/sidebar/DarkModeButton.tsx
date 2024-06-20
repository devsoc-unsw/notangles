import { 
  NightsStay as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React, { useContext } from 'react';

import { DarkModeButtonProps } from '../../interfaces/PropTypes';
import { AppContext } from '../../context/AppContext';

const ToggleDarkModeButton = styled(IconButton)`
  display: flex;
  flex-direction: row;
  gap: 16px;
  border-radius: 8px;
  justify-content: flex-start;
  padding: 12px 12px 12px 12px;
`;

const IndividualComponentTypography = styled(Typography)`
  margin: 0px;
  fontsize: 16px;
`;

const DarkModeButton: React.FC<DarkModeButtonProps> = ({
  collapsed,
}) => {
  const {
    isDarkMode,
    setIsDarkMode,
  } = useContext(AppContext);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <Tooltip title={collapsed ? (isDarkMode ? "Dark Mode" : "Light Mode") : ''} placement="right">
        <ToggleDarkModeButton color="inherit" onClick={toggleDarkMode}>
          {isDarkMode ? (<DarkModeIcon />) : (<LightModeIcon />)}
          <IndividualComponentTypography>{collapsed ? '' : (isDarkMode ? "Dark Mode" : "Light Mode")}</IndividualComponentTypography>
        </ToggleDarkModeButton>
      </Tooltip>
    </>
  );
};

export default DarkModeButton;
