import { Event, LocationOn, Notes } from '@mui/icons-material';
import { ListItemIcon, TextField } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';

import { daysShort } from '../../constants/timetable';
import { CustomEventGeneralProps } from '../../interfaces/PropTypes';
import { StyledListItem } from '../../styles/ControlStyles';
import { StyledListItemText, styledInput } from '../../styles/CustomEventStyles';
import { areValidEventTimes } from '../../utils/eventTimes';
import DropdownOption from '../timetable/DropdownOption';

const CustomEventGeneral: React.FC<CustomEventGeneralProps> = ({
  eventName,
  setEventName,
  description,
  setDescription,
  location,
  setLocation,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  eventDays,
  setEventDays,
  initialStartTime,
  initialEndTime,
  initialDay,
  isInitialStartTime,
  setIsInitialStartTime,
  isInitialEndTime,
  setIsInitialEndTime,
  isInitialDay,
  setIsInitialDay,
}) => {
  const handleFormat = (newFormats: string[]) => {
    setEventDays(newFormats);
    setIsInitialDay(false);
  };

  return (
    <>
      <div className='flex flex-col'>
        <div className='mb-1'>
          Details
        </div>
        <div className='relative mb-4'>
          <input
            placeholder='Event Name *'
            defaultValue={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className={styledInput}
          >
          </input>
          <div className="absolute inset-y-0 left-0 pl-3  
                    flex items-center  
                    pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
        </div>
        <div className='relative mb-4'>
          <input
            placeholder='Description'
            defaultValue={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styledInput}
          >
          </input>
          <div className="absolute inset-y-0 left-0 pl-3  
                    flex items-center  
                    pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </div>
        </div>
        <div className='relative'>
          <input
            placeholder='Location'
            defaultValue={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styledInput}
          >
          </input>
          <div className="absolute inset-y-0 left-0 pl-3  
                    flex items-center  
                    pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-9">
        <div className="col-span-5">
          <div>
            Start
          </div>
          <div>
            <TimePicker
              // Displays time as the time of the grid the user pressed
              // when popover has just been opened
              value={isInitialStartTime ? initialStartTime : startTime}
              onChange={(e) => {
                if (e) setStartTime(e);
                setIsInitialStartTime(false);
              }}
              sx={{ width: '145px' }}
            />
          </div>
        </div>
        <div className="col-span-4">
          <div>
            End
          </div>
          <div>
            <TimePicker
              value={isInitialEndTime ? initialEndTime : endTime}
              label={!areValidEventTimes(startTime, endTime) ? 'End time must be after start' : ''}
              slotProps={{ textField: { color: areValidEventTimes(startTime, endTime) ? 'primary' : 'error' } }}
              sx={{ width: '145px' }}
              onChange={(e) => {
                if (e) setEndTime(e);
                setIsInitialEndTime(false);
              }}
            />
          </div>
        </div>
      </div>
      <div>
        <DropdownOption
          optionName="Days"
          optionState={isInitialDay ? [initialDay] : eventDays}
          setOptionState={handleFormat}
          optionChoices={daysShort}
          multiple={true}
          noOff
        />
      </div>
    </>
    // <>
    //   <StyledListItem>
    //     <ListItemIcon>
    //       <Event />
    //     </ListItemIcon>
    //     <TextField
    //       id="outlined-required"
    //       label="Event Name"
    //       onChange={(e) => setEventName(e.target.value)}
    //       variant="outlined"
    //       fullWidth
    //       required
    //       defaultValue={eventName}
    //     />
    //   </StyledListItem>
    //   <StyledListItem>
    //     <ListItemIcon>
    //       <Notes />
    //     </ListItemIcon>
    //     <TextField
    //       id="outlined-basic"
    //       label="Description (optional)"
    //       onChange={(e) => setDescription(e.target.value)}
    //       variant="outlined"
    //       multiline
    //       fullWidth
    //       defaultValue={description}
    //     />
    //   </StyledListItem>
    //   <StyledListItem>
    //     <ListItemIcon>
    //       <LocationOn />
    //     </ListItemIcon>
    //     <TextField
    //       id="outlined-basic"
    //       label="Location (optional)"
    //       onChange={(e) => setLocation(e.target.value)}
    //       variant="outlined"
    //       fullWidth
    //       defaultValue={location}
    //     />
    //   </StyledListItem>
    //   <StyledListItem>
    //     <StyledListItemText primary="Start time" />
    //     <TimePicker
    //       // Displays time as the time of the grid the user pressed
    //       // when popover has just been opened
    //       value={isInitialStartTime ? initialStartTime : startTime}
    //       onChange={(e) => {
    //         if (e) setStartTime(e);
    //         setIsInitialStartTime(false);
    //       }}
    //     />
    //   </StyledListItem>
    //   <StyledListItem>
    //     <StyledListItemText primary="End time" />
    //     <TimePicker
    //       value={isInitialEndTime ? initialEndTime : endTime}
    //       label={!areValidEventTimes(startTime, endTime) ? 'End time must be after start' : ''}
    //       slotProps={{ textField: { color: areValidEventTimes(startTime, endTime) ? 'primary' : 'error' } }}
    //       onChange={(e) => {
    //         if (e) setEndTime(e);
    //         setIsInitialEndTime(false);
    //       }}
    //     />
    //   </StyledListItem>
    //   <DropdownOption
    //     optionName="Days"
    //     optionState={isInitialDay ? [initialDay] : eventDays}
    //     setOptionState={handleFormat}
    //     optionChoices={daysShort}
    //     multiple={true}
    //     noOff
    //   />
    // </>
  );
};

export default CustomEventGeneral;
