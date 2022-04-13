import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  BoxProps,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogTitleProps,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Typography,
} from '@material-ui/core';
import { ExpandedViewProps } from '../../interfaces/PropTypes';
// import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';
import { CardData, isPeriod } from '../../utils/Drag';
import { styled } from '@material-ui/styles';

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import {
  AccessTime,
  AccessTimeOutlined,
  AccessTimeTwoTone,
  Computer,
  DesktopMac,
  DesktopWindows,
  ExpandMore,
  LocationCity,
  LocationOn,
} from '@material-ui/icons';
import { ClassPeriod, ClassTime } from '../../interfaces/Course';
import { AppContext } from '../../context/AppContext';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';


const StyledDialogTitle = styled(MuiDialogTitle)<DialogTitleProps>(({}) => ({
  padding: '8px 12px 8px 24px',
}));

const to24Hour = (n: number) => `${String((n / 1) >> 0)}:${String(n % 1)}0`;
const getTimeData = (time: ClassTime, days: string[]) => {
  return [days.at(time.day - 1), to24Hour(time.start), '\u2013', to24Hour(time.end), `(Weeks ${time.weeksString})`].join(' ');
};

interface LocationDropdownProps {
  locations: string[];
  handleChange: any;
  selectedLocation: number;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({ selectedLocation, locations, handleChange }) => {
  return (
    <FormControl fullWidth>
      <Select
        MenuProps={{
          getContentAnchorEl: null,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
        }}
        labelId="simple-select"
        id="simple-select"
        variant="standard"
        value={selectedLocation}
        inputProps={{ 'aria-label': 'Without label' }}
        onChange={handleChange}
      >
        {locations.map((location, index) => (
          <MenuItem value={index}><Typography>{location}</Typography></MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// TODO: Tidy this up
const isDuplicate = (a: ClassPeriod, b: ClassPeriod) =>
    a.time.day === b.time.day && a.time.start === b.time.start && a.time.end === b.time.end;

const getSections = (c: ClassPeriod) => {
    const periodIndex = c.class.periods.findIndex(p => isDuplicate(p, c))
    if (periodIndex === -1) return ['stuff', 'stuff2'];
    
    const duplicateClasses = c.class.course.activities[c.class.activity].filter((value) =>
    value.periods.some((v, index) => index === periodIndex && isDuplicate(v, c) && (!false || value.enrolments !== value.capacity))
    );
    console.log(duplicateClasses)

    return duplicateClasses.map(dc => [dc.section, dc.periods[periodIndex].locations.at(0) ?? 'stuff']);
  };

const ExpandedView: React.FC<ExpandedViewProps> = ({ shiftClasses, cardData, open, handleClose }) => {
  const course = cardData.class.course;
  const { days } = useContext(AppContext);
  const period = isPeriod(cardData) ? cardData : undefined;
  const [selectedLocation, setSelectedLocation] = useState<number>(0);

  if (!period) return (<></>);
  
  const sections: any = getSections(period);
  console.log(sections)

  const handleLocationChange = (e: any) => {
    // handleSelectClass(
    //     newclasses[(newclasses.findIndex((v) => v.id === c.class.id) + dir) % newclasses.length]
    //   );
    setSelectedLocation(e.target.value);
  };
  return (
    <Dialog maxWidth="sm" open={open} onClose={() => handleClose(selectedLocation)}>
      <StyledDialogTitle>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{}}>
            {course.code} — {course.name}
          </div>

          <div style={{ width: '8px' }} />

          <div>
            <IconButton aria-label="close" onClick={() => handleClose(selectedLocation)}>
              <CloseIcon />
            </IconButton>
          </div>
        </Box>
      </StyledDialogTitle>
      {/* <Divider /> */}
      <DialogContent style={{ paddingBottom: '20px' }}>

        <Grid container direction="column" spacing={2} >
          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <DesktopWindows />
            </Grid>
            <Grid item>
              <Typography>{cardData.class.activity} ({sections && sections[selectedLocation]})</Typography>
            </Grid>
          </Grid>

          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <AccessTime />
            </Grid>
            <Grid item>
              <Typography>{period && getTimeData(period.time, days)}</Typography>
            </Grid>
          </Grid>

          <Grid item container direction="row" spacing={2} alignItems='center'>
            <Grid item>
              <LocationOn />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              {period && sections && <LocationDropdown selectedLocation={selectedLocation} locations={period.locations} handleChange={handleLocationChange} />}
            </Grid>
          </Grid>

          <Grid item container direction="row" spacing={2} alignItems='center'>
            <Grid item>
              <PeopleAltIcon />
            </Grid>
            <Grid item>
              <Typography>Capacity {period?.class.enrolments} / {period?.class.capacity}</Typography>
            </Grid>
          </Grid>

        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ExpandedView;
