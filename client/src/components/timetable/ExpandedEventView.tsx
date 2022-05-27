import React, { useContext, useState } from 'react';
import { AccessTime, Close, Delete, LocationOn, Notes } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { CourseContext } from '../../context/CourseContext';
import { EventTime } from '../../interfaces/Course';
import { ExpandedEventViewProps } from '../../interfaces/PropTypes';
import { useEventDrag } from '../../utils/Drag_v2';

const StyledDialogTitle = styled(DialogTitle)`
  padding: 8px 12px 8px 24px;
`;

const StyledTitleContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-bottom: 20px;
`;

const StyledDialogContent = styled(DialogContent)`
  padding-bottom: 20px;
`;

const ExecuteButton = styled(Button)`
  width: 100%;
  border-radius: 0px 0px 5px 5px;
`;

// const StyledModal = styled(Modal)`
//   display: 'flex';
//   width: 400;
//   background-color: 'white';
// `;

const ExpandedEventView: React.FC<ExpandedEventViewProps> = ({ eventData, popupOpen, handleClose }) => {
  const to24Hour = (n: number) => `${String((n / 1) >> 0)}:${String(n % 1)}0`;
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);

  const updateEventTime = (eventTime: EventTime, eventName: string) => {
    setCreatedEvents({
      ...createdEvents,
      [eventName]: {
        ...createdEvents[eventName],
        time: { ...eventTime },
      },
    });
  };
  useEventDrag(updateEventTime);

  const [isEditing, setIsEditing] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const [newName, setNewName] = useState(eventData.name);
  const [newLocation, setNewLocation] = useState(eventData.location);
  const [newDescription, setNewDescription] = useState(eventData.description);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [openVertMenu, setOpenVertMenu] = useState(false);
  const [anchorVertMenu, setAnchorVertMenu] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
    // console.log("Hello")
    //  console.log( {THECREATEDEVENTOBJECT: createdEvents[id]} )

    // When pressing on pencil icon, text becomes inputfields... in edit mode.

    // Make text an input box when hovering over the text
    // Send new inputted text to the handleEditSave func
  };

  const handleUpdateEvent = (id: string) => {
    setCreatedEvents({
      ...createdEvents,
      [id]: {
        ...createdEvents[id],
        name: newName,
        // time
        location: newLocation,
        description: newDescription,
        // color
      },
    });
    setIsEditing(false);
  };

  const handleCloseDialog = () => {
    // Another dialog to alert user changes have not been saved when in isEditing mode
    if (isEditing && isChanged) {
      setOpenSaveModal(true);
    } else {
      handleClose();
    }
  };

  const handleDeleteEvent = (id: string) => {
    const updatedEventData = { ...createdEvents };
    delete updatedEventData[id];
    setCreatedEvents(updatedEventData);
  };

  const handleDiscard = (id: string) => {
    handleClose();
    setOpenSaveModal(false);
    setIsEditing(false);
    setNewName(eventData.name);
    setNewLocation(eventData.location);
    setNewDescription(eventData.description);
  };

  const handleEditDeleteMenu = (e: any) => {
    setAnchorVertMenu(e.currentTarget);
    setOpenVertMenu(true);
  };

  const handleCloseEditDeleteMenu = () => {
    setAnchorVertMenu(null);
    setOpenVertMenu(false);
  };

  return (
    <div>
      <Dialog PaperProps={{ sx: { minWidth: 600 } }} open={popupOpen} maxWidth="sm" onClose={handleCloseDialog}>
        <Dialog PaperProps={{ sx: { width: '35%', height: '20%' } }} open={openSaveModal} onClose={() => setOpenSaveModal(false)}>
          <StyledTitleContainer>
            <StyledDialogContent>Discard unsaved changes?</StyledDialogContent>
          </StyledTitleContainer>
          <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
            <Button
              onClick={() => {
                setOpenSaveModal(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => handleDiscard(eventData.id)}>Discard</Button>
          </Box>
        </Dialog>

        <StyledDialogTitle>
          <StyledTitleContainer>
            {/* Show input box when in edit mode */}

            {isEditing ? (
              <TextField
                variant="standard"
                value={newName}
                onChange={(e) => {
                  setIsChanged(true);
                  setNewName(e.target.value);
                }}
              />
            ) : (
              <div>{eventData.name}</div>
            )}
            {isEditing ? <Button onClick={() => handleUpdateEvent(eventData.id)}>Save Changes</Button> : <div></div>}

            <IconButton onClick={handleEditDeleteMenu}>
              <MoreVertIcon />
            </IconButton>

            <Menu anchorEl={anchorVertMenu} open={openVertMenu} onClose={handleCloseEditDeleteMenu}>
              <MenuItem>
                <Button onClick={handleEdit}>
                  <EditIcon />
                  Edit Event
                </Button>
              </MenuItem>
            </Menu>

            <IconButton aria-label="close" onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </StyledTitleContainer>
        </StyledDialogTitle>

        {/* Make the dialog same size everytime */}
        <StyledDialogContent>
          <Grid container direction="column" spacing={2}>
            <Grid item container direction="row" spacing={2}>
              <Grid item>
                <AccessTime />
              </Grid>
              <Grid item>
                {/* How should we allow users to change time? Use time picker? */}
                <Typography>
                  {weekdays[eventData.time.day - 1]} {to24Hour(eventData.time.start)} {'\u2013'} {to24Hour(eventData.time.end)}
                </Typography>
              </Grid>
            </Grid>

            {String(eventData.description).length > 0 && (
              <Grid item container direction="row" spacing={2}>
                <Grid item>
                  <Notes />
                </Grid>
                <Grid item>
                  {isEditing ? (
                    <TextField
                      variant="standard"
                      value={newDescription}
                      multiline
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  ) : (
                    <Typography style={{ wordWrap: 'break-word' }}>{eventData.description}</Typography>
                  )}
                </Grid>
              </Grid>
            )}

            <Grid item container direction="row" spacing={2}>
              <Grid item>
                <LocationOn />
              </Grid>
              <Grid item>
                {isEditing ? (
                  <TextField variant="standard" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} multiline />
                ) : (
                  <Typography> {eventData.location}</Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
        </StyledDialogContent>
        <ExecuteButton
          variant="contained"
          color="primary"
          disableElevation
          onClick={() => handleDeleteEvent(eventData.id)} //handleRemoveEvent when I can get it working
        >
          <Delete sx={{ alignSelf: 'center' }} />
          DELETE
        </ExecuteButton>
      </Dialog>
    </div>
  );
};

export default ExpandedEventView;
