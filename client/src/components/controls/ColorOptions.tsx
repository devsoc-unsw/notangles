import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, List, ListItem } from '@mui/material';
import { FC, useContext } from 'react';

import { darkTheme, lightTheme } from '../../constants/theme';
import { AppContext } from '../../context/AppContext';
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
  },
}));

const ColorOptions: FC<ColorOptionsProps> = ({
  colors,
  maxDefaultColors = 4, // Default to 4 color options
  showCustomColorPicker,
  onSelectColor,
  onCustomColorSelect,
}) => {
  // Get the current theme as from AppContext
  const { isDarkMode, currentTheme } = useContext(AppContext);
  const theme = isDarkMode ? darkTheme(currentTheme) : lightTheme(currentTheme);

  return (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Default Theme Colors (1-4) */}
      <ListItem sx={{ display: 'flex', flexDirection: 'row', gap: 1.2 }} disablePadding>
        {colors.slice(0, maxDefaultColors).map((color) => (
          <ListItem disablePadding>
            <StyledColorIconButton
              border={theme.palette.secondary.main}
              bgColor={useColorDecoder(color)}
              onClick={() => onSelectColor(color)}
            />
          </ListItem>
        ))}
      </ListItem>
      {/* Default Theme Colors (5-7) */}
      <ListItem sx={{ display: 'flex', flexDirection: 'row', gap: 1.2 }} disablePadding>
        {colors.slice(maxDefaultColors, colors.length - 1).map((color) => (
          <ListItem disablePadding>
            <StyledColorIconButton
              border={theme.palette.secondary.main}
              bgColor={useColorDecoder(color)}
              onClick={() => onSelectColor(color)}
            />
          </ListItem>
        ))}
        <ListItem disablePadding>
          <StyledColorIconButton
            border={theme.palette.secondary.main}
            bgColor={theme.palette.secondary.dark}
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
