import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, List, ListItem, useTheme } from '@mui/material';
import { useMemo } from 'react';

import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { colors, decodeColor } from '../../../utils/colors';

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

interface ColorOptionsProps {
  maxDefaultColors?: number;
  showCustomColorPicker: boolean;
  onSelectColor: (color: string) => void;
  onCustomColorSelect: () => void;
}

const ColorOptions = ({
  maxDefaultColors = 4, // Default to 4 color options
  showCustomColorPicker,
  onSelectColor,
  onCustomColorSelect,
}: ColorOptionsProps) => {
  const theme = useTheme();
  const { preferredTheme } = useGetUserSettingsQuery();
  const decodedColors = useMemo(() => colors.map((color) => decodeColor(color, preferredTheme)), [preferredTheme]);

  const selectedThemeColorDisplay = useMemo(() => {
    const colorItems = [];
    for (let i = 0; i < colors.length; i += maxDefaultColors) {
      const isLastChunk = i === colors.length - maxDefaultColors;
      // On the last chunk, one slot is reserved for the custom colour (+) button,
      // so we intentionally render one fewer default colour swatch.
      colorItems.push(
        colors.slice(i, isLastChunk ? i + maxDefaultColors - 1 : i + maxDefaultColors).map((color, j) => (
          <ListItem key={color} disablePadding>
            <StyledColorIconButton
              border={theme.palette.secondary.main}
              bgColor={decodedColors[i + j]}
              onClick={() => {
                onSelectColor(color);
              }}
            />
          </ListItem>
        )),
      );
    }
    colorItems[colorItems.length - 1].push(
      <StyledColorIconButton
        border={theme.palette.secondary.main}
        bgColor={theme.palette.secondary.dark}
        onClick={onCustomColorSelect}
      >
        {showCustomColorPicker ? <CloseIcon /> : <AddIcon />}
      </StyledColorIconButton>,
    );

    return colorItems.map((item, index) => (
      <List key={index} sx={{ display: 'flex', flexDirection: 'row', gap: 1.2 }} disablePadding>
        {item}
      </List>
    ));
  }, [
    maxDefaultColors,
    theme.palette.secondary.main,
    theme.palette.secondary.dark,
    decodedColors,
    onCustomColorSelect,
    showCustomColorPicker,
    onSelectColor,
  ]);

  return <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{selectedThemeColorDisplay}</List>;
};

export default ColorOptions;
