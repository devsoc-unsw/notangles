import { AccessTime, Close, DesktopMac, LocationOn, PeopleAlt } from '@mui/icons-material';
import { Dialog, FormControl, IconButton, List, ListItemIcon, MenuItem, Select, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useId, useState } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import { daysLong, shortDayToIndex } from '../../../constants/timetable';
import {
  StyledDialogContent,
  StyledDialogTitle,
  StyledListItem,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../../styles/ControlStyles';
import { getClassCardMetadata, getClassLocationOptions } from './useTimetableClasses';

const DetailIcon = styled(ListItemIcon)(({ theme }) => ({ color: theme.palette.text.primary }));

interface ExpandedClassViewProps {
  classData: TimetableClass;
  classes: TimetableClass[];
  timeIndex: number | null;
  handleClose: (classId: string) => void;
}

const ExpandedClassView = ({ classData, classes, timeIndex, handleClose }: ExpandedClassViewProps) => {
  const titleId = useId();
  const [selectedClassId, setSelectedClassId] = useState(classData.class_id);
  // Options are all classes of the same course with the same day, activity, start time and end time
  const locationOptions = timeIndex === null ? [] : getClassLocationOptions(classData, timeIndex, classes);
  const selectedOption = locationOptions.find((option) => option.classData.class_id === selectedClassId);
  const currentClass = selectedOption?.classData ?? classData;
  const currentTimeIndex = selectedOption?.timeIndex ?? timeIndex;
  const time = currentTimeIndex === null ? undefined : currentClass.times.at(currentTimeIndex);
  const metadata =
    currentTimeIndex === null ? undefined : getClassCardMetadata(currentClass, currentTimeIndex, classes);
  const dayIndex = time ? shortDayToIndex[time.day] : undefined;
  const close = () => {
    handleClose(currentClass.class_id);
  };

  return (
    <Dialog maxWidth="sm" open onClose={close} aria-labelledby={titleId}>
      {/* Close button */}
      <StyledTopIcons>
        <IconButton aria-label="Close class details" onClick={close}>
          <Close />
        </IconButton>
      </StyledTopIcons>

      {/* Course code and name */}
      <StyledDialogTitle id={titleId}>
        <StyledTitleContainer>
          {classData.course.course_code} — {classData.course.course_name}
        </StyledTitleContainer>
      </StyledDialogTitle>

      <StyledDialogContent>
        <List disablePadding>
          {/* Class type and section */}
          <StyledListItem>
            <DetailIcon>
              <DesktopMac />
            </DetailIcon>
            <Typography>
              {currentClass.activity} ({currentClass.section})
            </Typography>
          </StyledListItem>

          {/* Class duration and weeks */}
          <StyledListItem>
            <DetailIcon>
              <AccessTime />
            </DetailIcon>
            <Typography>
              {time ? (
                <>
                  {dayIndex === undefined ? time.day : daysLong[dayIndex]} {time.time}
                  {metadata?.weeks && ` (${metadata.weeks})`}
                </>
              ) : (
                'No scheduled time'
              )}
            </Typography>
          </StyledListItem>

          {/* Drop down box showing all other classes of the same duration */}
          {time && (
            <StyledListItem>
              <DetailIcon>
                <LocationOn />
              </DetailIcon>
              {locationOptions.length > 1 ? (
                <FormControl fullWidth>
                  <Select
                    value={currentClass.class_id}
                    variant="outlined"
                    inputProps={{ 'aria-label': 'Class location' }}
                    onChange={(event) => {
                      setSelectedClassId(event.target.value);
                    }}
                  >
                    {locationOptions.map((option) => (
                      <MenuItem key={option.classData.class_id} value={option.classData.class_id}>
                        {option.location || 'Location unavailable'}
                        {locationOptions.filter((other) => other.location === option.location).length > 1 &&
                          ` (${option.classData.section})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Typography>{(selectedOption?.location ?? time.location) || 'Location unavailable'}</Typography>
              )}
            </StyledListItem>
          )}

          {/* Class capacity */}
          {metadata && (
            <StyledListItem>
              <DetailIcon>
                <PeopleAlt />
              </DetailIcon>
              <Typography>Capacity {metadata.enrolment}</Typography>
            </StyledListItem>
          )}
        </List>
      </StyledDialogContent>
    </Dialog>
  );
};

export default ExpandedClassView;
