import { API_URL } from '../api/config';
import getCourseInfo from '../api/getCourseInfo';
import { User } from '../components/sidebar/UserAccount';
import useColorMapper from '../hooks/useColorMapper';
import {
  ClassData,
  CourseData,
  CreatedEvents,
  DisplayTimetablesMap,
  EventPeriod,
  SelectedClasses,
  TimetableData,
} from '../interfaces/Periods';

export const syncAddTimetable = async (userId: string, newTimetable?: TimetableData) => {
  try {
    if (!userId) {
      console.log('User is not logged in');
      return;
    }
    let timetable = {
      userId,
      selectedCourses: [],
      //   selectedCourses: selectedCourses.map((t) => t.code),
      // selectedClasses: convertClassToDTO(selectedClasses),
      // createdEvents: convertEventToDTO(createdEvents),
      selectedClasses: [],
      createdEvents: [],
      name: 'My Timetable',
      mapKey: 'T3', //TODO hardcoded atm.
    };
    // if (!newTimetable) {
    //   // timetable.selectedClasses =
    // }
    // const { selectedCourses, selectedClasses, createdEvents, name } = newTimetable;
    await fetch(`${API_URL.server}/user/timetable`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timetable),
    });
  } catch (e) {
    console.log(e);
  }
};
