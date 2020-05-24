import React from 'react';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';

import FlashOnIcon from '@material-ui/icons/FlashOn';

const DropdownButton = styled(Button)`
    width: 300px;
    text-align: left;
    margin-right:10px;
`;

const DragHandle = styled(Button)`
    &:hover {
        background-color: transparent;
    }
    &:active {
        background-color: transparent;
    }
`;
interface DropdownOptionProps {
  optionName: string
  isChecked: boolean
  setIsChecked(value: boolean): void
}
const DropdownOption: React.FC<DropdownOptionProps> = ({ optionName, isChecked, setIsChecked }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  return (

    <ListItem>
      <Checkbox
        checked={isChecked}
        color="primary"
        onChange={handleChange}
        inputProps={{ 'aria-label': 'primary checkbox' }}
      />
      <ListItemText
        primary={optionName}
      />
      <DragHandle disableRipple>
        <DragIndicatorIcon />
      </DragHandle>
    </ListItem>
  );
};


export default function Autotimetable() {
  const [isChecked1, setIsChecked1] = React.useState(true);
  const [isChecked2, setIsChecked2] = React.useState(true);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <DropdownButton aria-describedby={id} variant="outlined" onClick={handleClick}>
        <Box flexGrow={1}>Auto-timetable Options</Box>
        {open ? (
          <ExpandLessIcon />
        ) : <ExpandMoreIcon />}
      </DropdownButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List dense>
          <DropdownOption optionName="Least days at uni" isChecked={isChecked1} setIsChecked={setIsChecked1} />
          <DropdownOption optionName="long and specific criteria that must be met always for timetabling" isChecked={isChecked2} setIsChecked={setIsChecked2} />

        </List>
      </Popover>
      <Button variant="contained" color="primary" disableElevation>
        GO
        <FlashOnIcon />
      </Button>
    </div>
  );
}
