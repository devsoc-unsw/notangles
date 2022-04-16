import React, { ChangeEvent, useContext, useEffect, useRef, useState } from 'react';
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
  SelectChangeEvent,
  selectClasses,
  Typography,
} from '@mui/material';
import { ExpandedViewProps } from '../../interfaces/PropTypes';
import { Close } from '@mui/icons-material';
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
import { PeopleAlt } from '@mui/icons-material';

const StyledDialogTitle = styled(MuiDialogTitle)<DialogTitleProps>(({}) => ({
  padding: '8px 12px 8px 24px',
}));

const to24Hour = (n: number) => `${String((n / 1) >> 0)}:${String(n % 1)}0`;
const getTimeData = (time: ClassTime, days: string[]) => {
  return [days.at(time.day - 1), to24Hour(time.start), '\u2013', to24Hour(time.end), `(Weeks ${time.weeksString})`].join(' ');
};

interface LocationDropdownProps {
  sectionsAndLocations: Array<[Section, Location]>;
  handleChange(event: SelectChangeEvent<number>): void;
  selectedIndex: number;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  selectedIndex,
  sectionsAndLocations: sectionsAndLocations,
  handleChange,
}) => {
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

const isDuplicate = (a: ClassPeriod, b: ClassPeriod) =>
  a.time.day === b.time.day && a.time.start === b.time.start && a.time.end === b.time.end;

const getDuplicateClassData = (c: ClassPeriod) => {
  const periodIndex = c.class.periods.findIndex((p) => isDuplicate(p, c));

  const duplicateClasses = c.class.course.activities[c.class.activity].filter((value) =>
    value.periods.some((v, index) => index === periodIndex && isDuplicate(v, c))
  );
  const sectionsAndLocations: Array<[Section, Location]> = duplicateClasses.map((dc) => [
    dc.section,
    dc.periods[periodIndex].locations.at(0) ?? '',
  ]);

  return {
    duplicateClasses: duplicateClasses,
    sectionsAndLocations: sectionsAndLocations,
    periodIndex: periodIndex,
  } as DuplicateClassData;
};

type Section = string;
type Location = string;
interface DuplicateClassData {
  duplicateClasses: ClassData[]; // other classes of the same course running at the same time
  sectionsAndLocations: Array<[Section, Location]>; // wherein sectionsAndLocations[i] is a tuple of the Section (i.e. the class' "code") and Location for duplicateClasses[i]
  periodIndex: number; // the relevant index (as classes have multiple periods, i.e. Tut-Labs)
}

/*
Displays expanded view of a droppedClass and allows for changing a class to others that occur at the same time period.
the LocationDropdown shows the different locations and allows the choosing of other classes at this time slot.
ExpandedView keeps an interenal reference of the currently selected class/period to display the changes from dropdown-selecting different classes, but it call a 'selectClass' function with
each change to this internal reference. Instead the new chosen class is officially selected when the ExpandedView is closed and handled by the handleClose function of its parent. This is done
becuase otherwise the view will close itself whenever a new item is selected in the locations dropdown.

Currently only intended to be appear on non-unscheduled classCards -- i.e. cardData but technically be of type PeriodData
*/
const ExpandedView: React.FC<ExpandedViewProps> = ({ cardData, open, handleClose }) => {
  const { days } = useContext(AppContext);

  const [currentPeriod, setCurrentPeriod] = useState<ClassPeriod>(cardData); // the period currently being used to display data from -- gets changed when a class is selected in dropdown and when cardData changes.

  const duplicateClassData = useRef<DuplicateClassData>(getDuplicateClassData(cardData)); // the relevant data to handle class changing with location dropdown

  const [selectedIndex, setSelectedIndex] = useState<number>(0); // index of the currently selected class in sectionsAndLocations array; defaults as 0 but it's real initial value is set by the useEffect anyway (most likely ends up 0 however to start with)

  useEffect(() => {
    // updates the data when changing to another time slot -- e.g. dragging the card around
    if (!isPeriod(cardData)) return;

    setCurrentPeriod(cardData);
    duplicateClassData.current = getDuplicateClassData(cardData); // current sectionsAndLocations has to be recalculated here otherwise the following line will use the unupdated value
    setSelectedIndex(
      duplicateClassData.current.sectionsAndLocations.findIndex(([section]) => section === cardData.class.section)
    ); // makes selected item in new initial location dropdown the right one
  }, [cardData]);

  const handleLocationChange = (e: SelectChangeEvent<number>) => {
    // updates index and current period when selected with dropdown
    setSelectedIndex(e.target.value as number);
    const newPeriod =
      duplicateClassData.current.duplicateClasses[e.target.value as number].periods[duplicateClassData.current.periodIndex];
    if (isPeriod(newPeriod)) setCurrentPeriod(newPeriod);
  };

  return (
    <Dialog maxWidth="sm" open={open} onClose={() => handleClose(duplicateClassData.current.duplicateClasses[selectedIndex])}>
      <StyledDialogTitle>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{}}>
            {cardData.class.course.code} — {cardData.class.course.name}
          </div>

          <div style={{ width: '8px' }} />

          <div>
            <IconButton
              aria-label="close"
              onClick={() => handleClose(duplicateClassData.current.duplicateClasses[selectedIndex])}
            >
              <Close />
            </IconButton>
          </div>
        </Box>
      </StyledDialogTitle>
      <DialogContent style={{ paddingBottom: '20px' }}>
        <Grid container direction="column" spacing={2}>
          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <DesktopMac />
            </Grid>
            <Grid item>
              <Typography>
                {cardData && cardData.class.activity} (
                {cardData && duplicateClassData.current.sectionsAndLocations.at(selectedIndex)?.at(0)})
              </Typography>
            </Grid>
          </Grid>

          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <AccessTime />
            </Grid>
            <Grid item>
              <Typography>{currentPeriod && getTimeData(currentPeriod.time, days)}</Typography>
            </Grid>
          </Grid>

          <Grid item container direction="row" spacing={2} alignItems="center">
            <Grid item>
              <LocationOn />
            </Grid>
            <Grid item style={{ flexGrow: 1 }}>
              {
                <LocationDropdown
                  selectedIndex={selectedIndex}
                  sectionsAndLocations={duplicateClassData.current.sectionsAndLocations}
                  handleChange={handleLocationChange}
                />
              }
            </Grid>
          </Grid>

          <Grid item container direction="row" spacing={2} alignItems="center">
            <Grid item>
              <PeopleAlt />
            </Grid>
            <Grid item>
              <Typography>
                Capacity {currentPeriod?.class.enrolments} / {currentPeriod?.class.capacity}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ExpandedView;
