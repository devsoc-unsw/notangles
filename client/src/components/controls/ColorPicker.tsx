import { Box, Button, ListItem, Popover, TextField } from '@mui/material';
import { Colorful } from '@uiw/react-color';

import { ColorPickerProps } from '../../interfaces/PropTypes';
import { ColorIndicatorBox, StyledButtonContainer } from '../../styles/ControlStyles';

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  setColor,
  colorPickerAnchorEl,
  handleOpenColorPicker,
  handleCloseColorPicker,
}) => {
  // Whether the colour picker popover is shown
  const openColorPickerPopover = Boolean(colorPickerAnchorEl);
  const colorPickerPopoverId = openColorPickerPopover ? 'simple-popover' : undefined;

  return (
    <>
      <button type="button"
        className="flex justify-between dark:bg-[#323e4d] dark:text-[#eef0f2] dark:ring-[#404f63] gap-x-1.5 rounded-md bg-[#f8f8f8] px-3 py-2 text-md font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        aria-describedby={colorPickerPopoverId}
        onClick={handleOpenColorPicker}
      >
        <ColorIndicatorBox backgroundColor={color} onClick={handleOpenColorPicker} />
        <svg className="my-auto h-5 w-5 text-gray-400 items-center" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
        </svg>
      </button>
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
    </>
    // <Box m={1} display="flex" justifyContent="center" alignItems="center">
    //   <ColorIndicatorBox backgroundColor={color} onClick={handleOpenColorPicker} />
    //   <StyledButtonContainer>
    //     <Button
    //       disableElevation
    //       variant="contained"
    //       size="small"
    //       aria-describedby={colorPickerPopoverId}
    //       onClick={handleOpenColorPicker}
    //     >
    //       Choose Colour
    //     </Button>
    //   </StyledButtonContainer>
    //   <Popover
    //     id={colorPickerPopoverId}
    //     open={openColorPickerPopover}
    //     anchorEl={colorPickerAnchorEl}
    //     onClose={handleCloseColorPicker}
    //     anchorOrigin={{
    //       vertical: 'bottom',
    //       horizontal: 'left',
    //     }}
    //     transformOrigin={{
    //       vertical: 'top',
    //       horizontal: 'left',
    //     }}
    //   >
    //     <ListItem alignItems="flex-start">
    //       <Colorful onChange={(e) => setColor(e.hex)} color={color} />
    //     </ListItem>
    //     <ListItem alignItems="flex-start">
    //       <TextField
    //         id="outlined-required"
    //         label="Hex"
    //         variant="outlined"
    //         value={color}
    //         onChange={(e) => {
    //           setColor(e.target.value);
    //         }}
    //       />
    //     </ListItem>
    //   </Popover>
    // </Box>
  );
};

export default ColorPicker;
