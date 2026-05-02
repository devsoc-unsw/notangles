import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router';

import { Term, useAvailableTerms } from '../../api/times/times';
import { useTimetableIdsQuery } from '../../api/timetable/queries';
import Controls from './controls/Controls';
import Timetable from './timetable/Timetable';
import TimetableTabs from './timetableTabs/TimetableTabs';

const Planner: React.FC<{ sidebarCollapsed: boolean }> = ({ sidebarCollapsed }) => {
  const ICSButton = styled(Button)`
    && {
      min-width: 250px;
      margin: 2vh auto;
      background-color: ${({ theme }) => theme.palette.primary.main};
      color: #ffffff;
      &:hover {
        background-color: #598dff;
      }
    }
  `;

  // useDrag(handleSelectClass, handleRemoveClass);

  const location = useLocation();

  const terms = useAvailableTerms();
  // TODO: Initialise this in a smarter way
  const [term, setTerm] = useState<Term>(terms[0]);

  const timetableIds = useTimetableIdsQuery(term);
  const [timetableId, setTimetableId] = useState<string>(timetableIds.length > 0 ? timetableIds[0] : '');

  // Whenever timetable list changes, ensure selected timetable is valid
  // We only need to do this when the term changes, or on initial load
  useEffect(() => {
    if (timetableIds.length > 0 && !timetableIds.includes(timetableId)) {
      setTimetableId(timetableIds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timetableIds]);

  if (timetableIds.length === 0) {
    throw new Error('No timetables found for the selected term');
  }

  // TODO: Clean up social timetable handling - we check the pathname in a lot of places...
  const timetableView = useMemo(() => {
    const pathname = location.pathname;
    if (pathname === '/home') {
      return (
        <>
          <TimetableTabs term={term} selectedTimetableId={timetableId} selectTimetableId={setTimetableId} />
          <Timetable timetableId={timetableId} term={term} />
          {
            // TODO: Implement ICS download functionality
          }
          <ICSButton /*onClick={() => downloadIcsFile(selectedCourses, createdEvents, selectedClasses, firstDayOfTerm)*/
          >
            save to calendar
          </ICSButton>
        </>
      );
    } else {
      // TODO: Fill in the timetable view for social timetables
      return <>{/* <Timetable assignedColors={decodedAssignedColors} handleSelectClass={handleSelectClass} /> */}</>;
    }
  }, [location.pathname, term, timetableId]);

  return (
    <>
      <Controls
        sidebarCollapsed={sidebarCollapsed}
        term={term}
        setTerm={(term: Term) => {
          setTerm(term);
        }}
        timetableId={timetableId}
      />
      {
        // TODO: What is this outlet here for?
      }
      <Outlet />
      {timetableView}
    </>
  );
};

export default Planner;
