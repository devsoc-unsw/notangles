import React from 'react';
import styled from 'styled-components';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
// import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
// import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
// import Divider from '@material-ui/core/Divider';
import FlashOnIcon from '@material-ui/icons/FlashOn';

const DropdownButton = styled(Button)`
    width: 100%;
    height: 55px;
    text-align: left;
    margin-right:10px;
    text-transform: none;
`;

const ExecuteButton = styled(Button)`
    width: 100%;
    border-radius: 0px 0px 5px 5px;
`;

const StyledOptionToggle = styled(ToggleButtonGroup)`
    /* margin-left: 40px; */
    margin-top: 10px;
    width:100%;
`;
const StyledOptionButtonToggle = styled(ToggleButton)`
    width: 100%;
    height: 30px;
`;

interface DropdownOptionProps {
  optionName: string
  optionState: string | null
  setOptionState(value: string | null): void
  opts: string[]

}
const DropdownOption: React.FC<DropdownOptionProps> = ({
  optionName,
  optionState,
  setOptionState,
  opts,
}) => {
  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setOptionState(event.target.checked);
  //   if (!(setOpposite === undefined) && opposite) {
  //     setOpposite(!event.target.checked);
  //   }
  // };

  const handleAlignment = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    if (newAlignment !== null) {
      setOptionState(newAlignment);
    }
  };


  return (

  // <ListItem>
  //   <Checkbox
  //     checked={optionState}
  //     color="primary"
  //     onChange={handleChange}
  //     inputProps={{ 'aria-label': 'primary checkbox' }}
  //   />
  //   <ListItemText
  //     primary={optionName}
  //   />
  // </ListItem>

    // same button same max
    //
    <div>
      <ListItem>
        <ListItemText
          primary={optionName}
          secondary={(
            <>
              <StyledOptionToggle
                size="small"
                value={optionState}
                exclusive
                onChange={handleAlignment}
                aria-label="text alignment"
              >
                <StyledOptionButtonToggle value="off" aria-label="default">
                  off
                </StyledOptionButtonToggle>
                {opts.map((op) => (
                  <StyledOptionButtonToggle value={op} aria-label={op}>
                    {op}
                  </StyledOptionButtonToggle>
                ))}

              </StyledOptionToggle>
            </>
          )}
        />


      </ListItem>
    </div>

  );
};
// <StyledOptionButtonToggle value="1" aria-label="left aligned">
//   off
// </StyledOptionButtonToggle>
// {opposite && (
// <StyledOptionButtonToggle value="2" aria-label="left aligned">
//   {opts[0]}
// </StyledOptionButtonToggle>
// )}
//
// <StyledOptionButtonToggle value="3" aria-label="right aligned">
//   most
// </StyledOptionButtonToggle>

interface AutotimetablerProps {
  isDarkMode: boolean
}
const Autotimetable: React.FC<AutotimetablerProps> = ({ isDarkMode }) => {
  const [daysAtUni, setDaysAtUni] = React.useState<string | null>('off');
  const [timesOfDay, setTimesOfDay] = React.useState<string | null>('off');
  const [walkingDistance, setWalkingDistance] = React.useState<string | null>('off');
  const [friendsInClasses, setFriendsInClasses] = React.useState<string | null>('off');
  const [breaksBetweenClasses, setBreaksBetweenClasses] = React.useState<string | null>('off');

  // for opening popover
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
      <DropdownButton disableElevation aria-describedby={id} variant="contained" color={isDarkMode ? 'secondary' : 'default'} onClick={handleClick}>
        <Box ml="10px" flexGrow={1}>Auto-timetable Options</Box>
        {open ? (
          <ArrowDropUpIcon />
        ) : <ArrowDropDownIcon />}
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
          <DropdownOption
            optionName="Number of days at uni"
            optionState={daysAtUni}
            setOptionState={setDaysAtUni}
            opts={['least', 'most']}
          />
          <DropdownOption
            optionName="Class times"
            optionState={timesOfDay}
            setOptionState={setTimesOfDay}
            opts={['earlier', 'later']}

          />

          <DropdownOption
            optionName="Walking distance between classes"
            optionState={walkingDistance}
            setOptionState={setWalkingDistance}
            opts={['least']}


          />
          <DropdownOption
            optionName="Friends in classes"
            optionState={friendsInClasses}
            setOptionState={setFriendsInClasses}
            opts={['most']}
          />
          <DropdownOption
            optionName="Breaks between classes"
            optionState={breaksBetweenClasses}
            setOptionState={setBreaksBetweenClasses}
            opts={['least', 'most']}
          />

        </List>
        <ExecuteButton variant="contained" color="primary" disableElevation onClick={handleClose}>
          GO
          <FlashOnIcon />
        </ExecuteButton>
      </Popover>
    </div>
  );
};
export default Autotimetable;
