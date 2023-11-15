import React from 'react';
import {
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { Box, styled } from '@mui/system';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';

import createClass1 from '../../assets/support/createEvent/create_class_1.png';
import createClass2 from '../../assets/support/createEvent/create_class_2.png';
import createClass3 from '../../assets/support/createEvent/create_class_3.png';
import createClass4 from '../../assets/support/createEvent/create_class_4.png';

import shareEvent1 from '../../assets/support/shareEvent/share_event_1.png';
import shareEvent2 from '../../assets/support/shareEvent/share_event_2.png';
import shareEvent3 from '../../assets/support/shareEvent/share_event_3.png';
import shareEvent4 from '../../assets/support/shareEvent/share_event_4.png';

const StyledTypography = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const HowToUseImg = styled('img')`
  display: block;
  margin: 10px auto 10px;
  width: 100%;
  border-radius: 2%;
`;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const Support: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  const CustomTabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Create a Class" {...a11yProps(0)} />
          <Tab label="Create an Event" {...a11yProps(1)} />
          <Tab label="Event Sharing" {...a11yProps(2)} />
          <Tab label="Keyboard Shortcuts" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <HowToCreateAClass />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <HowToCreateAnEvent />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <HowToEventShare />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <KeyboardShortcut />
      </CustomTabPanel>
    </>
  );
};

const getCarouselProps = () => ({
  infiniteLoop: true,
  showStatus: false, //removes 'x out of y'
  showThumbs: false,
});

type CarouselCard = {
  step: string;
  imageSource: string;
};

const createCarouselCard = (card: CarouselCard) => {
  return (
    <div>
      <img src={card.imageSource} />
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        {card.step}
      </Typography>
    </div>
  );
};

const HowToCreateAClass = () => {
  const carouselCards: CarouselCard[] = [
    { step: 'Step 1. Select your courses in the top left search bar', imageSource: createClass1 },
    { step: 'Step 2. Drag-and-drop classes to customise your timetable', imageSource: createClass2 },
    {
      step: 'Step 3. Drag clutter (like lectures you are going to watch live) to the unscheduled column',
      imageSource: createClass3,
    },
    {
      step: 'Step 4. Struggling to find an ideal timetable? Try out our auto-timetabling feature!',
      imageSource: createClass4,
    },
  ];

  return (
    <>
      <StyledTypography variant="h6">How to Create a Class</StyledTypography>
      <Carousel {...getCarouselProps()}>
        {carouselCards.map((card, _i) => {
          return createCarouselCard(card);
        })}
      </Carousel>
    </>
  );
};

const HowToEventShare = () => {
  const carouselCards: CarouselCard[] = [
    { step: 'Step 1. On the event you want to share, click the more options.', imageSource: shareEvent1 },
    { step: 'Step 2. Select the duplicate button. This will copy the event link to your clipboard which you can then share to your friends.', imageSource: shareEvent2 },
    {
      step: 'Step 3. When your friend enters the event link in their URL, the event will pop up! ',
      imageSource: shareEvent3,
    },
    {
      step: 'Step 4. The event is successfully added to your friend\'s timetable',
      imageSource: shareEvent4,
    },
  ];

  return (
    <>
      <StyledTypography variant="h6">How to Share an Event</StyledTypography>
      <Carousel {...getCarouselProps()}>
        {carouselCards.map((card, _i) => {
          return createCarouselCard(card);
        })}
      </Carousel>
    </>
  );
};

const HowToCreateAnEvent = () => {
  return (
    <>
      <StyledTypography variant="h6">How to create a class</StyledTypography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 1. Select your courses in the top left search bar
        <HowToUseImg src={createClass1} alt="how to create a class step 1" />
      </Typography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 2. Drag-and-drop classes to customise your timetable
        <HowToUseImg src={createClass2} alt="how to create a class step 2" />
      </Typography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 3. Drag clutter (like lectures you are going to watch live) to the unscheduled column
        <HowToUseImg src={createClass3} alt="how to create a class step 3a" />
        <HowToUseImg src={createClass3} alt="how to create a class step 3b" />
      </Typography>

      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 4. Struggling to find an ideal timetable? Try out our auto-timetabling feature!
        <HowToUseImg src={createClass4} alt="how to create a class step 4" />
      </Typography>
    </>
  );
};

const KeyboardShortcut = () => {
  const createData = (description: string, mac: string, window: string) => {
    return { description, mac, window };
  };

  const rows = [
    createData('Undo within current timetable', '⌘ + Z', 'Ctrl + Z'),
    createData('Redo within current timetable', '⌘ + Shift + Z', 'Ctrl + Y'),
    createData('Create new timetable', '⌘ + Enter', 'Ctrl + Enter'),
    createData('Delete current timetable', '⌘ + Delete', 'Ctrl + Backspace'),
    createData('Delete ALL timetables', '⌘ + D', 'Ctrl + D'),
  ];

  return (
    <>
      <StyledTypography variant="h6">Keyboard Shortcuts</StyledTypography>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="left">Mac</TableCell>
              <TableCell align="left">Window</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.description} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {row.description}
                </TableCell>
                <TableCell align="left">{row.mac}</TableCell>
                <TableCell align="left">{row.window}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Support;
