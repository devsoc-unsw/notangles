import { AccessTime, Close, DesktopMac, LocationOn, PeopleAlt } from '@mui/icons-material';
import {
  Alert,
  Dialog,
  FormControl,
  IconButton,
  List,
  ListItemIcon,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useId, useState } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import { useSetTimetableCourseColour } from '../../../api/timetable/mutations';
import { useTimetableCoursesQuery } from '../../../api/timetable/queries';
import { daysLong, shortDayToIndex } from '../../../constants/timetable';
import {
  StyledDialogContent,
  StyledDialogTitle,
  StyledListItem,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../../styles/ControlStyles';
import { ColorDivider, ColorListItem } from '../../../styles/ExpandedViewStyles';
import ColorPicker from '../controls/ColorPicker';
import { getClassCardMetadata, getClassLocationOptions } from './useTimetableClasses';

const DetailIcon = styled(ListItemIcon)(({ theme }) => ({ color: theme.palette.text.primary }));

/**
 * @param time  When the class runs
 * @param days  A list containing the long forms of the days of the week (e.g. Monday, Tuesday etc.)
 * @param weeks The formatted week information for the class
 * @returns     A string detailing when a class runs
 */
const getTimeData = (time: TimetableClass['times'][number], days: string[], weeks?: string) => {
  const dayIndex = shortDayToIndex[time.day];
  const [startTime, endTime] = time.time.split(' - ');
  return [dayIndex === undefined ? time.day : days.at(dayIndex), startTime, '\u2013', endTime, weeks && `(${weeks})`]
    .filter(Boolean)
    .join(' ');
};

interface ExpandedClassViewProps {
  timetableId: string;
  classData: TimetableClass;
  classes: TimetableClass[];
  timeIndex: number | null;
  handleClose: (classId: string) => void;
}

const ExpandedClassView = ({ timetableId, classData, classes, timeIndex, handleClose }: ExpandedClassViewProps) => {
  const titleId = useId();
  const courses = useTimetableCoursesQuery(timetableId);
  const courseColour = courses.find((course) => course.courseId === classData.course_id)?.colour ?? 'default-1';
  const [colour, setColour] = useState(courseColour);
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);
  const colourMutation = useUpdateTimetableCourseColour();
  const validColour = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colour) || /^default-[1-8]$/.test(colour);
  const [selectedClassId, setSelectedClassId] = useState(classData.class_id);
  // Options are all classes of the same course with the same day, activity, start time and end time
  const locationOptions = timeIndex === null ? [] : getClassLocationOptions(classData, timeIndex, classes);
  const selectedOption = locationOptions.find((option) => option.classData.class_id === selectedClassId);
  const currentClass = selectedOption?.classData ?? classData;
  const currentTimeIndex = selectedOption?.timeIndex ?? timeIndex;
  const time = currentTimeIndex === null ? undefined : currentClass.times.at(currentTimeIndex);
  const metadata =
    currentTimeIndex === null ? undefined : getClassCardMetadata(currentClass, currentTimeIndex, classes);
  const timeDetails = time ? getTimeData(time, daysLong, metadata?.weeks) : 'No scheduled time';

  const close = () => {
    if (colourMutation.isPending) return;
    handleClose(currentClass.class_id);
  };

  // Starts as the course's saved colour. Unsaved changes are discarded when the dialog closes since it is unmounted
  const courses = useTimetableCoursesQuery(timetableId);
  const [color, setColor] = useState(courses.find((course) => course.courseId === classData.course_id)?.colour ?? '');
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);

  // Sends a new course colour to the server. Once saved, the courses are refetched so the class cards update
  const courseColourMutation = useSetTimetableCourseColour();

  const handleOpenColorPicker = (event: React.MouseEvent<HTMLElement>) => {
    setColorPickerAnchorEl(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setColorPickerAnchorEl(null);
  };

  // Saves the picked colour for this course so when class is called later, the colour is known.
  const handleSaveColor = () => {
    courseColourMutation.mutate({ timetableId, courseId: classData.course_id, colour: color });
    close();
  };

  return (
    <Dialog maxWidth="sm" open onClose={close} aria-labelledby={titleId}>
      {/* Close button */}
      <StyledTopIcons>
        <IconButton aria-label="Close class details" onClick={close} disabled={colourMutation.isPending}>
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
            <Typography>{timeDetails}</Typography>
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

          {/* Class color picker */}
          <ColorDivider />
          <ColorListItem>
            <ColorPicker
              color={colour}
              setColor={setColour}
              colorPickerAnchorEl={colorPickerAnchorEl}
              handleOpenColorPicker={(event) => {
                setColorPickerAnchorEl(event.currentTarget);
              }}
              handleCloseColorPicker={() => {
                setColorPickerAnchorEl(null);
              }}
              handleSaveNewColor={handleSaveColour}
              saveDisabled={!validColour || colourMutation.isPending}
              saveLoading={colourMutation.isPending}
            />
          </ColorListItem>
        </List>

        {/* Course colour picker */}
        <ColorDivider />
        <ColorListItem>
          <ColorPicker
            color={color}
            setColor={setColor}
            colorPickerAnchorEl={colorPickerAnchorEl}
            handleOpenColorPicker={handleOpenColorPicker}
            handleCloseColorPicker={handleCloseColorPicker}
            handleSaveNewColor={handleSaveColor}
          />
        </ColorListItem>
      </StyledDialogContent>
    </Dialog>
  );
};

export default ExpandedClassView;
