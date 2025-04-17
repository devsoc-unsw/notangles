import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {IconButton, List, ListItem } from '@mui/material';
import React from 'react';

import { darkTheme, lightTheme } from '../../constants/theme';
import { useColorDecoder } from '../../hooks/useColorDecoder';
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
  const colorTheme = localStorage.getItem('colorTheme') || 'theme_1';
  const theme = parsedData?.["isDarkMode"] ? darkTheme(colorTheme) : lightTheme(colorTheme);

  return (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1}}>
      {/* Default Theme Colors */}
      <ListItem sx={{ display: 'flex', flexDirection: 'row', gap: 1.2}} disablePadding>
        {colors.slice(0, maxDefaultColors).map((color) => (
          <ListItem key={color} disablePadding>
            <StyledColorIconButton
              border={theme.palette.secondary.main}
              bgColor={useColorDecoder(color)}
              onClick={() => onSelectColor(color)}

          />
          </ListItem>
        ))}
      </ListItem>
      {/* Recently Used Colors */}
      <ListItem sx={{ display: 'flex', flexDirection: 'row', gap: 1.2}} disablePadding>
        {colors.slice(maxDefaultColors, colors.length-1).map((color) => (
          <StyledColorIconButton
            key={color}
            border={theme.palette.secondary.main}
            bgColor={useColorDecoder(color)}
            onClick={() => onSelectColor(color)}
          />
        ))}
        <ListItem disablePadding>
          <StyledColorIconButton
            border={theme.palette.secondary.main}
            bgColor={showCustomColorPicker ? theme.palette.secondary.dark : theme.palette.secondary.dark}
            onClick={onCustomColorSelect}
          >
          {showCustomColorPicker ? <CloseIcon /> : <AddIcon />}
          </StyledColorIconButton>
        </ListItem>
      </ListItem>
    </List>
  );
};

export default ColorOptions;