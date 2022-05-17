import React from 'react'
import { AccessTime, Close, DesktopMac, LocationOn, Notes, PeopleAlt } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { ExpandedEventViewProps } from '../../interfaces/PropTypes';


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

const StyledDropdownContainer = styled(Grid)`
  flex-grow: 1;
`;

const ExpandedEventView: React.FC<ExpandedEventViewProps> = ({ eventData, popupOpen, handleClose }) => {

  return (
    <div>
      <Dialog open={popupOpen}>
        <StyledDialogTitle>
          <StyledTitleContainer>
            {eventData.name}
            <IconButton aria-label="close" onClick={handleClose}>
              <Close />
            </IconButton>
          </StyledTitleContainer>
        </StyledDialogTitle>


        <StyledDialogContent>
          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <Notes />
            </Grid>
            <Grid item>
              <Typography>{eventData.description}</Typography></Grid>
          </Grid>

          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <LocationOn />
            </Grid>
            <Grid item>
              <Typography>  {eventData.location}</Typography>
            </Grid>
          </Grid>

          {/* <Grid container direction="column" spacing={2}>

          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <AccessTime />
            </Grid>
            <Grid item>
              <Typography>{eventData.time}</Typography>
            </Grid>
          </Grid> */}
          {/*
          <Grid item container direction="row" spacing={2}>
            <Grid item>
              <Notes />
            </Grid>
            <Grid item>
              <Typography>{eventData.description}</Typography></Grid>
          </Grid>
        </Grid>

        <Grid item container direction="row" spacing={2}>
          <Grid item>
            <LocationOn />
          </Grid>
          <Grid item>
            <Typography>  {eventData.location}</Typography>
          </Grid>
        </Grid> */}

          {/* </Grid> */}

        </StyledDialogContent>


      </Dialog>
    </div >
  )
}

export default ExpandedEventView;