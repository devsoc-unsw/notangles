import { Box, Button, ButtonGroup, ListItem, Popover, TextField } from '@mui/material';
import { Colorful } from '@uiw/react-color';
import { useEffect, useState } from 'react';

import { colors } from '../../constants/timetable';
import { useColorDecoder } from '../../hooks/useColorDecoder';
import { ColorPickerProps } from '../../interfaces/PropTypes';
import { ColorIndicatorBox, StyledButtonContainer } from '../../styles/ControlStyles';
import { oklchToHex } from '../../utils/oklchCovert';
import ColorOptions from './ColorOptions';

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

  const decodedColor = useColorDecoder(color);
  const [textFieldValue, setTextFieldValue] = useState(oklchToHex(decodedColor));

  useEffect(() => {
    setTextFieldValue(oklchToHex(decodedColor));
  }, [decodedColor]);

  return (
    <Box m={1} display="flex" justifyContent="center" alignItems="center">
      <ColorIndicatorBox backgroundColor={useColorDecoder(color)} onClick={handleOpenColorPicker} />
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
            colors={colors}
            showCustomColorPicker={showCustomColorPicker}
            onSelectColor={(selectedColor) => setColor(selectedColor)}
            onCustomColorSelect={() => setShowCustomColorPicker(!showCustomColorPicker)}
          />
        </ListItem>
        {showCustomColorPicker && (
          <ListItem alignItems="flex-start">
            <Colorful onChange={(e) => setColor(e.hex)} color={color} disableAlpha />
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
