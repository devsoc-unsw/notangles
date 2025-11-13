import { Class, Event } from '@mui/icons-material';
import { Autocomplete, ListItemIcon, TextField } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { Term, useCourseListQuery, useCoursesClassTimesQuery } from '../../../../api/times/times';
import { useAddTimetableEvent } from '../../../../api/timetable/mutations';
import { StyledListItem } from '../../../../styles/ControlStyles';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TUTORING_ACTIVITY_TYPES = ['Tutorial', 'Laboratory', 'Tutorial-Laboratory', 'Workshop', 'Seminar', 'Project'];

interface CustomEventsTutoringFormProps {
  setTutoringEventFormSatisfied: (satisfied: boolean) => void;
  term: Term;
  timetableId: string;
  color: string;
}

const CustomEventsTutoringForm = forwardRef(
  ({ term, setTutoringEventFormSatisfied, timetableId, color }: CustomEventsTutoringFormProps, ref) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<{
      day: string;
      startTime: string;
      endTime: string;
      classId: string;
      section: string;
      activity: string;
      location: string;
    } | null>(null);

    const courseSelectionRef = useRef<HTMLInputElement>(null);

    const courseList = useCourseListQuery(term);
    const classList = useCoursesClassTimesQuery(selectedCourseId ? [selectedCourseId] : [], term.year, term.term);
    const queryClient = useQueryClient();
    const eventCreateMutation = useAddTimetableEvent(queryClient);

    const classListOptions = useMemo(
      () =>
        classList
          .filter((cls) => cls.times.length > 0 && TUTORING_ACTIVITY_TYPES.includes(cls.activity))
          .map(({ times: cls, class_id, section, activity }) => ({
            day: cls[0].day,
            startTime: cls[0].time.split('-')[0].trim(),
            endTime: cls[cls.length - 1].time.split('-')[1].trim(),
            classId: class_id,
            section,
            activity,
            location: cls[0].location,
          })),
      [classList],
    );

    useEffect(() => {
      setTutoringEventFormSatisfied(!!selectedCourseId && !!selectedClass);
    }, [selectedCourseId, selectedClass, setTutoringEventFormSatisfied]);

    const handleCreateEvent = useCallback(() => {
      if (!selectedClass) return;
      const startTimeHours = parseInt(selectedClass.startTime.split(':')[0], 10);
      const startTimeMinutes = parseInt(selectedClass.startTime.split(':')[1], 10);
      const endTimeHours = parseInt(selectedClass.endTime.split(':')[0], 10);
      const endTimeMinutes = parseInt(selectedClass.endTime.split(':')[1], 10);

      const startTimeVal = startTimeHours + startTimeMinutes / 60;
      const endTimeVal = endTimeHours + endTimeMinutes / 60;

      const isMidnight = endTimeHours + endTimeMinutes / 60 === 0;
      eventCreateMutation.mutate({
        event: {
          timetableId,
          colour: color,
          dayOfWeek: DAYS_SHORT.indexOf(selectedClass.day),
          start: startTimeVal,
          end: isMidnight ? 24.0 : endTimeVal,
          type: 'TUTORING',
          title: `${courseSelectionRef.current?.value ?? ''} - ${selectedClass.activity}`,
          description: selectedClass.section,
          location: selectedClass.location,
        },
      });
    }, [selectedClass, timetableId, color, eventCreateMutation]);
    useImperativeHandle(ref, () => ({
      handleCreateEvent,
    }));

    return (
      <>
        <StyledListItem>
          <ListItemIcon>
            <Event />
          </ListItemIcon>
          <Autocomplete
            disablePortal
            options={courseList}
            renderInput={(params) => <TextField {...params} label="Course code *" />}
            fullWidth
            autoHighlight
            noOptionsText="No Results"
            onChange={(_, value) => {
              setSelectedCourseId(value ? value.course_id : '');
            }}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.course_id}>
                  {option.course_code}
                </li>
              );
            }}
            getOptionLabel={(option) => option.course_code}
            isOptionEqualToValue={(option, value) =>
              option.course_id === value.course_id && option.course_code === value.course_code
            }
            slotProps={{
              listbox: {
                sx: {
                  maxHeight: '120px',
                },
              },
            }}
          />
        </StyledListItem>
        <StyledListItem>
          <ListItemIcon>
            <Class />
          </ListItemIcon>
          <Autocomplete
            disablePortal
            options={classListOptions}
            ref={courseSelectionRef}
            renderInput={(params) => <TextField {...params} label="Class code *" />}
            fullWidth
            autoHighlight
            noOptionsText="No Results"
            onChange={(_, value) => {
              setSelectedClass(value);
            }}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.classId}>
                  {option.section}
                </li>
              );
            }}
            getOptionLabel={(option) => option.section}
            isOptionEqualToValue={(option, value) => option.classId === value.classId}
            slotProps={{
              listbox: {
                sx: {
                  maxHeight: '120px',
                },
              },
            }}
          />
        </StyledListItem>
      </>
    );
  },
);

CustomEventsTutoringForm.displayName = 'CustomEventsTutoringForm';
export default CustomEventsTutoringForm;
