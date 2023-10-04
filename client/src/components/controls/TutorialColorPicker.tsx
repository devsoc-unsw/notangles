import { Box, Button, ButtonGroup, ListItem, Popover, TextField } from '@mui/material';
import { Colorful } from '@uiw/react-color';

import { ColorIndicatorBox, StyledButtonContainer } from '../../styles/ControlStyles';
import styled from '@emotion/styled';

const BoxStyle = styled(Box)`
  padding-bottom: 20px
`
const TutorialColorPicker: React.FC<any> = ({
  color,
  setColor,
  colorPickerAnchorEl,
  handleOpenColorPicker,
  handleCloseColorPicker,
  handleSaveNewTutorialColor,
}) => {
  // Whether the colour picker popover is shown
  const openColorPickerPopover = Boolean(colorPickerAnchorEl);
  const colorPickerPopoverId = openColorPickerPopover ? 'simple-popover' : undefined;

  return (
    <BoxStyle m={1} display="flex" justifyContent="center" alignItems="center">
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
          <Button
            variant="outlined"
            size="small"
            onClick={handleSaveNewTutorialColor}
          >
            Save
          </Button>
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
    </BoxStyle>
  );
};

export default TutorialColorPicker;
