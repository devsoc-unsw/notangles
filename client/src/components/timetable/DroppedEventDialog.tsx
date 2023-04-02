import React, { useContext } from 'react';
import { AccessTime, Close, Delete, Edit, LocationOn, Notes } from '@mui/icons-material';
import { Grid, IconButton, ListItemIcon, Typography } from '@mui/material';
import { daysLong } from '../../constants/timetable';
import { CourseContext } from '../../context/CourseContext';
import { DroppedEventDialogProps } from '../../interfaces/PropTypes';
import { StyledListItem } from '../../styles/CustomEventStyles';
import { StyledDialogContent, StyledDialogTitle, StyledTitleContainer } from '../../styles/ExpandedViewStyles';
import { to24Hour } from '../../utils/convertTo24Hour';

const DroppedEventDialog: React.FC<DroppedEventDialogProps> = ({ eventPeriod, handleCloseDialog, setIsEditing, isEditing }) => {
  const { name, location, description } = eventPeriod.event;
  const { day, start, end } = eventPeriod.time;
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const handleDeleteEvent = (id: string) => {
    const updatedEventData = { ...createdEvents };
    delete updatedEventData[id];
    setCreatedEvents(updatedEventData);
  };

  return (
    <>
        <StyledDialogTitle>
        <StyledTitleContainer>
            <>{name}</>
            <Grid container justifyContent="flex-end" alignItems="center">
            <IconButton aria-label="edit" onClick={() => setIsEditing(true)} disabled={isEditing}>
                <Edit />
            </IconButton>
            <IconButton aria-label="delete" onClick={() => handleDeleteEvent(eventPeriod.event.id)}>
                <Delete />
            </IconButton>
            <IconButton aria-label="close" onClick={handleCloseDialog}>
                <Close />
            </IconButton>
            </Grid>
        </StyledTitleContainer>
        </StyledDialogTitle>
        <StyledDialogContent>
        {description.length > 0 && (
            <StyledListItem>
            <ListItemIcon>
                <Notes />
            </ListItemIcon>
            <Typography>{description}</Typography>
            </StyledListItem>
        )}
        <StyledListItem>
            <ListItemIcon>
            <LocationOn />
            </ListItemIcon>
            <Typography>{location}</Typography>
        </StyledListItem>
        <StyledListItem>
            <ListItemIcon>
            <AccessTime />
            </ListItemIcon>
            <Typography>
            {daysLong[day - 1]} {to24Hour(start)} {'\u2013'} {to24Hour(end)}
            </Typography>
        </StyledListItem>
        </StyledDialogContent>
    </>
  );
};

export default DroppedEventDialog;
