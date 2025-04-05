import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {IconButton, List, ListItem } from '@mui/material';
import React from 'react';

import { darkTheme, lightTheme } from '../../constants/theme';
interface ColorOptionsProps {
  colors: string[];
  maxDefaultColors?: number;
  showCustomColorPicker: boolean;
  onSelectColor: (color: string) => void;
  onCustomColorSelect: () => void;
}

const StyledColorIconButton = styled(IconButton)<{ border: string; bgColor: string }>(({ border, bgColor }) => ({
  backgroundColor: bgColor,
  width: 40,
  height: 40,
  '&:hover': {
    backgroundColor: bgColor,
    border: `2px solid ${border}`,
  }
}));

const ColorOptions: React.FC<ColorOptionsProps> = ({
  colors,
  maxDefaultColors = 4, // Default to 4 color options
  showCustomColorPicker,
  onSelectColor,
  onCustomColorSelect
}) => {
  // Get the current theme as from local storage
  const data = localStorage.getItem('data');
  const parsedData = data ? JSON.parse(data) : null;
  const theme = parsedData?.["isDarkMode"] ? darkTheme : lightTheme;

  return (
    <List sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
      {colors.slice(0, maxDefaultColors).map((color) => (
        <ListItem key={color} disableGutters>
          <StyledColorIconButton
            border={theme.palette.secondary.main}
            bgColor={color}
            onClick={() => onSelectColor(color)}

        />
        </ListItem>
      ))}
      <ListItem disableGutters>
        <StyledColorIconButton
          border={theme.palette.secondary.main}
          bgColor={showCustomColorPicker ? theme.palette.secondary.dark : theme.palette.secondary.dark}
          onClick={onCustomColorSelect}
        >
        {showCustomColorPicker ? <CloseIcon /> : <AddIcon />}
        </StyledColorIconButton>
      </ListItem>
    </List>
  );
};

export default ColorOptions;