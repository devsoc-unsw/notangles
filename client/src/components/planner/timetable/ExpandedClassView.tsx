import { AccessTime, Close, DesktopMac, InfoOutlined, LocationOn, School } from '@mui/icons-material';
import { Dialog, IconButton, List, ListItemIcon, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useId } from 'react';

import type { TimetableClass } from '../../../api/times/times';
import { daysLong, shortDayToIndex } from '../../../constants/timetable';
import {
  StyledDialogContent,
  StyledDialogTitle,
  StyledListItem,
  StyledTitleContainer,
  StyledTopIcons,
} from '../../../styles/ControlStyles';

const DetailIcon = styled(ListItemIcon)(({ theme }) => ({ color: theme.palette.text.primary }));

const careerNames: Partial<Record<string, string>> = {
  UGRD: 'Undergraduate',
  PGRD: 'Postgraduate',
};

interface ExpandedClassViewProps {
  classData: TimetableClass;
  timeIndex: number | null;
  handleClose: () => void;
}

const ExpandedClassView = ({ classData, timeIndex, handleClose }: ExpandedClassViewProps) => {
  const titleId = useId();
  const time = timeIndex === null ? undefined : classData.times[timeIndex];
  const dayIndex = time ? shortDayToIndex[time.day] : undefined;

  return (
    <Dialog maxWidth="sm" open onClose={handleClose} aria-labelledby={titleId}>
      <StyledTopIcons>
        <IconButton aria-label="Close class details" onClick={handleClose}>
          <Close />
        </IconButton>
      </StyledTopIcons>
      <StyledDialogTitle id={titleId}>
        <StyledTitleContainer>
          {classData.course.course_code} — {classData.course.course_name}
        </StyledTitleContainer>
      </StyledDialogTitle>
      <StyledDialogContent>
        <List disablePadding>
          <StyledListItem>
            <DetailIcon>
              <DesktopMac />
            </DetailIcon>
            <Typography>
              {classData.activity} ({classData.section})
            </Typography>
          </StyledListItem>
          <StyledListItem>
            <DetailIcon>
              <AccessTime />
            </DetailIcon>
            <Typography>
              {time ? (
                <>
                  {dayIndex === undefined ? time.day : daysLong[dayIndex]} {time.time}
                  {time.weeks && ` (Weeks ${time.weeks})`}
                </>
              ) : (
                'No scheduled time'
              )}
            </Typography>
          </StyledListItem>
          {time && (
            <StyledListItem>
              <DetailIcon>
                <LocationOn />
              </DetailIcon>
              <Typography>{time.location || 'Location unavailable'}</Typography>
            </StyledListItem>
          )}
          {classData.career && (
            <StyledListItem>
              <DetailIcon>
                <School />
              </DetailIcon>
              <Typography>{careerNames[classData.career] ?? classData.career}</Typography>
            </StyledListItem>
          )}
          {classData.status && (
            <StyledListItem>
              <DetailIcon>
                <InfoOutlined />
              </DetailIcon>
              <Typography>Status: {classData.status}</Typography>
            </StyledListItem>
          )}
        </List>
      </StyledDialogContent>
    </Dialog>
  );
};

export default ExpandedClassView;
