import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { styled } from '@mui/system';

const StyledTypography = styled(Typography)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const Support: React.FC = () => {
  const createData = (
    description: string,
    mac: string,
    window: string,
  ) => {
    return { description, mac, window };
  }
  
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
            <TableRow
              key={row.description}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
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
