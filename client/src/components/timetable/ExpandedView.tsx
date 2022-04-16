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
} from '@mui/material';
import { ExpandedViewProps } from '../../interfaces/PropTypes';
// import styled from 'styled-components';
import {Close} from '@mui/icons-material';
import { CardData, isPeriod } from '../../utils/Drag';
import { styled } from '@mui/styles';
import { ClassData } from '../../interfaces/Course';
import MuiDialogTitle from '@mui/material/DialogTitle';
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
} from '@mui/icons-material';
import { ClassPeriod, ClassTime } from '../../interfaces/Course';
import { AppContext } from '../../context/AppContext';
import {PeopleAlt} from '@mui/icons-material';

const StyledDialogTitle = styled(MuiDialogTitle)<DialogTitleProps>(({}) => ({
  padding: '8px 12px 8px 24px',
}));

const to24Hour = (n: number) => `${String((n / 1) >> 0)}:${String(n % 1)}0`;
const getTimeData = (time: ClassTime, days: string[]) => {
  return [days.at(time.day - 1), to24Hour(time.start), '\u2013', to24Hour(time.end), `(Weeks ${time.weeksString})`].join(' ');
};

interface LocationDropdownProps {
  locations: string[][];
  handleChange: any;
  selectedLocation: number;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({ selectedLocation, locations, handleChange }) => {
  return (
    <FormControl fullWidth>
      <Select
        labelId="simple-select"
        id="simple-select"
        variant="outlined"
        value={selectedLocation}
        inputProps={{ 'aria-label': 'Without label' }}
        onChange={handleChange}
      >
        {locations.map((location, index) => (
          <MenuItem value={index}>
            <Typography>{location[1]}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const isDuplicate = (a: ClassPeriod, b: ClassPeriod) => a.time.day === b.time.day && a.time.start === b.time.start && a.time.end === b.time.end;



// TODO: Tidy this up

const getSections = (c: ClassPeriod) => {
  const periodIndex = c.class.periods.findIndex((p) => isDuplicate(p, c));
  // if (periodIndex === -1) return [undefined, undefined]

  const duplicateClasses = c.class.course.activities[c.class.activity].filter((value) =>
    value.periods.some(
      (v, index) => index === periodIndex && isDuplicate(v, c) && (!false || value.enrolments !== value.capacity)
    )
  );

  const sectionsAndLocations = duplicateClasses.map((dc) => ([dc.section, dc.periods[periodIndex].locations.at(0) ?? '']))

  return [duplicateClasses, sectionsAndLocations] as [ClassData[], string[][]];
};

const ExpandedView: React.FC<ExpandedViewProps> = ({ shiftClasses, cardData, open, handleClose, handleSelectClass }) => {
  const course = cardData.class.course;
  const { days } = useContext(AppContext);
  const period = isPeriod(cardData) ? cardData : undefined;
  
  if (!period) return <></>;
  
  const [duplicateClasses, sectionsAndLocations]: [ClassData[], string[][]] = getSections(period);
  //   console.log(sections)
  const [selectedLocation, setSelectedLocation] = useState<number>(sectionsAndLocations.findIndex(sal => sal[1] === period.locations.at(0))); // TODO: make it not zero

  const handleLocationChange = (e: any) => {
    // setSelectedLocation(e.target.value);
    handleSelectClass(
        duplicateClasses[e.target.value]
        );
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
              <Close />
            </IconButton>
          </div>
        </Box>
      </StyledDialogTitle>
      {/* <Divider /> */}
      <DialogContent style={{ paddingBottom: '20px' }}>
        <Grid container direction="column" spacing={2}>
          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <DesktopWindows />
            </Grid>
            <Grid item>
              <Typography>
                {cardData.class.activity} ({sectionsAndLocations[selectedLocation][0]})
              </Typography>
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

          <Grid item container direction="row" spacing={2} alignItems="center">
            <Grid item>
              <LocationOn />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              {period && (
                <LocationDropdown
                  selectedLocation={selectedLocation}
                  locations={sectionsAndLocations}
                  handleChange={handleLocationChange}
                />
              )}
            </Grid>
          </Grid>

          <Grid item container direction="row" spacing={2} alignItems="center">
            <Grid item>
              <PeopleAlt />
            </Grid>
            <Grid item>
              <Typography>
                Capacity {period?.class.enrolments} / {period?.class.capacity}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ExpandedView;
