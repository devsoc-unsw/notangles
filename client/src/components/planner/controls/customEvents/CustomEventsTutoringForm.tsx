import { Class, Event } from '@mui/icons-material';
import { Autocomplete, ListItemIcon, TextField } from '@mui/material';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { Term, useCourseListQuery, useCoursesClassTimesQuery } from '../../../../api/times/times';
import { StyledListItem } from '../../../../styles/ControlStyles';

interface CustomEventsTutoringFormProps {
  setTutoringEventFormSatisfied: (satisfied: boolean) => void;
  term: Term;
}

const CustomEventsTutoringForm = forwardRef(
  ({ term, setTutoringEventFormSatisfied }: CustomEventsTutoringFormProps, ref) => {
    const courseList = useCourseListQuery(term);

    const [courseCode, setCourseCode] = useState<string>('');
    const [classCode, setClassCode] = useState<{ day: string; time: string } | null>(null);
    const classList = useCoursesClassTimesQuery(courseCode ? [courseCode] : [], term.year, term.term);

    useEffect(() => {
      setTutoringEventFormSatisfied(!!courseCode && !!classCode);
    }, [courseCode, classCode, setTutoringEventFormSatisfied]);

    const handleCreateEvent = () => {
      // TODO: implement tutoring event creation
    };
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
              console.log(value);
              setCourseCode(value ? value.course_code : '');
            }}
            renderOption={(props, option) => {
              return (
                <li {...props} key={option.course_id}>
                  {option.course_code}
                </li>
              );
            }}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.course_code)}
            isOptionEqualToValue={(option, value) =>
              option.course_id === value.course_id && option.course_code === value.course_code
            }
            ListboxProps={{
              style: {
                maxHeight: '120px',
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
            options={classList.length > 0 ? classList[0].times : []}
            renderInput={(params) => <TextField {...params} label="Class code *" />}
            fullWidth
            autoHighlight
            noOptionsText="No Results"
            onChange={(_, value) => {
              setClassCode(value);
            }}
            renderOption={(props, option) => {
              const classTime = `${option.day} ${option.time}`;
              return (
                <li {...props} key={classTime}>
                  {classTime}
                </li>
              );
            }}
            isOptionEqualToValue={(option, value) => option.day === value.day && option.time === value.time}
            ListboxProps={{
              style: {
                maxHeight: '120px',
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
