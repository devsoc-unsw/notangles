import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, List, ListItem } from '@mui/material';
import { FC, useContext } from 'react';

import { AppContext } from '../../context/AppContext';
import { useColorDecoder } from '../../hooks/useColorDecoder';
interface ColorOptionsProps {
  colors: string[];
  maxDefaultColors?: number;
  showCustomColorPicker: boolean;
  onSelectColor: (color: string) => void;
  onCustomColorSelect: () => void;
}

const StyledColorIconButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'border' && prop !== 'bgColor',
})<{ border: string; bgColor: string }>(({ border, bgColor }) => ({
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
  const { themeObject, currentTheme } = useContext(AppContext);

  const decodedColors = colors.map((color) => {
    const decodedColor = useColorDecoder(color, currentTheme);
    return decodedColor;
  });

  return (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Default Theme Colors (1-4) */}
      <ListItem sx={{ display: 'flex', flexDirection: 'row', gap: 1.2 }} disablePadding>
        {colors.slice(0, maxDefaultColors).map((color, index) => (
          <ListItem component="div" disablePadding key={color}>
            <StyledColorIconButton
              border={themeObject.palette.secondary.main}
              bgColor={decodedColors[index]}
              onClick={() => {
                onSelectColor(color);
              }}
            />
          </ListItem>
        ))}
      </ListItem>
      {/* Default Theme Colors (5-7) */}
      <ListItem sx={{ display: 'flex', flexDirection: 'row', gap: 1.2 }} disablePadding>
        {colors.slice(maxDefaultColors, colors.length - 1).map((color, index) => (
          <ListItem component="div" disablePadding key={color}>
            <StyledColorIconButton
              border={themeObject.palette.secondary.main}
              bgColor={decodedColors[index + maxDefaultColors]}
              onClick={() => {
                onSelectColor(color);
              }}
            />
          </ListItem>
        ))}
        <ListItem component="div" disablePadding>
          <StyledColorIconButton
            border={themeObject.palette.secondary.main}
            bgColor={themeObject.palette.secondary.dark}
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
