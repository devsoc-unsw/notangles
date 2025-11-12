import styled from '@emotion/styled';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, List, ListItem, useTheme } from '@mui/material';
import { useMemo } from 'react';

import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { decodeColor } from '../../../utils/colors';

const COLORS = ['default-1', 'default-2', 'default-3', 'default-4', 'default-5', 'default-6', 'default-7', 'default-8'];

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
  const decodedColors = useMemo(() => COLORS.map((color) => decodeColor(color, preferredTheme)), [preferredTheme]);

  const selectedThemeColorDisplay = useMemo(() => {
    const colorItems = [];
    for (let i = 0; i < COLORS.length; i += maxDefaultColors) {
      const isLastChunk = i === COLORS.length - maxDefaultColors;
      colorItems.push(
        COLORS.slice(i, isLastChunk ? i + maxDefaultColors - 1 : i + maxDefaultColors).map((color, j) => (
          <ListItem component="div" disablePadding key={color}>
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
      <ListItem key={index} sx={{ display: 'flex', flexDirection: 'row', gap: 1.2 }} disablePadding>
        {item}
      </ListItem>
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
