import { Box, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router';

import { Term } from '../../../api/times/times';
import UserProfile from '../../sidebar/friends/UserProfile';
import Autotimetabler from './Autotimetabler';
import CourseSelect from './CourseSelect';
import CustomEvents from './customEvents/CustomEvents';
import History from './History';
import TermSelect from './TermSelect';

const TermSelectWrapper = styled(Box)`
  flex: 0 0 auto;
  margin-top: 20px;
  margin-right: 10px;
  min-width: 140px;
  display: flex;
  align-items: flex-start;
`;

const FriendTimetableLabelContainer = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background-color: ${({ theme }) => theme.palette.secondary.light};
  border: 0.75px solid;
  border-color: ${({ theme }) => theme.palette.text.primary};
  padding: 10px 0;
  border-top-left-radius: ${({ theme }) => theme.shape.borderRadius}px;
  border-top-right-radius: ${({ theme }) => theme.shape.borderRadius}px;
  font-weight: 700;
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

const Controls: React.FC<{
  sidebarCollapsed: boolean;
  term: Term;
  setTerm: (term: Term) => void;
  timetableId: string;
}> = ({ sidebarCollapsed, term, setTerm, timetableId }) => {
  // TODO: Re-enable custom events, autotimetabler and history

  const location = useLocation();
  const additionalControlsDisplay = useMemo(() => {
    if (location.pathname !== '/home') {
      return (
        <>
          <TermSelectWrapper>
            <TermSelect term={term} setTerm={setTerm} />
          </TermSelectWrapper>
          <FriendTimetableLabelContainer>
            <UserProfile
              sidebarCollapsed={sidebarCollapsed}
              firstName="Sunny"
              lastName="Chen"
              overrideCollapse={true}
            />
          </FriendTimetableLabelContainer>
        </>
      );
    }
    return (
      <>
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
          <CustomEventsWrapper>
            <CustomEvents term={term} timetableId={timetableId} />
          </CustomEventsWrapper>
          <AutotimetablerWrapper>
            <Autotimetabler />
          </AutotimetablerWrapper>
          <HistoryWrapper>
            <History />
          </HistoryWrapper>
        </Grid>
      </>
    );
  }, [location.pathname, sidebarCollapsed, setTerm, term, timetableId]);

  return (
    <Grid container sx={{ paddingLeft: '66px' }} spacing={2}>
      {additionalControlsDisplay}
    </Grid>
  );
};

export default Controls;
