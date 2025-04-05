import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import {IconButton, List, ListItem, Tooltip } from '@mui/material';
import React from 'react';

interface ColorOptionsProps {
  colors: string[];
  maxDefaultColors?: number;
  showCustomColorPicker: boolean;
  onSelectColor: (color: string) => void;
  onCustomColorSelect: () => void;
}

const ColorOptions: React.FC<ColorOptionsProps> = ({
  colors,
  maxDefaultColors = 4, // Default to 4 color options
  showCustomColorPicker,
  onSelectColor,
  onCustomColorSelect
}) => {
  return (
    <List sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
      {colors.slice(0, maxDefaultColors).map((color) => (
        <ListItem key={color} disableGutters>
          <Tooltip title={color}>
          <IconButton
            style={{ backgroundColor: color, width: 40, height: 40 }}
            onClick={() => onSelectColor(color)}
          />
          </Tooltip>
        </ListItem>
      ))}
      <ListItem disableGutters>
      <Tooltip title="Custom Color">
        <IconButton
        style={{ backgroundColor: 'gray', width: 40, height: 40 }}
        onClick={onCustomColorSelect}
        >
        {showCustomColorPicker ? <CloseIcon /> : <AddIcon />}
        </IconButton>
      </Tooltip>
      </ListItem>
    </List>
  );
};

export default ColorOptions;