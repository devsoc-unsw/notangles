import React, { useContext } from 'react';
import { Button } from '@mui/material';
import { CourseContext } from '../../context/CourseContext';
import { AppContext } from '../../context/AppContext';

const WeekSelector = () => {
  const { createdEvents, setCreatedEvents } = useContext(CourseContext);
  const { currentDate, setCurrentDate } = useContext(AppContext);

  const handleBackClick = () => {
    // setCreatedEvents({});
    console.log(createdEvents);
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleForwardClick = () => {
    // setCreatedEvents({
    //   'bdbb4317-3d38-4362-885a-d10e8801b577': {
    //     type: 'event',
    //     subtype: 'General',
    //     event: {
    //       id: 'bdbb4317-3d38-4362-885a-d10e8801b577',
    //       name: 'test',
    //       location: '',
    //       description: '123',
    //       color: '#1F7E8C',
    //     },
    //     time: {
    //       day: 1,
    //       start: 11,
    //       end: 12,
    //     },
    //     date: new Date(),
    //   },
    //   'ec904fae-f6b0-4583-a4e6-c5ec2bd955b8': {
    //     type: 'event',
    //     subtype: 'General',
    //     event: {
    //       id: 'ec904fae-f6b0-4583-a4e6-c5ec2bd955b8',
    //       name: 'test2',
    //       location: '',
    //       description: '',
    //       color: '#a833a3',
    //     },
    //     time: {
    //       day: 2,
    //       start: 13,
    //       end: 15,
    //     },
    //     date: new Date(),
    //   },
    // });
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleBackClick}>
        Back
      </Button>
      <Button variant="contained" color="primary" onClick={handleForwardClick}>
        Forward
      </Button>
    </div>
  );
};

export default WeekSelector;
