import { Box, Button, ButtonGroup, ListItem, Popover, TextField } from '@mui/material';
import { Colorful } from '@uiw/react-color';

import { ColorPickerProps } from '../../interfaces/PropTypes';
import { ColorIndicatorBox, StyledButtonContainer } from '../../styles/ControlStyles';

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

  return (
    <Box m={1} display="flex" justifyContent="center" alignItems="center">
      <ColorIndicatorBox backgroundColor={color} onClick={handleOpenColorPicker} />
      <StyledButtonContainer>
        <ButtonGroup>
          <Button
            disableElevation
            variant="contained"
            size="small"
            aria-describedby={colorPickerPopoverId}
            onClick={handleOpenColorPicker}
          >
            Choose Colour
          </Button>
          {handleSaveNewColor && (
            <Button variant="outlined" size="small" onClick={handleSaveNewColor}>
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
          <Colorful onChange={(e) => setColor(e.hex)} color={color} />
        </ListItem>
        <ListItem alignItems="flex-start">
          <TextField
            id="outlined-required"
            label="Hex"
            variant="outlined"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
            }}
          />
        </ListItem>
      </Popover>
    </Box>
  );
};

export default ColorPicker;
