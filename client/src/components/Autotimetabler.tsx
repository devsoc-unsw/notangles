import React, { useContext } from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import FlashOnIcon from '@material-ui/icons/FlashOn';
import Grid from '@material-ui/core/Grid';
import { AppContext } from '../context/AppContext';

import Tooltip from '@material-ui/core/Tooltip';
import { stringify } from 'querystring';

const DropdownButton = styled(Button)`
  width: 100%;
  height: 55px;
  text-align: left;
  margin-top: 20px;
  margin-right: 10px;
  text-transform: none;
`;

const ExecuteButton = styled(Button)`
  width: 100%;
  border-radius: 0px 0px 5px 5px;
`;

const StyledOptionToggle = styled(ToggleButtonGroup)`
  margin-top: 10px;
  width: 100%;
`;
const StyledOptionButtonToggle = styled(ToggleButton)`
  width: 100%;
  height: 32px;
  margin-bottom: 10px;
`;

interface DropdownOptionProps {
  optionName: string;
  optionState: string | null | string[];
  setOptionState(value:any): void;
  optionChoices: string[];
  multiple?: boolean;
  noOff?: boolean;
}
const DropdownOption: React.FC<DropdownOptionProps> = ({ optionName, optionState, setOptionState, optionChoices, multiple, noOff }) => {
  const handleOptionChange = (event: React.MouseEvent<HTMLElement>, newOption: string | null) => {
    if (newOption !== null) {
      setOptionState(newOption);
    }
  };

  return (
    <ListItem key={optionName}>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <ListItemText primary={optionName} />
        </Grid>
        <Grid item xs={12}>
          <StyledOptionToggle
            size="small"
            exclusive={multiple ? false : true}
            value={optionState}
            onChange={handleOptionChange}
            aria-label="option choices"
          >
            {!noOff && <StyledOptionButtonToggle value="off" aria-label="default">
              off
            </StyledOptionButtonToggle>}
            {optionChoices.map((op) => (
              <StyledOptionButtonToggle key={op} value={op} aria-label={op}>
                {op}
              </StyledOptionButtonToggle>
            ))}
          </StyledOptionToggle>
        </Grid>
      </Grid>
    </ListItem>
  );
};

interface AutotimetablerProps {
  auto(value: any): void;
}

const Autotimetabler: React.FC<AutotimetablerProps> = ({auto}) => {
  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
  const [daysAtUni, setDaysAtUni] = React.useState<string | null>('off');
  const [timesOfDay, setTimesOfDay] = React.useState<string | null>('off');
  const [walkingDistance, setWalkingDistance] = React.useState<string | null>('off');
  const [friendsInClasses, setFriendsInClasses] = React.useState<string | null>('off');
  const [breaksBetweenClasses, setBreaksBetweenClasses] = React.useState<string | null>('');
  const [startValue, setStartValue] = React.useState<string>('');
  const [endValue, setEndValue] = React.useState<string>('');
  const [days, setDays] = React.useState<Array<string>>(weekdays)
  const { isDarkMode } = useContext(AppContext);

  // for opening popover
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  
  const doAuto = () => {
    const ops: Array<string|null> = [startValue, endValue, days.map(v => (weekdays.indexOf(v) + 1).toString()).reduce((a,b) => a + b), breaksBetweenClasses, daysAtUni == "off" ? "5" : daysAtUni]
    auto(ops)
    setAnchorEl(null);
  }
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // execute autotimetabling
    setAnchorEl(event.currentTarget);
  };
  const handleFormat = (
    newFormats: string[],
  ) => {
    setDays(newFormats);
  };

  return (
    <div>
      <Tooltip title="Coming Soon" placement="bottom">
        <div>
          <DropdownButton
            // disabled
            disableElevation
            aria-describedby={popoverId}
            variant="contained"
            color={isDarkMode ? 'secondary' : 'default'}
            onClick={handleClick}
          >
            <Box ml="10px" flexGrow={1}>
              Auto-timetable
            </Box>
            {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </DropdownButton>
        </div>
      </Tooltip>

      <Popover
        id={popoverId}
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
        <List>
          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <ListItemText primary="Earliest start time" />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  id="outlined-number"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event) => setStartValue(event.target.value)}
                />
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <ListItemText primary="Earliest end time" />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  id="outlined-number"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event) => setEndValue(event.target.value)}
                />
              </Grid>
            </Grid>
          </ListItem>

          <DropdownOption
            optionName="Days"
            optionState={days}
            setOptionState={handleFormat}
            optionChoices={weekdays}
            multiple={true}
            noOff
          />

          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <ListItemText primary="Breaks between classes" />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  id="outlined-number"
                  type="number"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={(event) => setBreaksBetweenClasses(event.target.value)}
                />
              </Grid>
            </Grid>
          </ListItem>

          <DropdownOption
            optionName="Max days of Uni"
            optionState={daysAtUni}
            setOptionState={setDaysAtUni}
            optionChoices={['1', '2']}
          />

          {/* <DropdownOption
            optionName=" times"
            optionState={timesOfDay}
            setOptionState={setTimesOfDay}
            optionChoices={['earlier', 'later']}
          />

          <DropdownOption
            optionName="Walking distance between classes"
            optionState={walkingDistance}
            setOptionState={setWalkingDistance}
            optionChoices={['least']}
          />
          <DropdownOption
            optionName="Friends in classes"
            optionState={friendsInClasses}
            setOptionState={setFriendsInClasses}
            optionChoices={['most']}
          /> */}
        </List>
        <ExecuteButton variant="contained" color="primary" disableElevation onClick={doAuto}>
          <FlashOnIcon />
          GO
        </ExecuteButton>
      </Popover>
    </div>
  );
};
export default Autotimetabler;
