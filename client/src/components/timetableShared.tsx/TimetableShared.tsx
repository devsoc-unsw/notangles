import React from 'react';
import { TimetableProps } from '../../interfaces/PropTypes';
import Timetable from '../timetable/Timetable';

const TimetableShared: React.FC<TimetableProps> = ({ assignedColors, handleSelectClass }) => {
  return (
    <>
      <div>hi there</div>
      <Timetable assignedColors={assignedColors} handleSelectClass={handleSelectClass} />
    </>
  );
};

export default TimetableShared;
