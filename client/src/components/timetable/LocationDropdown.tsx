import React from 'react';
import { FormControl, MenuItem, Select, Typography } from '@mui/material';
import { LocationDropdownProps } from '../../interfaces/PropTypes';

const LocationDropdown: React.FC<LocationDropdownProps> = ({ selectedIndex, sectionsAndLocations, handleChange }) => {
  return (
    <FormControl fullWidth>
      <Select
        labelId="simple-select"
        id="simple-select"
        variant="outlined"
        value={selectedIndex}
        inputProps={{ 'aria-label': 'Without label' }}
        onChange={handleChange}
      >
        {sectionsAndLocations.map(([, location], index) => (
          <MenuItem value={index} key={index}>
            <Typography>{location}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LocationDropdown;
