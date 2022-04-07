import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
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
import { TimePicker, KeyboardTimePicker } from '@material-ui/pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Tooltip from '@material-ui/core/Tooltip';
import { stringify } from 'querystring';
import { Fragment } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { FormControl, IconButton, Input, InputAdornment, Slider, Typography } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';

const DropdownButton = styled(Button)`
  width: 100%;
  height: 55px;
  text-align: left;
  margin-top: 20px;
  margin-right: 10px;
  text-transform: none;
  // padding: 6px 16px 6px 4px !important; 
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
 const StyledIconButton = styled(IconButton)`
  padding-bottom: 0px;
 `

interface DropdownOptionProps {
  optionName: string;
  optionState: string | null | string[];
  setOptionState(value: any): void;
  optionChoices: string[];
  multiple?: boolean;
  noOff?: boolean;
}
const DropdownOption: React.FC<DropdownOptionProps> = ({
  optionName,
  optionState,
  setOptionState,
  optionChoices,
  multiple,
  noOff,
}) => {
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
            {!noOff && (
              <StyledOptionButtonToggle value="off" aria-label="default">
                off
              </StyledOptionButtonToggle>
            )}
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
  auto(value: any, mode: string): void;
}

const Autotimetabler: React.FC<AutotimetablerProps> = ({ auto }) => {
  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr'];
  const [daysAtUni, setDaysAtUni] = React.useState<number>(5);
  // const [friendsInClasses, setFriendsInClasses] = React.useState<string | null>('off');
  const [breaksBetweenClasses, setBreaksBetweenClasses] = React.useState<number>(0);
  const [days, setDays] = React.useState<Array<string>>(weekdays);
  const { isDarkMode } = useContext(AppContext);
  const [startTime, setStartTime] = useState<Date>(new Date(2022, 0, 0, 9));
  const [endTime, setEndTime] = useState<Date>(new Date(2022, 0, 0, 21));
  const [classMode, setClassMode] = useState<string>('hybrid');

  // for opening popover
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const doAuto = () => {
    const ops: Array<string | number> = [
      startTime.getHours(),
      endTime.getHours(),
      days.map((v) => (weekdays.indexOf(v) + 1).toString()).reduce((a, b) => a + b),
      breaksBetweenClasses,
      daysAtUni,
    ];
    auto(ops, classMode);
    setAnchorEl(null);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const popoverId = open ? 'simple-popover' : undefined;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFormat = (newFormats: string[]) => {
    setDays(newFormats);
  };
  const [isOpenInfo, setIsOpenInfo] = React.useState(false);

  const toggleIsOpenInfo = () => {
    setIsOpenInfo(!isOpenInfo);
    console.log('hi mom')
  };

  return (
    <div style={{display: 'flex'}}>
      <DropdownButton
        disableElevation
        aria-describedby={popoverId}
        variant="contained"
        color={isDarkMode ? 'secondary' : 'default'}
        onClick={handleClick}
        >
        <Box ml="1px" flexGrow={1} marginTop='3px' >
          Auto-timetable
        </Box>
        <Box ml="5px"/>
        {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </DropdownButton>

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
        <StyledIconButton onClick={toggleIsOpenInfo}>
          <InfoIcon/>
        </StyledIconButton>
        <List>
          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={8}></Grid>

              <Grid item xs={8}>
                <ListItemText primary="Earliest start time" />
              </Grid>

              <Grid item xs={4}>
                <TimePicker
                  views={['hours']}
                  value={startTime}
                  onChange={(e) => {
                    if (e) setStartTime(e);
                  }}
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
                <TimePicker
                  views={['hours']}
                  value={endTime}
                  onChange={(e) => {
                    if (e) setEndTime(e);
                  }}
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
                <Slider
                  valueLabelDisplay="auto"
                  valueLabelFormat={(e) => e.toString() + ' hr' + (e === 1 ? '' : 's')}
                  step={1}
                  value={breaksBetweenClasses}
                  onChange={(e, v) => setBreaksBetweenClasses(v as number)}
                  min={0}
                  max={5}
                />
              </Grid>
            </Grid>
          </ListItem>

          <ListItem>
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <ListItemText primary="Max days of Uni" />
              </Grid>

              <Grid item xs={4}>
                <Slider
                  valueLabelDisplay="auto"
                  step={1}
                  value={daysAtUni}
                  onChange={(e, v) => setDaysAtUni(v as number)}
                  min={1}
                  max={5}
                />
              </Grid>
            </Grid>
          </ListItem>
            
          {/* <DropdownOption
            optionName="Max days of Uni"
            optionState={daysAtUni}
            setOptionState={setDaysAtUni}
            optionChoices={['1', '2']}
          /> */}
          <DropdownOption
            optionName="Mode"
            optionState={classMode}
            setOptionState={setClassMode}
            optionChoices={['hybrid', 'in person', 'online']}
            noOff
          />
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
