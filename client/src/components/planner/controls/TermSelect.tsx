import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import React, { useState } from 'react';

import { Term, useAvailableTerms } from '../../../api/times/times';
import { cn } from '../../../lib/utils';

// MUI's styles aren't in a CSS layer, so they beat Tailwind's layered utilities.
// The trailing `!` (important) lets these classes override MUI's defaults.
// #3a76f8 is notanglesBlue (theme.palette.primary.main).

const TermSelect: React.FC<{ term: Term; setTerm: (term: Term) => void }> = ({ term, setTerm }) => {
  const [open, setOpen] = useState(false);
  const terms = useAvailableTerms();

  // Saves matching Term object in terms array and saves to state with setTerm
  const selectTerm = (e: SelectChangeEvent) => {
    // Fetches the selected term string from the event that triggered the onChange handler.
    const termValue = e.target.value;
    // Returns element if condition is satisied. Undefined if condition is never satisfied.
    const selected = terms.find((t) => t.term === termValue);
    if (selected) {
      setTerm(selected);
    }
  };

  return (
    <FormControl>
      <InputLabel id="select-term-label" className="text-[#3a76f8]!">
        Select term
      </InputLabel>
      <Select
        size="small"
        labelId="select-term-label"
        id="select-term"
        label="Select term"
        className={cn(
          'h-[55px]! w-full! text-[#3a76f8]!',
          'transition-[background-color]! duration-100! ease-in!',
          'hover:bg-[rgba(157,157,157,0.15)]!',
          // Outline and dropdown arrow stay blue in every state (default, hover, focused)
          '[&_.MuiOutlinedInput-notchedOutline]:border-[#3a76f8]!',
          '[&_.MuiSelect-icon]:text-[#3a76f8]!',
        )}
        MenuProps={{
          slotProps: {
            paper: { className: 'w-[200px]!' },
          },
        }}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onOpen={() => {
          setOpen(true);
        }}
        value={term.term}
        // Warning: This function expects a string. If you change the value type, you'll need to adjust this.
        onChange={selectTerm}
      >
        {terms.map((term, index) => {
          return (
            <MenuItem key={index} value={term.term}>
              {term.name}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default TermSelect;
