import { Add } from '@mui/icons-material';
import { TabContext } from '@mui/lab';
import { Box, Tab, Tabs } from '@mui/material';
import { useMemo, useRef, useState } from 'react';

import { ExecuteButton, StyledList, StyledTabPanel } from '../../../../styles/CustomEventStyles';
import ColorPicker from '../ColorPicker';
import CustomEventsCustomForm from './CustomEventsCustomForm';
import CustomEventsTutoringForm from './CustomEventsTutoringForm';

interface CustomEventsPopoverProps {
  handlePopoverClose: () => void;
  timetableId: string;
}

const CustomEventsPopover = ({ handlePopoverClose, timetableId }: CustomEventsPopoverProps) => {
  const customEventFormRef = useRef<{ handleCreateEvent: () => void }>(null);
  const tutoringEventFormRef = useRef<{ handleCreateEvent: () => void }>(null);

  const [eventType, setEventType] = useState<string>('General');
  const [customEventFormSatisfied, setCustomEventFormSatisfied] = useState<boolean>(false);
  const [tutoringEventFormSatisfied, setTutoringEventFormSatisfied] = useState<boolean>(false);
  const buttonDisabled = useMemo(
    () =>
      (eventType === 'General' && !customEventFormSatisfied) ||
      (eventType === 'Tutoring' && !tutoringEventFormSatisfied),
    [eventType, customEventFormSatisfied, tutoringEventFormSatisfied],
  );
  const [color, setColor] = useState<string>('default-1');
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLElement | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newEventType: string) => {
    setEventType(newEventType);
  };

  const handleCreateEvent = () => {
    if (eventType === 'General') {
      customEventFormRef.current?.handleCreateEvent();
    } else if (eventType === 'Tutoring') {
      tutoringEventFormRef.current?.handleCreateEvent();
    }
    handlePopoverClose();
  };

  return (
    <>
      <StyledList>
        <TabContext value={eventType}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs onChange={handleTabChange} value={eventType} variant="fullWidth">
              <Tab label="General" value="General" />
              <Tab label="Tutoring" value="Tutoring" />
            </Tabs>
          </Box>
          <StyledTabPanel value="General">
            <CustomEventsCustomForm
              ref={customEventFormRef}
              setCustomEventFormSatisfied={setCustomEventFormSatisfied}
              timetableId={timetableId}
              color={color}
            />
          </StyledTabPanel>
          <StyledTabPanel value="Tutoring">
            <CustomEventsTutoringForm
              ref={tutoringEventFormRef}
              setTutoringEventFormSatisfied={setTutoringEventFormSatisfied}
            />
          </StyledTabPanel>
        </TabContext>

        <ColorPicker
          color={color}
          setColor={setColor}
          colorPickerAnchorEl={colorPickerAnchorEl}
          handleOpenColorPicker={(e) => {
            setColorPickerAnchorEl(e.currentTarget);
          }}
          handleCloseColorPicker={() => {
            setColorPickerAnchorEl(null);
          }}
        />
      </StyledList>
      <ExecuteButton
        variant="contained"
        color="primary"
        disableElevation
        disabled={buttonDisabled}
        onClick={handleCreateEvent}
      >
        <Add />
        Create
      </ExecuteButton>
    </>
  );
};

export default CustomEventsPopover;
