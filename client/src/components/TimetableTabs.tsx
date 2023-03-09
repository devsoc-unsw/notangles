import { Tabs, Tab } from '@mui/material';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import storage from '../utils/storage';

const TimetableTabs: React.FC = () => {
  type TimetableData = {
    name: String;
    selectedCourses: Array<Object>;
    selectedClasses: Object;
    createdEvents: Object;
  };

  const {
    is12HourMode,
    isDarkMode,
    isSquareEdges,
    isShowOnlyOpenClasses,
    isDefaultUnscheduled,
    isHideClassInfo,
    isHideExamClasses,
    isConvertToLocalTimezone,
    setAlertMsg,
    setErrorVisibility,
    days,
    term,
    year,
    setDays,
    earliestStartTime,
    setEarliestStartTime,
    latestEndTime,
    setLatestEndTime,
    setTerm,
    setYear,
    firstDayOfTerm,
    setFirstDayOfTerm,
    setTermName,
    setTermNumber,
    setCoursesList,
    setLastUpdated,
    selectedTimetable,
    setSelectedTimetable,
    displayTimetables,
    setDisplayTimetables,
  } = useContext(AppContext);

  // EXPERIMENTAL: Currently removes a timetable from local storage.
  // Intended behaviour is a placeholder for the menu -> delete on the current tab
  const handleDeleteTimetable = (targetIndex: number) => {
    const oldTimetables = storage.get('timetables');
    // If only one tab then prevent the delete
    if (oldTimetables.length > 1) {
      // Intended behaviour: closing current tab will move to the NEXT (+1) tab, unless it is the last tab
      let newIndex = targetIndex + 1;
      if (newIndex >= oldTimetables.length) {
        newIndex = targetIndex - 1;
      }

      const newTimetables = oldTimetables.filter((timetable: TimetableData, index: number) => index !== targetIndex);
      storage.set('timetables', newTimetables);
      setDisplayTimetables(newTimetables);
      setSelectedTimetable(newIndex);
    }
  };

  // EXPERIMENTAL: Currently adds a new timetable to local storage
  // Future feature: should have a defined constant for max size
  const handleCreateTimetable = () => {
    const oldTimetables = storage.get('timetables');
    const nextIndex = oldTimetables.length;

    const newTimetable: TimetableData = {
      name: `Timetable${nextIndex}`,
      selectedCourses: [],
      selectedClasses: {},
      createdEvents: {},
    };
    storage.set('timetables', [...oldTimetables, newTimetable]);

    setDisplayTimetables([...oldTimetables, newTimetable]);

    //Should switch current timetable to the new timetable
    setSelectedTimetable(nextIndex);
  };

  return (
    <div>
      {displayTimetables.map((timetable: TimetableData, index: number) => (
        <div key={index} onClick={() => setSelectedTimetable(index)}>
          {index === selectedTimetable ? 'CURRENT ' : ' '}
          {timetable.name}
          {index === selectedTimetable && (
            <button onClick={() => handleDeleteTimetable(index)}> x (replace with open menu) </button>
          )}
        </div>
      ))}
      <button onClick={handleCreateTimetable}> Replace later: Add new timetable </button>
    </div>
  );
};
export { TimetableTabs };
