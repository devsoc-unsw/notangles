import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Box,
  BoxProps,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogTitleProps,
  Divider,
  Grid,
  IconButton,
  Modal,
  Typography,
} from '@material-ui/core';
import { ExpandedViewProps } from '../../interfaces/PropTypes';
// import styled from 'styled-components';
import CloseIcon from '@material-ui/icons/Close';
import { CardData, isPeriod } from '../../utils/Drag';
import { styled } from '@material-ui/styles';

import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { AccessTime, AccessTimeOutlined, AccessTimeTwoTone, Computer, DesktopMac, DesktopWindows } from '@material-ui/icons';
import { ClassPeriod, ClassTime } from '../../interfaces/Course';
import { AppContext } from '../../context/AppContext';

const StyledDialogTitle = styled(MuiDialogTitle)<DialogTitleProps>(({}) => ({
  padding: '8px 12px 8px 24px',
}));

const to24Hour = (n: number) => (`${String(n/1>>0)}:${String(n % 1)}0`);
const getTimeData = (time: ClassTime, days: string[]) => {
    return [days.at(time.day - 1), to24Hour(time.start), '\u2013', to24Hour(time.end), `(Weeks ${time.weeksString})`].join(' ')
}

const ExpandedView: React.FC<ExpandedViewProps> = ({ cardData, open, handleClose }) => {
  const course = cardData.class.course;
  const {days} = useContext(AppContext)
  const period = isPeriod(cardData) ? cardData : undefined;
  return (
    <Dialog maxWidth="sm" open={open} onClose={() => handleClose()}>
      <StyledDialogTitle>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100%',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{}}>
            {course.code} — {course.name}
          </div>

          <div style={{ width: '8px' }} />

          <div>
            <IconButton aria-label="close" onClick={() => handleClose()}>
              <CloseIcon />
            </IconButton>
          </div>
        </Box>
      </StyledDialogTitle>
      {/* <Divider /> */}
      <DialogContent style={{paddingBottom: '20px'}}>
          <Grid container direction='column' spacing={2}>



              <Grid item container direction='row' spacing={2}>
                  <Grid item>
                  <DesktopWindows/>
                  </Grid>
                  <Grid item>
                    <Typography>{cardData.class.activity}</Typography>
                  </Grid>
              </Grid>


              <Grid item container direction='row' spacing={2}>
                  <Grid item>
                    <AccessTime/>
                  </Grid>
                  <Grid item>
                    <Typography>{period && getTimeData(period.time, days)}</Typography>
                  </Grid>
              </Grid>



          </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ExpandedView;
