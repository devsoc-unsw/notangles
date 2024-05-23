import { Popover } from '@mui/material';
import { Colorful } from '@uiw/react-color';

import { ColorPickerProps } from '../../interfaces/PropTypes';

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
    <div className="m-1 flex justify-center items-center">
      <div
        className="w-9 h-9 rounded cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={handleOpenColorPicker}
      />
      <div className="pl-4">
        <div className="flex">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium tracking-tight uppercase py-1.5 px-2 rounded-xl"
            onClick={handleOpenColorPicker}
          >
            Choose Colour
          </button>
          {handleSaveNewColor && (
            <button
              className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-medium uppercase text-sm py-2 px-4 rounded-md transition duration-300 ease-in-out"
              onClick={handleSaveNewColor}
            >
              Save
            </button>
          )}
        </div>
      </div>
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
        <div className="flex items-start p-4">
          <Colorful onChange={(e) => setColor(e.hex)} color={color} />
        </div>
        <div className="flex flex-col items-start px-4 py-2">
          <label htmlFor="outlined-required" className="text-gray-300 mb-2">
            Hex
          </label>
          <input
            id="outlined-required"
            type="text"
            className="border border-gray-300 rounded-lg p-2 bg-transparent"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
            }}
          />
        </div>
      </Popover>
    </div>
  );
};

export default ColorPicker;
