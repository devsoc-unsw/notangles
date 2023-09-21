import React from 'react';
import {
  Link,
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
import useGif from '../../assets/how_to_use.gif';
import createAClass1 from '../../assets/how_to_create_class_1.png';
import createAClass2 from '../../assets/how_to_create_class_2.png';
import createAClass3a from '../../assets/how_to_create_class_3a.png';
import createAClass3b from '../../assets/how_to_create_class_3b.png';
import createAClass4 from '../../assets/how_to_create_class_4.png';

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
        <></>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <KeyboardShortcut />
      </CustomTabPanel>
    </>
  );
};

const HowToCreateAClass = () => {
  return (
    <>
      <StyledTypography variant="h6">How to create a class</StyledTypography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 1. Select your courses in the top left search bar
        <HowToUseImg src={createAClass1} alt="how to create a class step 1" />
      </Typography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 2. Drag-and-drop classes to customise your timetable
        <HowToUseImg src={createAClass2} alt="how to create a class step 2" />
      </Typography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 3. Drag clutter (like lectures you are going to watch live) to the unscheduled column
        <HowToUseImg src={createAClass3a} alt="how to create a class step 3a" />
        <HowToUseImg src={createAClass3b} alt="how to create a class step 3b" />
      </Typography>

      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 4. Struggling to find an ideal timetable? Try out our auto-timetabling feature!
        <HowToUseImg src={createAClass4} alt="how to create a class step 4" />
      </Typography>
    </>
  );
};

const HowToCreateAnEvent = () => {
  return (
    <>
      <StyledTypography variant="h6">How to create a class</StyledTypography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 1. Select your courses in the top left search bar
        <HowToUseImg src={createAClass1} alt="how to create a class step 1" />
      </Typography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 2. Drag-and-drop classes to customise your timetable
        <HowToUseImg src={createAClass2} alt="how to create a class step 2" />
      </Typography>
      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 3. Drag clutter (like lectures you are going to watch live) to the unscheduled column
        <HowToUseImg src={createAClass3a} alt="how to create a class step 3a" />
        <HowToUseImg src={createAClass3b} alt="how to create a class step 3b" />
      </Typography>

      <Typography gutterBottom variant="body2" paddingBottom={3}>
        Step 4. Struggling to find an ideal timetable? Try out our auto-timetabling feature!
        <HowToUseImg src={createAClass4} alt="how to create a class step 4" />
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
