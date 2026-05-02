import { Grid, ListItem, ListItemText, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const StyledOptionToggle = styled(ToggleButtonGroup)`
  margin-top: 10px;
  width: 100%;
`;

const StyledOptionButtonToggle = styled(ToggleButton)`
  width: 100%;
  height: 32px;
  margin-bottom: 10px;
`;

type OptionState<T extends string> = T | T[] | null;

interface DropdownOptionProps<T extends string> {
  optionName: string;
  optionState: OptionState<T>;
  setOptionState(value: OptionState<T>): void;
  optionChoices: T[];
  multiple?: boolean;
  noOff?: boolean;
}

const DropdownOption = <T extends string>({
  optionName,
  optionState,
  setOptionState,
  optionChoices,
  multiple,
  noOff,
}: DropdownOptionProps<T>) => {
  const handleOptionChange = (_event: React.MouseEvent<HTMLElement>, newOption: OptionState<T>) => {
    if (newOption !== null) {
      setOptionState(newOption);
    }
  };

  return (
    <ListItem key={optionName}>
      <Grid container spacing={0} sx={{ flexGrow: 1 }}>
        <Grid size={12}>
          <ListItemText primary={optionName} />
        </Grid>
        <Grid size={12}>
          <StyledOptionToggle
            size="small"
            exclusive={multiple ? false : true}
            value={optionState}
            onChange={handleOptionChange}
            aria-label="option choices"
          >
            {!noOff && (
              <StyledOptionButtonToggle value="off" aria-label="default">
                off
              </StyledOptionButtonToggle>
            )}
            {optionChoices.map((option) => (
              <StyledOptionButtonToggle key={option} value={option} aria-label={option}>
                {option}
              </StyledOptionButtonToggle>
            ))}
          </StyledOptionToggle>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default DropdownOption;
