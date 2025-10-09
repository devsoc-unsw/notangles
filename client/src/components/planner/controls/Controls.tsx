import { Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

// import Autotimetabler from './Autotimetabler';
// import CustomEvents from './CustomEvent';
// import History from './History';
import { Term } from '../../../api/times/times';
import CourseSelect from './CourseSelect';
import TermSelect from './TermSelect';

const TermSelectWrapper = styled(Box)`
  flex: 0 0 auto;
  margin-top: 20px;
  margin-right: 10px;
  min-width: 140px;
  display: flex;
  align-items: flex-start;
`;

const SelectWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  grid-column: 1 / -1;
  grid-row: 1;
  padding-top: 20px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
`;

const AutotimetablerWrapper = styled(Box)`
  flex: 1;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex: none;
  }
`;

const CustomEventsWrapper = styled(Box)`
  flex: 1;
`;

const HistoryWrapper = styled(Box)`
  margin-top: 20px;
  margin-left: 3px;
`;

const Controls: React.FC<{ term: Term; setTerm: (term: Term) => void; timetableId: string }> = ({
  term,
  setTerm,
  timetableId,
}) => {
  // TODO: Re-enable custom events, autotimetabler and history

  return (
    <Grid container sx={{ paddingLeft: '66px' }} spacing={2}>
      <Grid
        container
        direction="row"
        size={{
          xs: 12,
          md: 6.5,
        }}
      >
        <TermSelectWrapper>
          <TermSelect term={term} setTerm={setTerm} />
        </TermSelectWrapper>

        <SelectWrapper minWidth={'296px'}>
          <CourseSelect term={term} timetableId={timetableId} />
        </SelectWrapper>
      </Grid>
      <Grid
        container
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        size={{
          xs: 12,
          md: 5.5,
        }}
      >
        <CustomEventsWrapper>{/* <CustomEvents /> */}</CustomEventsWrapper>
        <AutotimetablerWrapper>{/* <Autotimetabler /> */}</AutotimetablerWrapper>
        <HistoryWrapper>{/* <History /> */}</HistoryWrapper>
      </Grid>
    </Grid>
  );
};

export default Controls;
