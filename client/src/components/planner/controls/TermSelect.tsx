import { FormControl, InputLabel, MenuItem, Select, SelectProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';

import { Term, useAvailableTerms } from '../../../api/times/times';

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: '55px',
  width: '100%',
  transition: 'background-color 0.1s ease-in',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '.MuiSelect-icon': {
    color: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiSelect-icon': {
    color: theme.palette.primary.main,
  },
  '&:hover .MuiSelect-icon': {
    color: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&:hover': {
    backgroundColor: 'rgba(157, 157, 157, 0.15)',
  },
}));

const CustomStyledSelect = (props: SelectProps) => {
  return (
    <StyledSelect
      {...props}
      MenuProps={{
        PaperProps: {
          style: {
            width: '200px',
          },
        },
      }}
    />
  );
};

const TermSelect: React.FC<{ term: Term; setTerm: (term: Term) => void }> = ({ term, setTerm }) => {
  const [open, setOpen] = useState(false);
  const terms = useAvailableTerms();

  const selectTerm = (e: any) => {
    // Convert to Term data
    const termValue = e.target.value;
    setTerm(terms.find((t) => t.term === termValue)!);
  };

  return (
    <FormControl>
      <StyledInputLabel id="select-term-label">Select term</StyledInputLabel>
      <CustomStyledSelect
        size="small"
        labelId="select-term-label"
        id="select-term"
        label="Select term"
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onOpen={() => {
          setOpen(true);
        }}
        value={term.term}
        onChange={selectTerm}
      >
        {terms.map((term, index) => {
          return (
            <MenuItem key={index} value={term.term}>
              {term.name}
            </MenuItem>
          );
        })}
      </CustomStyledSelect>
    </FormControl>
  );
};

export default TermSelect;
