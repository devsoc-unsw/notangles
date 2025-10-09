import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import { Term, useAvailableTerms } from '../../api/times/times';
import { useTimetableIdsQuery } from '../../api/timetable/queries';
import Controls from './controls/Controls';
import TimetableTabs from './timetableTabs/TimetableTabs';

const Planner: React.FC = () => {
  // const ICSButton = styled(Button)`
  //   && {
  //     min-width: 250px;
  //     margin: 2vh auto;
  //     background-color: ${({ theme }) => theme.palette.primary.main};
  //     color: #ffffff;
  //     &:hover {
  //       background-color: #598dff;
  //     }
  //   }
  // `;

  // useDrag(handleSelectClass, handleRemoveClass);

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

  return (
    <>
      <Controls
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
      <TimetableTabs term={term} selectedTimetableId={timetableId} selectTimetableId={setTimetableId} />
      {/* <Timetable assignedColors={decodedAssignedColors} handleSelectClass={handleSelectClass} />
      <ICSButton onClick={() => downloadIcsFile(selectedCourses, createdEvents, selectedClasses, firstDayOfTerm)}>
        save to calendar
      </ICSButton> */}
    </>
  );
};

export default Planner;
