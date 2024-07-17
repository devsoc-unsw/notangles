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
  // width: 100%;
  display: flex;
  border-radius: 8px;
  gap: 16px;
  justify-content: flex-start;
  padding: 12px 12px 12px 12px;
`;

const IndividualComponentTypography = styled(Typography)<{ collapsed: boolean }>`
  // padding-left: ${(props) => (props.collapsed ? '0px' : '12px')};
  font-size: 16px;
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
      <Tooltip title={collapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : ''} placement="right">
        <ToggleDarkModeButton color="inherit" onClick={toggleDarkMode}>
          {isDarkMode ? (<LightModeIcon />) : (<DarkModeIcon />)}
          <IndividualComponentTypography collapsed={collapsed}>
            {collapsed ? '' : (isDarkMode ? "Change to Light Mode" : "Change to Dark Mode")}
          </IndividualComponentTypography>
        </ToggleDarkModeButton>
      </Tooltip>
    </>
  );
};

export default DarkModeButton;
