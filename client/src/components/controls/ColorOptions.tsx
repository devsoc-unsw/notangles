import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, List, ListItem } from '@mui/material';
import { FC, useMemo } from 'react';

import { useColorDecoder } from '../../hooks/useColorDecoder';
import { darkTheme, lightTheme } from '../../constants/theme';
import { useGetUserSettingsQuery } from '../../api/user/queries';
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
  const settings = useGetUserSettingsQuery();
  const themeObject = useMemo(
    () => (settings.useDarkMode ? lightTheme(settings.preferredTheme) : darkTheme(settings.preferredTheme)),
    [settings.useDarkMode, settings.preferredTheme],
  );

  const decodedColors = colors.map((color) => {
    const decodedColor = useColorDecoder(color, settings.preferredTheme);
    return decodedColor;
  });

  return (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Default Theme Colors (1-4) */}
      <List sx={{ display: 'flex', flexDirection: 'row', gap: 1.2 }} disablePadding>
        {colors.slice(0, maxDefaultColors).map((color, index) => (
          <ListItem key={color} disablePadding>
            <StyledColorIconButton
              border={themeObject.palette.secondary.main}
              bgColor={decodedColors[index]}
              onClick={() => {
                onSelectColor(color);
              }}
            />
          </ListItem>
        ))}
      </List>
      {/* Default Theme Colors (5-7) */}
      <List sx={{ display: 'flex', flexDirection: 'row', gap: 1.2 }} disablePadding>
        {colors.slice(maxDefaultColors, maxDefaultColors + 3).map((color, index) => (
          <ListItem key={color} disablePadding>
            <StyledColorIconButton
              border={themeObject.palette.secondary.main}
              bgColor={decodedColors[index + maxDefaultColors]}
              onClick={() => {
                onSelectColor(color);
              }}
            />
          </ListItem>
        ))}
        <ListItem key="custom-color" disablePadding>
          <StyledColorIconButton
            border={themeObject.palette.secondary.main}
            bgColor={themeObject.palette.secondary.dark}
            onClick={onCustomColorSelect}
          >
            {showCustomColorPicker ? <CloseIcon /> : <AddIcon />}
          </StyledColorIconButton>
        </ListItem>
      </List>
    </List>
  );
};

export default ColorOptions;
