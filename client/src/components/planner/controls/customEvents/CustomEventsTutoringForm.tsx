import { Class, Event } from '@mui/icons-material';
import { Autocomplete, ListItemIcon, TextField } from '@mui/material';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { Term, useCourseClassTimesDetailedQuery, useCourseListQuery } from '../../../../api/times/times';
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
      classId: string;
      section: string;
      activity: string;
      events: {
        day: string;
        startTime: string;
        endTime: string;
        location: string;
      }[];
    } | null>(null);

    const courseSelectionRef = useRef<HTMLInputElement>(null);

    const courseList = useCourseListQuery(term);
    const classList = useCourseClassTimesDetailedQuery(selectedCourseId, term.year, term.term);
    const eventCreateMutation = useAddTimetableEvent();

    const classListOptions = useMemo(
      () =>
        classList
          .filter((cls) => cls.times.length > 0 && TUTORING_ACTIVITY_TYPES.includes(cls.activity))
          .map(({ times: cls, class_id, section, activity }) => ({
            classId: class_id,
            section,
            activity,
            events: cls.map((time) => ({
              day: time.day,
              startTime: time.time.split('-')[0].trim(),
              endTime: time.time.split('-')[1].trim(),
              location: time.location,
            })),
          })),
      [classList],
    );

    useEffect(() => {
      setTutoringEventFormSatisfied(!!selectedCourseId && !!selectedClass);
    }, [selectedCourseId, selectedClass, setTutoringEventFormSatisfied]);

    const handleCreateEvent = useCallback(
      (onSuccess: () => void) => {
        if (selectedClass === null) return;

        selectedClass.events.forEach((event) => {
          const startMins = parseInt(event.startTime.split(':')[0], 10) * 60 + parseInt(event.startTime.split(':')[1], 10);
          const endMins = parseInt(event.endTime.split(':')[0], 10) * 60 + parseInt(event.endTime.split(':')[1], 10);
          const isMidnight = endMins === 0;

          eventCreateMutation.mutate(
            {
              event: {
                timetableId,
                colour: color,
                dayOfWeek: DAYS_SHORT.indexOf(event.day),
                start: startMins,
                end: isMidnight ? 24 * 60 : endMins,
                type: 'TUTORING',
                title: `${courseSelectionRef.current?.value ?? ''} - ${selectedClass.activity}`,
                description: selectedClass.section,
                location: event.location,
              },
            },
            { onSuccess },
          );
        });
      },
      [selectedClass, timetableId, color, eventCreateMutation],
    );
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
            isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
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
