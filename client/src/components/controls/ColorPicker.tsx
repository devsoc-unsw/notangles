import { Box, Button, ListItem, Popover, TextField } from '@mui/material';
import { Colorful } from '@uiw/react-color';
import { ColourIndicatorBox, StyledButtonContainer } from '../../styles/ControlStyles';
import { ColorPickerProps } from '../../interfaces/PropTypes';

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  setColor,
  colorPickerAnchorEl,
  handleOpenColourPicker,
  handleCloseColourPicker,
}) => {
  // Whether the colour picker popover is shown
  const openColorPickerPopover = Boolean(colorPickerAnchorEl);
  const colorPickerPopoverId = openColorPickerPopover ? 'simple-popover' : undefined;

  return (
    <Box m={1} display="flex" justifyContent="center" alignItems="center">
      <ColourIndicatorBox backgroundColour={color} onClick={handleOpenColourPicker} />
      <StyledButtonContainer>
        <Button
          disableElevation
          variant="contained"
          size="small"
          aria-describedby={colorPickerPopoverId}
          onClick={handleOpenColourPicker}
        >
          Choose Colour
        </Button>
      </StyledButtonContainer>
      <Popover
        open={openColorPickerPopover}
        anchorEl={colorPickerAnchorEl}
        onClose={handleCloseColourPicker}
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
