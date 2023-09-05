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
          <Tab label="How it Works" {...a11yProps(0)} />
          <Tab label="Keyboard Shortcuts" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <HowItWorks />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <KeyboardShortcut />
      </CustomTabPanel>
    </>
  );
};

const HowItWorks = () => {
  return (
    <>
      <StyledTypography variant="h6">How it works</StyledTypography>
      <Typography gutterBottom variant="body2">
        Select your courses, then drag-and-drop classes to customise your timetable. You can drag clutter (like lectures
        which you aren’t going to watch live) to the unscheduled column. Struggling to find an ideal timetable? Try out
        our auto-timetabling feature!
      </Typography>
      <HowToUseImg src={useGif} alt="how to use gif" />
      <Typography gutterBottom variant="body2">
        Note: Notangles does not enroll in your classes. It’s a tool for planning your timetable, but you’ll still need
        to officially enroll at&nbsp;
        <Link href="https://my.unsw.edu.au/" target="_blank">
          myUNSW
        </Link>
        .
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
