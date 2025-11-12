import { Box, Button, ButtonGroup, ListItem, Popover, TextField } from '@mui/material';
import { Colorful } from '@uiw/react-color';
import { useMemo, useState } from 'react';

import { useGetUserSettingsQuery } from '../../../api/user/queries';
import { ColorIndicatorBox, StyledButtonContainer } from '../../../styles/ControlStyles';
import { decodeColor, oklchToHex } from '../../../utils/colors';
import ColorOptions from './ColorOptions';

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  colorPickerAnchorEl: HTMLElement | null;
  handleOpenColorPicker: (event: React.MouseEvent<HTMLElement>) => void;
  handleCloseColorPicker: () => void;
  handleSaveNewColor?: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  setColor,
  colorPickerAnchorEl,
  handleOpenColorPicker,
  handleCloseColorPicker,
  handleSaveNewColor,
}) => {
  // Whether the colour picker popover is shown
  const openColorPickerPopover = Boolean(colorPickerAnchorEl);
  const colorPickerPopoverId = openColorPickerPopover ? 'simple-popover' : undefined;

  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const { preferredTheme } = useGetUserSettingsQuery();

  const decodedColor = decodeColor(color, preferredTheme);
  const textFieldValue = useMemo(() => oklchToHex(decodedColor), [decodedColor]);

  return (
    <Box m={1} display="flex" justifyContent="center" alignItems="center">
      <ColorIndicatorBox backgroundColor={decodeColor(color, preferredTheme)} onClick={handleOpenColorPicker} />
      <StyledButtonContainer>
        <ButtonGroup>
          <Button
            disableElevation
            variant="outlined"
            size="small"
            aria-describedby={colorPickerPopoverId}
            onClick={handleOpenColorPicker}
          >
            Choose Colour
          </Button>
          {handleSaveNewColor && (
            <Button variant="contained" size="small" onClick={handleSaveNewColor} disableElevation>
              Save
            </Button>
          )}
        </ButtonGroup>
      </StyledButtonContainer>
      <Popover
        id={colorPickerPopoverId}
        open={openColorPickerPopover}
        anchorEl={colorPickerAnchorEl}
        onClose={handleCloseColorPicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <ListItem alignItems="flex-start">
          <ColorOptions
            showCustomColorPicker={showCustomColorPicker}
            onSelectColor={(selectedColor) => {
              setColor(selectedColor);
            }}
            onCustomColorSelect={() => {
              setShowCustomColorPicker(!showCustomColorPicker);
            }}
          />
        </ListItem>
        {showCustomColorPicker && (
          <ListItem alignItems="flex-start">
            <Colorful
              onChange={(e) => {
                setColor(e.hex);
              }}
              color={color}
              disableAlpha
            />
          </ListItem>
        )}
        <ListItem alignItems="flex-start">
          <TextField
            id="outlined-required"
            label="Hex"
            variant="outlined"
            value={textFieldValue}
            onChange={(e) => {
              let newColor = e.target.value;
              if (newColor !== '' && !newColor.startsWith('#')) {
                newColor = `#${newColor}`;
              }
              setColor(newColor);
            }}
          />
        </ListItem>
      </Popover>
    </Box>
  );
};

export default ColorPicker;
